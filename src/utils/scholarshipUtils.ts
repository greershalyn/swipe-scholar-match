
import { supabase } from '@/integrations/supabase/client';
import { Scholarship } from '../types/scholarship';
import { toast } from "@/components/ui/use-toast";

export const fetchScholarships = async (): Promise<Scholarship[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to view scholarships');

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

  // First, try to get scholarships that haven't been swiped on
  let { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (!scholarships) throw new Error('Failed to fetch scholarships');

  // Filter out already saved or right-swiped scholarships
  scholarships = scholarships.filter(s => !excludeIds.has(s.id));

  // If no new scholarships, get left-swiped ones
  if (scholarships.length === 0 && swipedScholarships?.some(s => !s.swiped_right)) {
    const leftSwipedIds = swipedScholarships
      .filter(s => !s.swiped_right)
      .map(s => s.scholarship_id);

    const { data: leftSwipedScholarships } = await supabase
      .from('scholarships')
      .select('*')
      .in('id', leftSwipedIds)
      .order('created_at', { ascending: false });

    scholarships = leftSwipedScholarships || [];

    if (scholarships.length > 0) {
      toast({
        title: "Reviewing Previous Scholarships",
        description: "Here are some scholarships you previously skipped.",
        duration: 5000,
      });
    }
  }

  return scholarships;
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
