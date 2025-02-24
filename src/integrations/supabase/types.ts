export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          account_active: boolean | null
          act_score: number | null
          address: string | null
          awards_honors: string[] | null
          birth_date: string | null
          city: string | null
          college_university: string | null
          created_at: string
          current_education_level: string | null
          disability_status: boolean | null
          dual_enrollment: boolean | null
          essay_personal_statement: string | null
          ethnicity: string | null
          extracurricular_activities: string[] | null
          financial_need: boolean | null
          first_generation_student: boolean | null
          full_name: string | null
          gender: string | null
          gpa: number | null
          high_school_graduated: boolean | null
          household_income: number | null
          id: string
          intended_major: string | null
          keywords: string[] | null
          military_affiliation: string | null
          organizations: string[] | null
          rewards_achievements: string[] | null
          sat_score: number | null
          state: string | null
          subscription_tier: string | null
          updated_at: string
          volunteering_experience: string[] | null
          zip_code: string | null
        }
        Insert: {
          account_active?: boolean | null
          act_score?: number | null
          address?: string | null
          awards_honors?: string[] | null
          birth_date?: string | null
          city?: string | null
          college_university?: string | null
          created_at?: string
          current_education_level?: string | null
          disability_status?: boolean | null
          dual_enrollment?: boolean | null
          essay_personal_statement?: string | null
          ethnicity?: string | null
          extracurricular_activities?: string[] | null
          financial_need?: boolean | null
          first_generation_student?: boolean | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          high_school_graduated?: boolean | null
          household_income?: number | null
          id: string
          intended_major?: string | null
          keywords?: string[] | null
          military_affiliation?: string | null
          organizations?: string[] | null
          rewards_achievements?: string[] | null
          sat_score?: number | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          volunteering_experience?: string[] | null
          zip_code?: string | null
        }
        Update: {
          account_active?: boolean | null
          act_score?: number | null
          address?: string | null
          awards_honors?: string[] | null
          birth_date?: string | null
          city?: string | null
          college_university?: string | null
          created_at?: string
          current_education_level?: string | null
          disability_status?: boolean | null
          dual_enrollment?: boolean | null
          essay_personal_statement?: string | null
          ethnicity?: string | null
          extracurricular_activities?: string[] | null
          financial_need?: boolean | null
          first_generation_student?: boolean | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          high_school_graduated?: boolean | null
          household_income?: number | null
          id?: string
          intended_major?: string | null
          keywords?: string[] | null
          military_affiliation?: string | null
          organizations?: string[] | null
          rewards_achievements?: string[] | null
          sat_score?: number | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          volunteering_experience?: string[] | null
          zip_code?: string | null
        }
        Relationships: []
      }
      saved_scholarships: {
        Row: {
          applied: boolean
          created_at: string
          id: string
          profile_id: string
          scholarship_id: string
        }
        Insert: {
          applied?: boolean
          created_at?: string
          id?: string
          profile_id: string
          scholarship_id: string
        }
        Update: {
          applied?: boolean
          created_at?: string
          id?: string
          profile_id?: string
          scholarship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_scholarships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_applications: {
        Row: {
          id: string
          profile_id: string
          scholarship_id: string
          status: string
          submitted_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          scholarship_id: string
          status?: string
          submitted_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          scholarship_id?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_applications_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number
          category: string
          created_at: string
          deadline: string
          description: string
          id: string
          is_active: boolean
          last_crawled_at: string | null
          last_verified_at: string | null
          match_score: number | null
          provider: string
          requirements: string[]
          source_url: string | null
          title: string
          updated_at: string
          url: string
          verified: boolean | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          deadline: string
          description?: string
          id?: string
          is_active?: boolean
          last_crawled_at?: string | null
          last_verified_at?: string | null
          match_score?: number | null
          provider?: string
          requirements?: string[]
          source_url?: string | null
          title: string
          updated_at?: string
          url?: string
          verified?: boolean | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deadline?: string
          description?: string
          id?: string
          is_active?: boolean
          last_crawled_at?: string | null
          last_verified_at?: string | null
          match_score?: number | null
          provider?: string
          requirements?: string[]
          source_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          profile_id: string
          status: string
          subscription_type: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          profile_id: string
          status: string
          subscription_type: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          profile_id?: string
          status?: string
          subscription_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swiped_scholarships: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          scholarship_id: string
          swiped_right: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          scholarship_id: string
          swiped_right: boolean
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          scholarship_id?: string
          swiped_right?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_premium_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      remove_expired_scholarships: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
