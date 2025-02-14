
import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '../types/scholarship';
import { saveScholarshipToDb, recordScholarshipSwipe } from './scholarship/dbOperations';
import { calculateMatchScore } from './scholarship/matchingLogic';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchScholarships = async (page: number = 1, timestamp: number = Date.now()): Promise<Scholarship[]> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to view scholarships');

      // Get user profile data
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!userProfile) {
        console.error('No user profile found');
        throw new Error('User profile not found');
      }

      // Ensure all required fields are present with default values if needed
      const normalizedUserProfile = {
        id: userProfile.id,
        full_name: userProfile.full_name || '',
        birth_date: userProfile.birth_date || null,
        gender: userProfile.gender || '',
        ethnicity: userProfile.ethnicity || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip_code: userProfile.zip_code || '',
        gpa: userProfile.gpa ? parseFloat(userProfile.gpa.toString()) : null,
        sat_score: userProfile.sat_score ? parseInt(userProfile.sat_score.toString()) : null,
        act_score: userProfile.act_score ? parseInt(userProfile.act_score.toString()) : null,
        current_education_level: userProfile.current_education_level || '',
        intended_major: userProfile.intended_major || '',
        first_generation_student: Boolean(userProfile.first_generation_student),
        essay_personal_statement: userProfile.essay_personal_statement || '',
        rewards_achievements: Array.isArray(userProfile.rewards_achievements) ? userProfile.rewards_achievements : [],
        volunteering_experience: Array.isArray(userProfile.volunteering_experience) ? userProfile.volunteering_experience : [],
        organizations: Array.isArray(userProfile.organizations) ? userProfile.organizations : [],
        keywords: Array.isArray(userProfile.keywords) ? userProfile.keywords : [],
        high_school_graduated: Boolean(userProfile.high_school_graduated)
      };

      console.log('Calling discover-scholarships with normalized user profile:', normalizedUserProfile, 'page:', page, 'timestamp:', timestamp);

      const { data, error } = await supabase.functions.invoke(
        'discover-scholarships',
        {
          body: {
            userProfile: normalizedUserProfile,
            page,
            timestamp
          }
        }
      );

      if (error) {
        console.error('Error calling discover-scholarships:', error);
        throw error;
      }

      // If no data or scholarships returned, return empty array
      if (!data?.scholarships) {
        console.log('No scholarships returned from discover-scholarships');
        return [];
      }

      // Process scholarships one by one to ensure proper handling
      for (const scholarship of data.scholarships) {
        const { id: _, ...scholarshipData } = scholarship;
        
        try {
          // Try to insert first
          const { error: insertError } = await supabase
            .from('scholarships')
            .insert([{
              ...scholarshipData,
              title: scholarshipData.title,
              amount: scholarshipData.amount,
              deadline: scholarshipData.deadline,
              provider: scholarshipData.provider,
              url: scholarshipData.url,
              description: scholarshipData.description,
              category: scholarshipData.category || 'General',
              requirements: scholarshipData.requirements || [],
            }]);

          if (insertError && insertError.code === '23505') { // Unique violation
            // If insert fails due to duplicate, try update
            const { error: updateError } = await supabase
              .from('scholarships')
              .update({
                title: scholarshipData.title,
                amount: scholarshipData.amount,
                deadline: scholarshipData.deadline,
                provider: scholarshipData.provider,
                description: scholarshipData.description,
                category: scholarshipData.category || 'General',
                requirements: scholarshipData.requirements || [],
                updated_at: new Date().toISOString(),
              })
              .eq('url', scholarshipData.url);

            if (updateError) {
              console.error('Error updating scholarship:', updateError, scholarshipData);
            }
          } else if (insertError) {
            console.error('Error inserting scholarship:', insertError, scholarshipData);
          }
        } catch (error) {
          console.error('Exception processing scholarship:', error, scholarshipData);
        }
      }

      // Get all swiped scholarship IDs for the current user
      const { data: swipedScholarships } = await supabase
        .from('swiped_scholarships')
        .select('scholarship_id, swiped_right')
        .eq('profile_id', user.id);

      // Get saved scholarship IDs
      const { data: savedScholarships } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('profile_id', user.id);

      // Get IDs of right-swiped or saved scholarships to filter out
      const excludeIds = new Set([
        ...(swipedScholarships?.filter(s => s.swiped_right).map(s => s.scholarship_id) || []),
        ...(savedScholarships?.map(s => s.scholarship_id) || [])
      ]);

      // Fetch the scholarships from the database using the URLs
      const scholarshipUrls = data.scholarships.map(s => s.url);
      const { data: dbScholarships, error: fetchError } = await supabase
        .from('scholarships')
        .select('*')
        .in('url', scholarshipUrls);

      if (fetchError) {
        console.error('Error fetching scholarships:', fetchError);
        return [];
      }

      if (!dbScholarships || dbScholarships.length === 0) {
        console.log('No scholarships found in database');
        return [];
      }

      // Filter out swiped/saved scholarships and calculate match scores
      const scholarships = dbScholarships
        .filter((s: Scholarship) => !excludeIds.has(s.id))
        .map((s: Scholarship) => ({
          ...s,
          match_score: calculateMatchScore(s, userProfile)
        }))
        .sort((a: Scholarship, b: Scholarship) => (b.match_score || 0) - (a.match_score || 0));

      console.log('Returning filtered scholarships:', scholarships);
      return scholarships;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await wait(RETRY_DELAY * retries); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('Max retries reached when fetching scholarships');
};

export const saveScholarship = async (scholarshipId: string) => {
  return saveScholarshipToDb(scholarshipId);
};

export const recordLeftSwipe = async (scholarshipId: string) => {
  return recordScholarshipSwipe(scholarshipId, false);
};
