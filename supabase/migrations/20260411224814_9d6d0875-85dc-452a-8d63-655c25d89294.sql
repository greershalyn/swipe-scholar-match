
CREATE OR REPLACE FUNCTION public.has_premium_access(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles p
        LEFT JOIN subscriptions s ON s.profile_id = p.id
        WHERE p.id = user_id
        AND (
            p.subscription_tier = 'premium'
            OR (s.status = 'active' AND s.current_period_end > NOW())
        )
    );
END;
$$;
