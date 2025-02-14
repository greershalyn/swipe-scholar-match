
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Scholarship, UserProfile } from './types.ts';

export async function fetchLocalScholarships(supabase: ReturnType<typeof createClient>, userProfile: UserProfile, timestamp: number) {
  // Get all existing scholarship IDs for the user
  const { data: existingScholarships, error: existingError } = await supabase
    .from('swiped_scholarships')
    .select('scholarship_id')
    .eq('profile_id', userProfile.id);

  if (existingError) {
    console.error('Error fetching existing scholarships:', existingError);
    return null;
  }

  const existingIds = new Set((existingScholarships || []).map(s => s.scholarship_id));

  // Fetch local scholarships, excluding ones the user has already seen
  const { data: localScholarships, error: localError } = await supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .gt('deadline', new Date().toISOString())
    .not('id', 'in', `(${Array.from(existingIds).map(id => `'${id}'`).join(',')})`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (localError) {
    console.error('Error fetching local scholarships:', localError);
    return null;
  }

  return localScholarships;
}

export async function insertScholarships(supabase: ReturnType<typeof createClient>, scholarships: Scholarship[]) {
  const timestamp = new Date().toISOString();
  
  for (const scholarship of scholarships) {
    const { error: insertError } = await supabase
      .from('scholarships')
      .insert([{
        ...scholarship,
        created_at: timestamp,
        updated_at: timestamp,
        is_active: true,
        last_verified_at: timestamp
      }]);

    if (insertError) {
      console.error('Error inserting scholarship:', insertError);
    }
  }
}

export function generateScholarshipUrl(title: string, provider: string): string {
  const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
  return `https://www.scholarships.com/${normalizedProvider}/${normalizedTitle}`;
}
