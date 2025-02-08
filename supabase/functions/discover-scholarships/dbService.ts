
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Scholarship } from './types.ts';

export async function storeScholarships(scholarships: Scholarship[], supabase: ReturnType<typeof createClient>) {
  for (const scholarship of scholarships) {
    const { data: existingScholarship, error: checkError } = await supabase
      .from('scholarships')
      .select('id')
      .eq('url', scholarship.url)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing scholarship:', checkError);
      continue;
    }

    if (!existingScholarship) {
      const { error: insertError } = await supabase
        .from('scholarships')
        .insert([{
          title: scholarship.title,
          amount: scholarship.amount,
          deadline: new Date(scholarship.deadline),
          requirements: scholarship.requirements,
          provider: scholarship.provider,
          url: scholarship.url,
          description: scholarship.description,
          category: 'General',
          verified: true,
          is_active: true,
          last_verified_at: new Date(),
        }]);

      if (insertError) {
        console.error('Error inserting scholarship:', insertError);
      }
    }
  }
}
