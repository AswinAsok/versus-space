BEGIN;

CREATE OR REPLACE FUNCTION public.reject_cutover_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = '55000',
    MESSAGE = 'Versus Space is temporarily read-only for migration';
END;
$$;

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.user_profiles;
CREATE TRIGGER cutover_write_freeze
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.user_profiles
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_cutover_writes();

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.polls;
CREATE TRIGGER cutover_write_freeze
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.polls
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_cutover_writes();

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.poll_options;
CREATE TRIGGER cutover_write_freeze
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.poll_options
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_cutover_writes();

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.user_sessions;
CREATE TRIGGER cutover_write_freeze
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.user_sessions
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_cutover_writes();

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.votes;
CREATE TRIGGER cutover_write_freeze
BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE ON public.votes
FOR EACH STATEMENT EXECUTE FUNCTION public.reject_cutover_writes();

DO $$
DECLARE
  installed integer;
BEGIN
  SELECT COUNT(*)
  INTO installed
  FROM pg_trigger
  WHERE tgname = 'cutover_write_freeze'
    AND tgrelid IN (
      'public.user_profiles'::regclass,
      'public.polls'::regclass,
      'public.poll_options'::regclass,
      'public.user_sessions'::regclass,
      'public.votes'::regclass
    )
    AND NOT tgisinternal;

  IF installed <> 5 THEN
    RAISE EXCEPTION 'Expected 5 cutover write-freeze triggers, found %', installed;
  END IF;

  BEGIN
    UPDATE public.polls SET updated_at = updated_at WHERE false;
    RAISE EXCEPTION 'Cutover write freeze did not reject a test update';
  EXCEPTION
    WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$$;

COMMIT;
