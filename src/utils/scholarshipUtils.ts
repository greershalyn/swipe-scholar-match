
import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '../types/scholarship';
import { saveScholarshipToDb, recordScholarshipSwipe } from './scholarship/dbOperations';
import { mockScholarships } from './scholarship/mockData';
import { calculateMatchScore } from './scholarship/matchingLogic';

export const fetchScholarships = async (): Promise<Scholarship[]> => {
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
      return mockScholarships;
    }

    console.log('Calling discover-scholarships with user profile:', userProfile);

    // Call the discover-scholarships function to get AI-powered recommendations
    const { data, error } = await supabase.functions.invoke('discover-scholarships', {
      body: { userProfile }
    });

    if (error) {
      console.error('Error calling discover-scholarships:', error);
      return mockScholarships;
    }

    if (!data?.scholarships) {
      console.log('No scholarships returned, using mock data as fallback');
      return mockScholarships;
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

    // Get all scholarships from the database
    const { data: scholarships } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .order('last_verified_at', { ascending: false });

    if (!scholarships?.length) {
      console.log('No scholarships found in database, using mock data');
      return mockScholarships.filter(s => !excludeIds.has(s.id));
    }

    return scholarships
      .filter(s => !excludeIds.has(s.id))
      .map(s => ({
        ...s,
        match_score: calculateMatchScore(s, userProfile)
      }));
  } catch (error) {
    console.error('Error in fetchScholarships:', error);
    // Fallback to mock data if there's an error
    console.log('Using mock scholarship data as fallback');
    return mockScholarships;
  }
};

export const saveScholarship = async (scholarshipId: string) => {
  return saveScholarshipToDb(scholarshipId);
};

export const recordLeftSwipe = async (scholarshipId: string) => {
  return recordScholarshipSwipe(scholarshipId, false);
};
