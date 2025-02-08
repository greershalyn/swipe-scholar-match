
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export const saveScholarshipToDb = async (scholarshipId: string) => {
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

export const recordScholarshipSwipe = async (scholarshipId: string, swipedRight: boolean) => {
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
      .update({ swiped_right: swipedRight })
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
        swiped_right: swipedRight
      }]);

    if (error) throw error;
  }
};

