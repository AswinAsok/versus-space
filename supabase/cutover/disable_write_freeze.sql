BEGIN;

DROP TRIGGER IF EXISTS cutover_write_freeze ON public.votes;
DROP TRIGGER IF EXISTS cutover_write_freeze ON public.user_sessions;
DROP TRIGGER IF EXISTS cutover_write_freeze ON public.poll_options;
DROP TRIGGER IF EXISTS cutover_write_freeze ON public.polls;
DROP TRIGGER IF EXISTS cutover_write_freeze ON public.user_profiles;
DROP FUNCTION IF EXISTS public.reject_cutover_writes();

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

  IF installed <> 0 THEN
    RAISE EXCEPTION 'Expected no cutover write-freeze triggers, found %', installed;
  END IF;
END;
$$;

COMMIT;
