
export interface UserProfile {
  id: string;
  created_at?: string;
  updated_at?: string;
  full_name?: string;
  birth_date?: string;
  gender?: string;
  ethnicity?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  gpa?: number;
  sat_score?: number;
  act_score?: number;
  current_education_level?: string;
  intended_major?: string;
  extracurricular_activities?: string[] | null;
  awards_honors?: string[] | null;
  financial_need?: boolean;
  household_income?: number | null;
  first_generation_student?: boolean;
  military_affiliation?: string;
  disability_status?: boolean;
  essay_personal_statement?: string;
  rewards_achievements?: string[];
  volunteering_experience?: string[];
  organizations?: string[];
  account_active?: boolean;
  high_school_graduated?: boolean;
  keywords?: string[];
}

export interface Scholarship {
  title: string;
  amount: number;
  deadline: string;
  requirements: string[];
  provider: string;
  url: string;
  description: string;
}
