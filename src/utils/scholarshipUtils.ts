
import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '../types/scholarship';
import { saveScholarshipToDb, recordScholarshipSwipe } from './scholarship/dbOperations';
import { calculateMatchScore } from './scholarship/matchingLogic';

export const fetchScholarships = async (page: number = 1, timestamp: number = Date.now()): Promise<Scholarship[]> => {
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

    // Call the discover-scholarships function to get AI-powered recommendations
    const { data, error } = await supabase.functions.invoke('discover-scholarships', {
      body: { 
        userProfile: normalizedUserProfile,
        page, 
        timestamp 
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error calling discover-scholarships:', error);
      throw error;
    }

    // If no data or scholarships returned, return empty array
    if (!data?.scholarships) {
      console.log('No scholarships returned from discover-scholarships');
      return [];
    }

    // First, insert the scholarships into the scholarships table if they don't exist
    for (const scholarship of data.scholarships) {
      const { error: upsertError } = await supabase
        .from('scholarships')
        .upsert(
          {
            id: scholarship.id,
            title: scholarship.title,
            amount: scholarship.amount,
            deadline: scholarship.deadline,
            provider: scholarship.provider,
            url: scholarship.url,
            description: scholarship.description,
            category: scholarship.category || 'General',
            requirements: scholarship.requirements || [],
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('Error upserting scholarship:', upsertError);
        throw upsertError;
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

    // Filter out swiped/saved scholarships and calculate match scores
    const scholarships = data.scholarships
      .filter((s: Scholarship) => !excludeIds.has(s.id))
      .map((s: Scholarship) => ({
        ...s,
        match_score: calculateMatchScore(s, userProfile)
      }))
      .sort((a: Scholarship, b: Scholarship) => (b.match_score || 0) - (a.match_score || 0));

    console.log('Returning filtered scholarships:', scholarships);
    return scholarships;
  } catch (error) {
    console.error('Error in fetchScholarships:', error);
    throw error;
  }
};

export const saveScholarship = async (scholarshipId: string) => {
  return saveScholarshipToDb(scholarshipId);
};

export const recordLeftSwipe = async (scholarshipId: string) => {
  return recordScholarshipSwipe(scholarshipId, false);
};
