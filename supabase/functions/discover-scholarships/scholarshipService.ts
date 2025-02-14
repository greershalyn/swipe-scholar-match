
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Scholarship, UserProfile } from './types.ts';

export async function fetchLocalScholarships(supabase: ReturnType<typeof createClient>, userProfile: UserProfile, timestamp: number) {
  const { data: localScholarships, error: localError } = await supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .gt('deadline', new Date().toISOString())
    .lt('created_at', new Date(timestamp).toISOString())
    .or(`description.ilike.%${userProfile.state}%,description.ilike.%${userProfile.city}%`)
    .order('created_at', { ascending: false });

  if (localError) {
    console.error('Error fetching local scholarships:', localError);
    return null;
  }

  return localScholarships;
}

export async function insertScholarships(supabase: ReturnType<typeof createClient>, scholarships: Scholarship[]) {
  for (const scholarship of scholarships) {
    const { error: insertError } = await supabase
      .from('scholarships')
      .upsert([scholarship]);

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
