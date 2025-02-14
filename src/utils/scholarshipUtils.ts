
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

      console.log('Current user:', user.id);

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

      console.log('User profile:', userProfile);
      console.log('Calling discover-scholarships with params:', { page, timestamp });

      const { data: discoveredData, error } = await supabase.functions.invoke(
        'discover-scholarships',
        {
          body: {
            userProfile,
            page,
            timestamp
          }
        }
      );

      console.log('Raw response from discover-scholarships:', discoveredData);

      if (error) {
        console.error('Error from discover-scholarships:', error);
        throw error;
      }

      // Direct database query as backup
      if (!discoveredData?.scholarships || !Array.isArray(discoveredData.scholarships) || discoveredData.scholarships.length === 0) {
        console.log('No scholarships from edge function, trying direct database query...');
        const { data: directScholarships, error: directError } = await supabase
          .from('scholarships')
          .select('*')
          .eq('is_active', true)
          .gt('deadline', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10)
          .range((page - 1) * 10, page * 10 - 1);

        if (directError) {
          console.error('Error in direct database query:', directError);
          throw directError;
        }

        if (directScholarships && directScholarships.length > 0) {
          console.log('Found scholarships via direct query:', directScholarships.length);
          discoveredData.scholarships = directScholarships;
        }
      }

      if (!discoveredData?.scholarships || !Array.isArray(discoveredData.scholarships)) {
        console.error('Invalid response format from discover-scholarships');
        throw new Error('Invalid response format from discover-scholarships');
      }

      // Get all swiped scholarship IDs for the current user
      const { data: swipedScholarships } = await supabase
        .from('swiped_scholarships')
        .select('scholarship_id, swiped_right')
        .eq('profile_id', user.id);

      console.log('Swiped scholarships:', swipedScholarships);

      // Get saved scholarship IDs
      const { data: savedScholarships } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('profile_id', user.id);

      console.log('Saved scholarships:', savedScholarships);

      // Get IDs of right-swiped or saved scholarships to filter out
      const excludeIds = new Set([
        ...(swipedScholarships?.filter(s => s.swiped_right).map(s => s.scholarship_id) || []),
        ...(savedScholarships?.map(s => s.scholarship_id) || [])
      ]);

      console.log('Excluding scholarship IDs:', Array.from(excludeIds));

      // Filter out swiped/saved scholarships and calculate match scores
      const scholarships = discoveredData.scholarships
        .filter((s: Scholarship) => !excludeIds.has(s.id))
        .map((scholarship: Scholarship) => ({
          ...scholarship,
          match_score: calculateMatchScore(scholarship, userProfile)
        }))
        .sort((a: Scholarship, b: Scholarship) => (b.match_score || 0) - (a.match_score || 0));

      console.log('Final filtered scholarships:', scholarships.length);
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
