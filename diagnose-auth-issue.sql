-- ============================================================================
-- DIAGNOSTIC SCRIPT FOR AUTH 500 ERROR
-- Run this in your Supabase SQL Editor to diagnose the issue
-- ============================================================================

-- 1. Check if advocates table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'advocates'
) AS advocates_table_exists;

-- 2. Check if bar_association enum exists
SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'bar_association'
) AS bar_association_enum_exists;

-- 3. Check if user_role enum exists
SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'user_role'
) AS user_role_enum_exists;

-- 4. Check if the trigger exists
SELECT EXISTS (
  SELECT FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created'
) AS trigger_exists;

-- 5. Check if the function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'handle_new_user'
) AS function_exists;

-- 6. Check recent auth errors (if you have logging enabled)
SELECT 
  created_at,
  event_type,
  user_id,
  error_code,
  error_message
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND error_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check if there are any users without advocate records
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN a.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as advocate_status
FROM auth.users au
LEFT JOIN public.advocates a ON a.id = au.id
ORDER BY au.created_at DESC
LIMIT 5;

-- 8. Test the handle_new_user function manually
-- (This will show you the exact error if there is one)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
BEGIN
  -- Try to insert a test advocate record
  INSERT INTO public.advocates (
    id,
    email,
    full_name,
    initials,
    practice_number,
    bar,
    year_admitted,
    hourly_rate,
    user_role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_email,
    'Test User',
    'TU',
    'TEST-2025-001-' || SUBSTRING(test_user_id::TEXT, 1, 8),
    'johannesburg'::bar_association,
    2024,
    1500.00,
    'junior_advocate'::user_role,
    true,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Test insert successful!';
  
  -- Clean up test data
  DELETE FROM public.advocates WHERE id = test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
