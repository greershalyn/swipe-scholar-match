
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Scholarship, UserProfile } from './types.ts';

export async function fetchLocalScholarships(supabase: ReturnType<typeof createClient>, userProfile: UserProfile, timestamp: number) {
  console.log('Fetching local scholarships for user:', userProfile.id);
  
  // Get all existing scholarship IDs for the user
  const { data: existingScholarships, error: existingError } = await supabase
    .from('swiped_scholarships')
    .select('scholarship_id')
    .eq('profile_id', userProfile.id);

  if (existingError) {
    console.error('Error fetching existing scholarships:', existingError);
    return null;
  }

  const existingIds = existingScholarships?.map(s => s.scholarship_id) || [];
  
  // Build the base query
  let query = supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .gt('deadline', new Date().toISOString());

  // Add location-based filtering if state is provided
  if (userProfile.state) {
    query = query.or(`description.ilike.%${userProfile.state}%,title.ilike.%${userProfile.state}%`);
  }

  // Only exclude existing scholarships if there are any
  if (existingIds.length > 0) {
    query = query.not('id', 'in', `(${existingIds.map(id => `'${id}'`).join(',')})`);
  }

  // Complete the query
  const { data: localScholarships, error: localError } = await query
    .order('created_at', { ascending: false })
    .limit(10);

  if (localError) {
    console.error('Error fetching local scholarships:', localError);
    return null;
  }

  console.log(`Found ${localScholarships?.length || 0} local scholarships`);
  return localScholarships;
}

export async function insertScholarships(supabase: ReturnType<typeof createClient>, scholarships: Scholarship[]) {
  const timestamp = new Date().toISOString();
  const insertedScholarships = [];
  
  for (const scholarship of scholarships) {
    // Check if scholarship already exists
    const { data: existing } = await supabase
      .from('scholarships')
      .select('id')
      .eq('title', scholarship.title)
      .eq('provider', scholarship.provider)
      .single();

    if (!existing) {
      const { error: insertError, data: inserted } = await supabase
        .from('scholarships')
        .insert([{
          ...scholarship,
          created_at: timestamp,
          updated_at: timestamp,
          is_active: true,
          last_verified_at: timestamp
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting scholarship:', insertError);
      } else if (inserted) {
        insertedScholarships.push(inserted);
      }
    }
  }

  console.log(`Successfully inserted ${insertedScholarships.length} new scholarships`);
  return insertedScholarships;
}

export function generateScholarshipUrl(title: string, provider: string): string {
  const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '-');
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
  return `https://www.scholarships.com/${normalizedProvider}/${normalizedTitle}`;
}
