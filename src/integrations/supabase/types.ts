export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      allowed_school_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_active: boolean
          school_name: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          school_name: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          school_name?: string
        }
        Relationships: []
      }
      coupon_analytics: {
        Row: {
          coupon_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_analytics_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category: string | null
          coupon_code: string | null
          created_at: string
          deal_type: string
          description: string | null
          discount_value: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          merchant_name: string
          merchant_url: string | null
          owner_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          coupon_code?: string | null
          created_at?: string
          deal_type?: string
          description?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          merchant_name: string
          merchant_url?: string | null
          owner_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          coupon_code?: string | null
          created_at?: string
          deal_type?: string
          description?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          merchant_name?: string
          merchant_url?: string | null
          owner_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          transaction_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
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
      student_email_verifications: {
        Row: {
          created_at: string
          date_of_birth: string | null
          expires_at: string
          id: string
          school_email: string
          updated_at: string
          user_id: string
          verification_code: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          expires_at?: string
          id?: string
          school_email: string
          updated_at?: string
          user_id: string
          verification_code: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          expires_at?: string
          id?: string
          school_email?: string
          updated_at?: string
          user_id?: string
          verification_code?: string
          verified?: boolean
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
      survey_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_required: boolean
          options: Json | null
          question_text: string
          question_type: string
          survey_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text: string
          question_type?: string
          survey_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_required?: boolean
          options?: Json | null
          question_text?: string
          question_type?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answer: Json
          created_at: string
          id: string
          question_id: string
          survey_id: string
          user_id: string
        }
        Insert: {
          answer: Json
          created_at?: string
          id?: string
          question_id: string
          survey_id: string
          user_id: string
        }
        Update: {
          answer?: Json
          created_at?: string
          id?: string
          question_id?: string
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_school_targets: {
        Row: {
          created_at: string
          domain: string
          id: string
          survey_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          survey_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_school_targets_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          owner_id: string | null
          points: number
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          points?: number
          target_audience?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          owner_id?: string | null
          points?: number
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      user_points: {
        Row: {
          created_at: string
          id: string
          reward_points: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reward_points?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reward_points?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_premium_access: { Args: { user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_verified_student_email: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_any_admin: { Args: { _user_id: string }; Returns: boolean }
      remove_expired_scholarships: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "advertiser" | "school_admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "advertiser", "school_admin", "moderator"],
    },
  },
} as const
