
-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'trophy',
  points_value integer NOT NULL DEFAULT 0,
  trigger_type text NOT NULL,
  trigger_threshold integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage badges" ON public.badges FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Service role manages badges" ON public.badges FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Verified students can read active badges" ON public.badges FOR SELECT TO authenticated
  USING (is_active = true AND has_verified_student_email(auth.uid()));

-- Create user_badges table
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  points_awarded integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages user badges" ON public.user_badges FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Super admins view all user badges" ON public.user_badges FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid());
