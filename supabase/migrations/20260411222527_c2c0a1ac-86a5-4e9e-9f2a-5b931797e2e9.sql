
-- Allowed school domains
CREATE TABLE public.allowed_school_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  school_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.allowed_school_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active domains"
  ON public.allowed_school_domains FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role manages domains"
  ON public.allowed_school_domains FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Student email verifications
CREATE TABLE public.student_email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_email text NOT NULL,
  verification_code text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_email)
);
ALTER TABLE public.student_email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON public.student_email_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own verifications"
  ON public.student_email_verifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages verifications"
  ON public.student_email_verifications FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Helper function (created AFTER the table it references)
CREATE OR REPLACE FUNCTION public.has_verified_student_email(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_email_verifications
    WHERE user_id = p_user_id
      AND verified = true
  )
$$;

-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  coupon_code text,
  discount_value text,
  merchant_name text NOT NULL,
  merchant_url text,
  category text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified students can read active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND public.has_verified_student_email(auth.uid()));

CREATE POLICY "Service role manages coupons"
  ON public.coupons FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Surveys table
CREATE TABLE public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified students can read active surveys"
  ON public.surveys FOR SELECT
  TO authenticated
  USING (is_active = true AND public.has_verified_student_email(auth.uid()));

CREATE POLICY "Service role manages surveys"
  ON public.surveys FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Survey questions
CREATE TABLE public.survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'text',
  options jsonb,
  is_required boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified students can read survey questions"
  ON public.survey_questions FOR SELECT
  TO authenticated
  USING (public.has_verified_student_email(auth.uid()));

CREATE POLICY "Service role manages survey questions"
  ON public.survey_questions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Survey responses
CREATE TABLE public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  answer jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own responses"
  ON public.survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_verified_student_email(auth.uid()));

CREATE POLICY "Users can view own responses"
  ON public.survey_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages responses"
  ON public.survey_responses FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Seed common university domains
INSERT INTO public.allowed_school_domains (domain, school_name) VALUES
  ('harvard.edu', 'Harvard University'),
  ('stanford.edu', 'Stanford University'),
  ('mit.edu', 'Massachusetts Institute of Technology'),
  ('yale.edu', 'Yale University'),
  ('princeton.edu', 'Princeton University'),
  ('columbia.edu', 'Columbia University'),
  ('uchicago.edu', 'University of Chicago'),
  ('upenn.edu', 'University of Pennsylvania'),
  ('caltech.edu', 'California Institute of Technology'),
  ('duke.edu', 'Duke University'),
  ('nyu.edu', 'New York University'),
  ('ucla.edu', 'University of California, Los Angeles'),
  ('berkeley.edu', 'University of California, Berkeley'),
  ('umich.edu', 'University of Michigan'),
  ('gatech.edu', 'Georgia Institute of Technology'),
  ('utexas.edu', 'University of Texas at Austin'),
  ('uw.edu', 'University of Washington'),
  ('usc.edu', 'University of Southern California'),
  ('cornell.edu', 'Cornell University'),
  ('brown.edu', 'Brown University');
