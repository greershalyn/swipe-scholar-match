
export interface Scholarship {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  category: string;
  description: string;
  requirements: string[];
  url: string;
  provider: string;
  match_score?: number;
  source_url?: string;  // Added this field as optional
}
