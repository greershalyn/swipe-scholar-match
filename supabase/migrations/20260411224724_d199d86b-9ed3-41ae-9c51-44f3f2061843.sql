
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'advertiser', 'school_admin', 'moderator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role manages roles"
ON public.user_roles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add owner_id to coupons
ALTER TABLE public.coupons ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add owner_id to surveys
ALTER TABLE public.surveys ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Coupon analytics table
CREATE TABLE public.coupon_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('view', 'click', 'redemption')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_coupon_analytics_coupon_id ON public.coupon_analytics(coupon_id);
CREATE INDEX idx_coupon_analytics_event_type ON public.coupon_analytics(event_type);
CREATE INDEX idx_coupon_analytics_created_at ON public.coupon_analytics(created_at);

-- Authenticated users can log events
CREATE POLICY "Authenticated users can insert analytics"
ON public.coupon_analytics FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Advertisers can view analytics for their coupons
CREATE POLICY "Advertisers can view own coupon analytics"
ON public.coupon_analytics FOR SELECT
TO authenticated
USING (
  coupon_id IN (SELECT id FROM public.coupons WHERE owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin')
);

-- Service role full access
CREATE POLICY "Service role manages analytics"
ON public.coupon_analytics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update coupons RLS: advertisers can manage their own coupons
CREATE POLICY "Advertisers can manage own coupons"
ON public.coupons FOR ALL
TO authenticated
USING (
  owner_id = auth.uid() AND public.has_role(auth.uid(), 'advertiser')
)
WITH CHECK (
  owner_id = auth.uid() AND public.has_role(auth.uid(), 'advertiser')
);

-- Super admins can manage all coupons
CREATE POLICY "Super admins can manage all coupons"
ON public.coupons FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Update surveys RLS: school admins can manage their own surveys
CREATE POLICY "School admins can manage own surveys"
ON public.surveys FOR ALL
TO authenticated
USING (
  owner_id = auth.uid() AND public.has_role(auth.uid(), 'school_admin')
)
WITH CHECK (
  owner_id = auth.uid() AND public.has_role(auth.uid(), 'school_admin')
);

-- Super admins can manage all surveys
CREATE POLICY "Super admins can manage all surveys"
ON public.surveys FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- School admins can manage survey questions for their surveys
CREATE POLICY "School admins can manage own survey questions"
ON public.survey_questions FOR ALL
TO authenticated
USING (
  survey_id IN (SELECT id FROM public.surveys WHERE owner_id = auth.uid())
  AND public.has_role(auth.uid(), 'school_admin')
)
WITH CHECK (
  survey_id IN (SELECT id FROM public.surveys WHERE owner_id = auth.uid())
  AND public.has_role(auth.uid(), 'school_admin')
);

-- Super admins can manage all survey questions
CREATE POLICY "Super admins can manage all survey questions"
ON public.survey_questions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Seed super admin role for the owner
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'greershalyn@lewte.com'
ON CONFLICT (user_id, role) DO NOTHING;
