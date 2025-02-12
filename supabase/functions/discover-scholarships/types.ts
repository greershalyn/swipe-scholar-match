
export interface UserProfile {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  ethnicity: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  gpa: number | null;
  sat_score: number | null;
  act_score: number | null;
  current_education_level: string;
  intended_major: string;
  first_generation_student: boolean;
  essay_personal_statement: string;
  rewards_achievements: string[];
  volunteering_experience: string[];
  organizations: string[];
  keywords: string[];
  high_school_graduated: boolean;
}

export interface Scholarship {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  requirements: string[];
  provider: string;
  url: string;
  description: string;
  category?: string;
  match_score?: number;
}
