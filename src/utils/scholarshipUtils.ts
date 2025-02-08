import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '../types/scholarship';
import { toast } from "@/components/ui/use-toast";

// Mock scholarship data for testing
const mockScholarships: Scholarship[] = [
  {
    id: 'mock-1',
    title: 'STEM Excellence Scholarship',
    amount: 5000,
    deadline: '2024-12-31',
    category: 'STEM',
    description: 'For outstanding students pursuing degrees in Science, Technology, Engineering, or Mathematics.',
    requirements: [
      'Minimum 3.5 GPA',
      'Pursuing STEM degree',
      'Full-time enrollment',
      'US citizen or permanent resident'
    ],
    provider: 'Future Tech Foundation',
    url: 'https://example.com/stem-scholarship',
    match_score: 95
  },
  {
    id: 'mock-2',
    title: 'First Generation Student Award',
    amount: 3000,
    deadline: '2024-11-30',
    category: 'First Generation',
    description: 'Supporting first-generation college students in their academic journey.',
    requirements: [
      'First-generation college student',
      'Minimum 3.0 GPA',
      'Demonstrated financial need',
      'Community involvement'
    ],
    provider: 'Education Access Foundation',
    url: 'https://example.com/firstgen-scholarship',
    match_score: 88
  },
  {
    id: 'mock-3',
    title: 'Creative Arts Grant',
    amount: 2500,
    deadline: '2024-10-15',
    category: 'Arts',
    description: 'Supporting talented students in visual arts, music, theater, or creative writing.',
    requirements: [
      'Portfolio submission',
      'Arts major or minor',
      'Letter of recommendation',
      'Essay submission'
    ],
    provider: 'Arts Alliance',
    url: 'https://example.com/arts-grant',
    match_score: 75
  }
];

export const fetchScholarships = async (): Promise<Scholarship[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to view scholarships');

  // Get user profile data
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // For now, return mock data instead of calling the discover-scholarships function
  console.log('Using mock scholarship data for testing');
  
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

  // Filter out already saved or right-swiped scholarships from mock data
  return mockScholarships.filter(s => !excludeIds.has(s.id));
};

export const saveScholarship = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to save scholarships');

  // First check if scholarship is already swiped
  const { data: existingSwipe } = await supabase
    .from('swiped_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSwipe) {
    // Update existing swipe record instead of creating a new one
    const { error: swipeError } = await supabase
      .from('swiped_scholarships')
      .update({ swiped_right: true })
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id);

    if (swipeError) throw swipeError;
  } else {
    // Create new swipe record
    const { error: swipeError } = await supabase
      .from('swiped_scholarships')
      .insert([{ 
        scholarship_id: scholarshipId, 
        profile_id: user.id,
        swiped_right: true
      }]);

    if (swipeError) throw swipeError;
  }

  // Check if scholarship is already saved
  const { data: existingSave } = await supabase
    .from('saved_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSave) {
    throw new Error('You have already saved this scholarship');
  }

  // Save the scholarship
  const { error } = await supabase
    .from('saved_scholarships')
    .insert([{ scholarship_id: scholarshipId, profile_id: user.id }]);

  if (error) throw error;
};

export const recordLeftSwipe = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  // First check if scholarship is already swiped
  const { data: existingSwipe } = await supabase
    .from('swiped_scholarships')
    .select('id')
    .eq('scholarship_id', scholarshipId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingSwipe) {
    // Update existing swipe record instead of creating a new one
    const { error } = await supabase
      .from('swiped_scholarships')
      .update({ swiped_right: false })
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id);

    if (error) throw error;
  } else {
    // Create new swipe record
    const { error } = await supabase
      .from('swiped_scholarships')
      .insert([{ 
        scholarship_id: scholarshipId, 
        profile_id: user.id,
        swiped_right: false
      }]);

    if (error) throw error;
  }
};
