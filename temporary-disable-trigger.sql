-- ============================================================================
-- TEMPORARY FIX: Disable the trigger causing 500 errors
-- Run this in Supabase SQL Editor to allow sign-ins while debugging
-- ============================================================================

-- Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- You can re-enable it later with:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Note: This means new users won't automatically get advocate records
-- You'll need to create them manually or fix the trigger first
