
import { generateScholarshipUrl } from './scholarshipService.ts';

export function transformScholarships(scholarshipsData: any) {
  if (!scholarshipsData.scholarships || !Array.isArray(scholarshipsData.scholarships)) {
    throw new Error('Invalid scholarship data format from OpenAI');
  }

  return scholarshipsData.scholarships.map(s => ({
    id: crypto.randomUUID(),
    title: String(s.title || '').trim(),
    amount: Number(s.amount) || 0,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + Math.floor(Math.random() * 6) + 1)).toISOString(),
    requirements: Array.isArray(s.requirements) ? s.requirements : [],
    provider: String(s.provider || 'Unknown Provider').trim(),
    url: generateScholarshipUrl(s.title || '', s.provider || 'Unknown Provider'),
    description: String(s.description || '').trim(),
    category: String(s.category || 'General').trim(),
    is_active: true,
    verified: false,
    last_verified_at: new Date().toISOString(),
    source_url: null,
    match_score: null,
    created_at: new Date().toISOString()
  }));
}
