-- ============================================================================
-- EMERGENCY AUTH SIGNUP TRIGGER NO-OP
-- If signup still fails, remove all custom auth.users side effects entirely.
-- ============================================================================

DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trig.tgname);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Intentionally no-op: never block auth signup.
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user noop fallback for user %: % [%]', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS
  'No-op auth trigger to guarantee signup reliability';
