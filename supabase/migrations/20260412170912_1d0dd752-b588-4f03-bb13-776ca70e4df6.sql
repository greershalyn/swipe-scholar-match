
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS redemption_limit_type text NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS redemption_limit_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_total_redemptions integer,
  ADD COLUMN IF NOT EXISTS current_redemptions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantity integer;
