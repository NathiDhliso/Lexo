-- ============================================================================
-- HARDEN AUTH SIGNUP TRIGGER (NON-BLOCKING)
-- Ensures auth user creation never fails due to profile bootstrap logic.
-- ============================================================================

-- Drop all non-internal triggers on auth.users to prevent unknown failing logic.
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

-- Best-effort handler that never blocks signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  fallback_name TEXT;
BEGIN
  fallback_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(COALESCE(NEW.email, 'New User'), '@', 1)
  );

  -- Try to bootstrap user_profiles if possible, but never block auth signup.
  BEGIN
    IF to_regclass('public.user_profiles') IS NOT NULL THEN
      EXECUTE $sql$
        INSERT INTO public.user_profiles (
          user_id,
          email,
          full_name,
          created_at,
          updated_at,
          is_active
        )
        VALUES ($1, $2, $3, NOW(), NOW(), true)
        ON CONFLICT (user_id) DO UPDATE
          SET email = EXCLUDED.email,
              updated_at = NOW()
      $sql$
      USING NEW.id, NEW.email, fallback_name;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_new_user profile bootstrap skipped for user %: % [%]',
        NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user unexpected failure for user %: % [%]',
      NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Recreate single safe trigger.
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS
  'Best-effort signup bootstrap that never blocks auth user creation';
