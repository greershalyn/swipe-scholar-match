
ALTER TABLE public.coupons ADD COLUMN reward_points_cost integer DEFAULT NULL;
ALTER TABLE public.coupons ADD COLUMN is_physical boolean NOT NULL DEFAULT false;

ALTER TABLE public.redeemed_coupons ADD COLUMN shipping_address text DEFAULT NULL;
