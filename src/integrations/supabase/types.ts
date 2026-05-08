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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          points_value: number
          trigger_threshold: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_value?: number
          trigger_threshold?: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_value?: number
          trigger_threshold?: number
          trigger_type?: string
          updated_at?: string
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
          biz_address: string | null
          biz_city: string | null
          biz_radius_mi: number | null
          biz_state: string | null
          biz_zip: string | null
          category: string | null
          code: string | null
          coupon_code: string | null
          created_at: string
          current_redemptions: number
          deal_type: string
          delivery_type: string | null
          description: string | null
          discount_value: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_physical: boolean
          limit_lifetime: number | null
          limit_total: number | null
          limit_weekly: number | null
          max_total_redemptions: number | null
          merchant_name: string
          merchant_url: string | null
          owner_id: string | null
          quantity: number | null
          redemption_expiry_days: number
          redemption_limit_count: number
          redemption_limit_type: string
          redemptions: number | null
          retail_value: number | null
          reward_points_cost: number | null
          stock: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          biz_address?: string | null
          biz_city?: string | null
          biz_radius_mi?: number | null
          biz_state?: string | null
          biz_zip?: string | null
          category?: string | null
          code?: string | null
          coupon_code?: string | null
          created_at?: string
          current_redemptions?: number
          deal_type?: string
          delivery_type?: string | null
          description?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_physical?: boolean
          limit_lifetime?: number | null
          limit_total?: number | null
          limit_weekly?: number | null
          max_total_redemptions?: number | null
          merchant_name: string
          merchant_url?: string | null
          owner_id?: string | null
          quantity?: number | null
          redemption_expiry_days?: number
          redemption_limit_count?: number
          redemption_limit_type?: string
          redemptions?: number | null
          retail_value?: number | null
          reward_points_cost?: number | null
          stock?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          biz_address?: string | null
          biz_city?: string | null
          biz_radius_mi?: number | null
          biz_state?: string | null
          biz_zip?: string | null
          category?: string | null
          code?: string | null
          coupon_code?: string | null
          created_at?: string
          current_redemptions?: number
          deal_type?: string
          delivery_type?: string | null
          description?: string | null
          discount_value?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_physical?: boolean
          limit_lifetime?: number | null
          limit_total?: number | null
          limit_weekly?: number | null
          max_total_redemptions?: number | null
          merchant_name?: string
          merchant_url?: string | null
          owner_id?: string | null
          quantity?: number | null
          redemption_expiry_days?: number
          redemption_limit_count?: number
          redemption_limit_type?: string
          redemptions?: number | null
          retail_value?: number | null
          reward_points_cost?: number | null
          stock?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          boost_tier: string | null
          company: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean
          job_type: string | null
          location: string | null
          location_type: string | null
          majors: string | null
          pay: string | null
          posted_by: string | null
          requirements: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          boost_tier?: string | null
          company: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: string | null
          location?: string | null
          location_type?: string | null
          majors?: string | null
          pay?: string | null
          posted_by?: string | null
          requirements?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          boost_tier?: string | null
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: string | null
          location?: string | null
          location_type?: string | null
          majors?: string | null
          pay?: string | null
          posted_by?: string | null
          requirements?: string | null
          title?: string
          updated_at?: string
          url?: string | null
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
          bio: string | null
          birth_date: string | null
          citizenship: string | null
          city: string | null
          college_university: string | null
          county: string | null
          created_at: string
          current_education_level: string | null
          disability: boolean
          disability_status: boolean | null
          dob: string | null
          dual_enrollment: boolean | null
          edu_verified: boolean
          education_level: string | null
          essay_personal_statement: string | null
          ethnicity: string | null
          extracurricular_activities: string[] | null
          financial_need: boolean | null
          first_gen: boolean | null
          first_generation_student: boolean | null
          full_name: string | null
          gender: string | null
          gpa: number | null
          graduated_hs: boolean
          graduation_year: string | null
          high_school_graduated: boolean | null
          household_income: number | null
          id: string
          intended_major: string | null
          is_student: boolean
          keywords: string[] | null
          major: string | null
          military: boolean
          military_affiliation: string | null
          minor: string | null
          organizations: string[] | null
          pell_grant: boolean
          personal_statement: string | null
          rewards: Json
          rewards_achievements: string[] | null
          sat_score: number | null
          school: string | null
          state: string | null
          subscription_tier: string | null
          updated_at: string
          volunteering_experience: string[] | null
          volunteering_list: Json
          year: string | null
          zip: string | null
          zip_code: string | null
        }
        Insert: {
          account_active?: boolean | null
          act_score?: number | null
          address?: string | null
          awards_honors?: string[] | null
          bio?: string | null
          birth_date?: string | null
          citizenship?: string | null
          city?: string | null
          college_university?: string | null
          county?: string | null
          created_at?: string
          current_education_level?: string | null
          disability?: boolean
          disability_status?: boolean | null
          dob?: string | null
          dual_enrollment?: boolean | null
          edu_verified?: boolean
          education_level?: string | null
          essay_personal_statement?: string | null
          ethnicity?: string | null
          extracurricular_activities?: string[] | null
          financial_need?: boolean | null
          first_gen?: boolean | null
          first_generation_student?: boolean | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          graduated_hs?: boolean
          graduation_year?: string | null
          high_school_graduated?: boolean | null
          household_income?: number | null
          id: string
          intended_major?: string | null
          is_student?: boolean
          keywords?: string[] | null
          major?: string | null
          military?: boolean
          military_affiliation?: string | null
          minor?: string | null
          organizations?: string[] | null
          pell_grant?: boolean
          personal_statement?: string | null
          rewards?: Json
          rewards_achievements?: string[] | null
          sat_score?: number | null
          school?: string | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          volunteering_experience?: string[] | null
          volunteering_list?: Json
          year?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Update: {
          account_active?: boolean | null
          act_score?: number | null
          address?: string | null
          awards_honors?: string[] | null
          bio?: string | null
          birth_date?: string | null
          citizenship?: string | null
          city?: string | null
          college_university?: string | null
          county?: string | null
          created_at?: string
          current_education_level?: string | null
          disability?: boolean
          disability_status?: boolean | null
          dob?: string | null
          dual_enrollment?: boolean | null
          edu_verified?: boolean
          education_level?: string | null
          essay_personal_statement?: string | null
          ethnicity?: string | null
          extracurricular_activities?: string[] | null
          financial_need?: boolean | null
          first_gen?: boolean | null
          first_generation_student?: boolean | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          graduated_hs?: boolean
          graduation_year?: string | null
          high_school_graduated?: boolean | null
          household_income?: number | null
          id?: string
          intended_major?: string | null
          is_student?: boolean
          keywords?: string[] | null
          major?: string | null
          military?: boolean
          military_affiliation?: string | null
          minor?: string | null
          organizations?: string[] | null
          pell_grant?: boolean
          personal_statement?: string | null
          rewards?: Json
          rewards_achievements?: string[] | null
          sat_score?: number | null
          school?: string | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          volunteering_experience?: string[] | null
          volunteering_list?: Json
          year?: string | null
          zip?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          promo_code_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          promo_code_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          promo_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_redemptions: number
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          points_value: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_redemptions?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          points_value?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_redemptions?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          points_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      qr_code_redemptions: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          qr_code_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          qr_code_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          qr_code_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_redemptions_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          badge_id: string | null
          badge_scan_threshold: number | null
          code: string
          created_at: string
          current_redemptions: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_total_redemptions: number | null
          name: string
          points_value: number
          redemption_limit_count: number
          redemption_limit_type: string
          updated_at: string
        }
        Insert: {
          badge_id?: string | null
          badge_scan_threshold?: number | null
          code: string
          created_at?: string
          current_redemptions?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_total_redemptions?: number | null
          name: string
          points_value?: number
          redemption_limit_count?: number
          redemption_limit_type?: string
          updated_at?: string
        }
        Update: {
          badge_id?: string | null
          badge_scan_threshold?: number | null
          code?: string
          created_at?: string
          current_redemptions?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_total_redemptions?: number | null
          name?: string
          points_value?: number
          redemption_limit_count?: number
          redemption_limit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      redeemed_coupons: {
        Row: {
          coupon_id: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          redeemed_at: string
          shipping_address: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          redeemed_at?: string
          shipping_address?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          redeemed_at?: string
          shipping_address?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redeemed_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_scholarships: {
        Row: {
          amount: string | null
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          match_score: number | null
          name: string
          org: string | null
          position: number | null
          scholarship_key: string
          status: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          amount?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          match_score?: number | null
          name: string
          org?: string | null
          position?: number | null
          scholarship_key: string
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          amount?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          match_score?: number | null
          name?: string
          org?: string | null
          position?: number | null
          scholarship_key?: string
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
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
      scholarship_search_cache: {
        Row: {
          amount: string | null
          cached_at: string
          category: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          id: string
          match_score: number | null
          name: string
          org: string | null
          scholarship_key: string
          search_angle: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          amount?: string | null
          cached_at?: string
          category?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          match_score?: number | null
          name: string
          org?: string | null
          scholarship_key: string
          search_angle?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          amount?: string | null
          cached_at?: string
          category?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          id?: string
          match_score?: number | null
          name?: string
          org?: string | null
          scholarship_key?: string
          search_angle?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
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
          audience: string | null
          audience_schools: string[] | null
          category: string | null
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          is_active: boolean
          max_responses: number | null
          one_per_user: boolean | null
          owner_id: string | null
          points: number
          points_cap: number | null
          questions: Json | null
          starts_at: string | null
          target_audience: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          audience?: string | null
          audience_schools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean
          max_responses?: number | null
          one_per_user?: boolean | null
          owner_id?: string | null
          points?: number
          points_cap?: number | null
          questions?: Json | null
          starts_at?: string | null
          target_audience?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          audience?: string | null
          audience_schools?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean
          max_responses?: number | null
          one_per_user?: boolean | null
          owner_id?: string | null
          points?: number
          points_cap?: number | null
          questions?: Json | null
          starts_at?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
          url?: string | null
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
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_checkin_date: string | null
          longest_streak: number
          reward_points: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          reward_points?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
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
      is_admin: { Args: never; Returns: boolean }
      is_any_admin: { Args: { _user_id: string }; Returns: boolean }
      is_lewte_eligible: { Args: { p_user_id: string }; Returns: boolean }
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
