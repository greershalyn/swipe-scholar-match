
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export const saveScholarshipToDb = async (scholarshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to save scholarships');

  try {
    // First check if scholarship is already swiped
    const { data: existingSwipe, error: swipeError } = await supabase
      .from('swiped_scholarships')
      .select('id')
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (swipeError) throw swipeError;

    if (existingSwipe) {
      // Update existing swipe record
      const { error: updateError } = await supabase
        .from('swiped_scholarships')
        .update({ swiped_right: true })
        .eq('scholarship_id', scholarshipId)
        .eq('profile_id', user.id);

      if (updateError) throw updateError;
    } else {
      // Create new swipe record
      const { error: insertError } = await supabase
        .from('swiped_scholarships')
        .insert([{ 
          scholarship_id: scholarshipId, 
          profile_id: user.id,
          swiped_right: true
        }]);

      if (insertError) throw insertError;
    }

    // Check if scholarship is already saved
    const { data: existingSave, error: saveCheckError } = await supabase
      .from('saved_scholarships')
      .select('id')
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (saveCheckError) throw saveCheckError;

    if (existingSave) {
      throw new Error('You have already saved this scholarship');
    }

    // Save the scholarship
    const { error: saveError } = await supabase
      .from('saved_scholarships')
      .insert([{ 
        scholarship_id: scholarshipId, 
        profile_id: user.id,
        applied: false
      }]);

    if (saveError) {
      console.error('Error saving scholarship:', saveError);
      throw saveError;
    }

  } catch (error) {
    console.error('Error in saveScholarshipToDb:', error);
    throw error;
  }
};

export const recordScholarshipSwipe = async (scholarshipId: string, swipedRight: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  try {
    // First check if scholarship is already swiped
    const { data: existingSwipe, error: checkError } = await supabase
      .from('swiped_scholarships')
      .select('id')
      .eq('scholarship_id', scholarshipId)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingSwipe) {
      // Update existing swipe record
      const { error: updateError } = await supabase
        .from('swiped_scholarships')
        .update({ swiped_right: swipedRight })
        .eq('scholarship_id', scholarshipId)
        .eq('profile_id', user.id);

      if (updateError) throw updateError;
    } else {
      // Create new swipe record
      const { error: insertError } = await supabase
        .from('swiped_scholarships')
        .insert([{ 
          scholarship_id: scholarshipId, 
          profile_id: user.id,
          swiped_right: swipedRight
        }]);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error in recordScholarshipSwipe:', error);
    throw error;
  }
};
