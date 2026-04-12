
ALTER TABLE public.user_points
  ADD COLUMN current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN last_checkin_date date;
