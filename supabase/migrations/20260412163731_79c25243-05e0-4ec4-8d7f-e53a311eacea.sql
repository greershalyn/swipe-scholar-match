
-- Create qr_codes table
CREATE TABLE public.qr_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  points_value integer NOT NULL DEFAULT 0,
  max_total_redemptions integer,
  current_redemptions integer NOT NULL DEFAULT 0,
  redemption_limit_type text NOT NULL DEFAULT 'once',
  redemption_limit_count integer NOT NULL DEFAULT 1,
  badge_id uuid REFERENCES public.badges(id) ON DELETE SET NULL,
  badge_scan_threshold integer,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create qr_code_redemptions table
CREATE TABLE public.qr_code_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS for qr_codes
CREATE POLICY "Service role manages qr_codes"
  ON public.qr_codes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Super admins manage qr_codes"
  ON public.qr_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Verified students can read active qr_codes"
  ON public.qr_codes FOR SELECT TO authenticated
  USING (is_active = true AND has_verified_student_email(auth.uid()));

-- RLS for qr_code_redemptions
CREATE POLICY "Service role manages qr_code_redemptions"
  ON public.qr_code_redemptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Super admins view all qr_code_redemptions"
  ON public.qr_code_redemptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view own qr_code_redemptions"
  ON public.qr_code_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Index for faster frequency lookups
CREATE INDEX idx_qr_code_redemptions_user_code ON public.qr_code_redemptions (user_id, qr_code_id, created_at DESC);
