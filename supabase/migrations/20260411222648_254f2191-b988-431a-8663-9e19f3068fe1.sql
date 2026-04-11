
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_subscription_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE profiles
        SET subscription_tier = 'premium'
        WHERE id = NEW.profile_id;
    ELSIF NEW.status IN ('canceled', 'past_due') THEN
        UPDATE profiles
        SET subscription_tier = 'free'
        WHERE id = NEW.profile_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_expired_scholarships()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM saved_scholarships 
  WHERE scholarship_id IN (
    SELECT s.id 
    FROM scholarships s 
    WHERE s.deadline < NOW()
  );
END;
$$;
