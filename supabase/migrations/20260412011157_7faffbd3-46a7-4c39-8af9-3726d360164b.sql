
-- Promo codes created by super admin, shared externally
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  points_value integer NOT NULL DEFAULT 0,
  max_redemptions integer,
  current_redemptions integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage promo codes" ON public.promo_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Service role manages promo codes" ON public.promo_codes FOR ALL TO service_role
  USING (true) WITH CHECK (true);
-- Students need SELECT to validate a code during redemption
CREATE POLICY "Verified students can read active promo codes" ON public.promo_codes FOR SELECT TO authenticated
  USING (is_active = true AND has_verified_student_email(auth.uid()));

-- Track who redeemed which code
CREATE TABLE public.promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, promo_code_id)
);

ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions" ON public.promo_code_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can insert own redemptions" ON public.promo_code_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_verified_student_email(auth.uid()));
CREATE POLICY "Service role manages redemptions" ON public.promo_code_redemptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Super admins view all redemptions" ON public.promo_code_redemptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));
