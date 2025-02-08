
export interface UserProfile {
  intended_major?: string;
  gpa?: number;
  current_education_level?: string;
  ethnicity?: string;
  first_generation_student?: boolean;
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

export interface ScholarshipResponse {
  scholarships: Scholarship[];
}
