-- Migration: Fix create_user_preferences function and trigger to prevent signup failures
-- Created: 2025-10-05
-- Description: Schema-qualify function references, set SECURITY DEFINER with search_path, and recreate trigger.

-- Ensure the function is correctly defined and operates under the public schema with elevated privileges
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, feature_discovery)
  VALUES (
    NEW.id,
    jsonb_build_object(
      'notification_shown', false,
      'notification_dismissed_at', NULL,
      'first_login_date', NOW()
    )
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger on auth.users to call the updated function
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON auth.users;
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_preferences();