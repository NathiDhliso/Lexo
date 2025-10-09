-- =====================================================
-- NUCLEAR DATABASE WIPE - COMPLETE DESTRUCTION
-- =====================================================
-- WARNING: This will destroy EVERYTHING in the public schema
-- Including: tables, functions, triggers, policies, types, etc.
-- USE WITH EXTREME CAUTION - THIS IS IRREVERSIBLE!
-- =====================================================

-- Step 1: Drop the entire public schema (nuclear option)
DROP SCHEMA IF EXISTS public CASCADE;

-- Step 2: Recreate the public schema
CREATE SCHEMA public;

-- Step 3: Grant default permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Step 4: Add comment
COMMENT ON SCHEMA public IS 'standard public schema';