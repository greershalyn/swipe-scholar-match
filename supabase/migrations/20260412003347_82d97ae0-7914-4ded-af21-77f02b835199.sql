
-- Add points value to surveys
ALTER TABLE public.surveys ADD COLUMN points integer NOT NULL DEFAULT 0;

-- User points balance
CREATE TABLE public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_points integer NOT NULL DEFAULT 0,
  reward_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own points" ON public.user_points FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own points" ON public.user_points FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Service role manages points" ON public.user_points FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Super admins can manage points" ON public.user_points FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Point transaction log
CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL DEFAULT 'earned',
  source_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.point_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own transactions" ON public.point_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Service role manages transactions" ON public.point_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Super admins can view all transactions" ON public.point_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'super_admin'));
