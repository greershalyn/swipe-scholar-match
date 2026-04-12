
-- Survey targeting
ALTER TABLE public.surveys ADD COLUMN target_audience text NOT NULL DEFAULT 'all';

CREATE TABLE public.survey_school_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  domain text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(survey_id, domain)
);

ALTER TABLE public.survey_school_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages survey targets" ON public.survey_school_targets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Super admins manage survey targets" ON public.survey_school_targets FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School admins manage own survey targets" ON public.survey_school_targets FOR ALL TO authenticated
  USING (survey_id IN (SELECT id FROM surveys WHERE owner_id = auth.uid()) AND has_role(auth.uid(), 'school_admin'))
  WITH CHECK (survey_id IN (SELECT id FROM surveys WHERE owner_id = auth.uid()) AND has_role(auth.uid(), 'school_admin'));
CREATE POLICY "Verified students can read targets" ON public.survey_school_targets FOR SELECT TO authenticated USING (has_verified_student_email(auth.uid()));

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role manages notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Super admins manage notifications" ON public.notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
