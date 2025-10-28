-- ============================================================================
-- Fix advocate_billing_preferences 406 Not Acceptable Error
-- ============================================================================
-- Fixes 406 errors by ensuring proper table structure and permissions
-- ============================================================================

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS public.advocate_billing_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advocate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Billing preferences
    default_billing_model TEXT NOT NULL DEFAULT 'brief-fee' CHECK (default_billing_model IN ('brief-fee', 'time-based', 'quick-opinion')),
    primary_workflow TEXT DEFAULT 'brief-fee' CHECK (primary_workflow IN ('brief-fee', 'time-based', 'mixed')),
    
    -- Dashboard preferences
    dashboard_widgets JSONB DEFAULT '["active-matters", "pending-invoices", "recent-activity"]'::jsonb,
    show_time_tracking_by_default BOOLEAN DEFAULT false,
    auto_create_milestones BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(advocate_id)
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_advocate_billing_preferences_advocate_id 
  ON public.advocate_billing_preferences(advocate_id);

-- Enable RLS
ALTER TABLE public.advocate_billing_preferences ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can insert their own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can update their own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Users can delete their own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Advocates can view own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Advocates can insert own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Advocates can update own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "Advocates can delete own billing preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_view_own_preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_update_own_preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "advocate_insert_own_preferences" ON public.advocate_billing_preferences;
DROP POLICY IF EXISTS "service_role_full_access" ON public.advocate_billing_preferences;

-- Create simple, clear RLS policies
CREATE POLICY "select_own_billing_preferences"
  ON public.advocate_billing_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

CREATE POLICY "insert_own_billing_preferences"
  ON public.advocate_billing_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "update_own_billing_preferences"
  ON public.advocate_billing_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "delete_own_billing_preferences"
  ON public.advocate_billing_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

-- Grant explicit permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advocate_billing_preferences TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant full access to service_role
GRANT ALL ON public.advocate_billing_preferences TO service_role;

-- Grant access to anon role for public operations (if needed)
GRANT SELECT ON public.advocate_billing_preferences TO anon;

-- Ensure the update trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_advocate_billing_preferences_updated_at ON public.advocate_billing_preferences;

CREATE TRIGGER update_advocate_billing_preferences_updated_at
    BEFORE UPDATE ON public.advocate_billing_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify:
-- 
-- 1. Check table exists:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'advocate_billing_preferences';
--
-- 2. Check policies:
-- SELECT policyname, cmd, roles FROM pg_policies 
-- WHERE tablename = 'advocate_billing_preferences';
--
-- 3. Check grants:
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_name = 'advocate_billing_preferences';
