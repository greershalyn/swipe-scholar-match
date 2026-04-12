
-- Add redemption window to coupons (days after redeeming before personal copy expires)
ALTER TABLE public.coupons ADD COLUMN redemption_expiry_days integer NOT NULL DEFAULT 30;

-- Redeemed coupons stored in user's wallet
CREATE TABLE public.redeemed_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

ALTER TABLE public.redeemed_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redeemed coupons" ON public.redeemed_coupons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own redeemed coupons" ON public.redeemed_coupons FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own redeemed coupons" ON public.redeemed_coupons FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role manages redeemed coupons" ON public.redeemed_coupons FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Super admins manage redeemed coupons" ON public.redeemed_coupons FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));
