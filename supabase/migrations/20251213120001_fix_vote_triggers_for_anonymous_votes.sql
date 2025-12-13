/*
  # Fix vote triggers for anonymous/public voters

  ## Problem
  Anonymous voters could insert into `votes`, but the AFTER INSERT triggers
  attempted to update `poll_options` and `polls`. Those updates were blocked by
  RLS policies that only allow poll creators to update those tables, causing the
  vote insert to fail silently for public users.

  ## Changes
  - Recreate trigger functions as SECURITY DEFINER and pin `search_path` to
    `public` so the increment and timestamp updates bypass RLS safely.
*/

-- Allow vote count increments to bypass RLS
CREATE OR REPLACE FUNCTION increment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;
  RETURN NEW;
END;
$$;

-- Allow updated_at bump to bypass RLS
CREATE OR REPLACE FUNCTION update_poll_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE polls
  SET updated_at = now()
  WHERE id = NEW.poll_id;
  RETURN NEW;
END;
$$;
