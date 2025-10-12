-- ============================================
-- Fix RLS Policies and Missing Columns
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Fixing RLS Policies and Missing Columns';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- PART 1: Add missing columns to invoices
-- ============================================

DO $$
BEGIN
  -- Add next_reminder_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'next_reminder_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN next_reminder_date TIMESTAMPTZ;
    RAISE NOTICE '✓ Added next_reminder_date to invoices';
  END IF;
  
  -- Add last_reminder_sent_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'invoices' 
    AND column_name = 'last_reminder_sent_at'
  ) THEN
    ALTER TABLE invoices ADD COLUMN last_reminder_sent_at TIMESTAMPTZ;
    RAISE NOTICE '✓ Added last_reminder_sent_at to invoices';
  END IF;
END $$;

-- ============================================
-- PART 2: Fix user_profiles RLS policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Team members can view organization profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Create comprehensive policies
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed user_profiles RLS policies';
END $$;

-- ============================================
-- PART 3: Fix subscriptions RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable read access for own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for own subscriptions" ON subscriptions;

-- Create comprehensive policies
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed subscriptions RLS policies';
END $$;

-- ============================================
-- PART 4: Fix pdf_templates RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Enable read access for own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Enable insert for own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Enable update for own templates" ON pdf_templates;
DROP POLICY IF EXISTS "Enable delete for own templates" ON pdf_templates;

-- Create comprehensive policies
CREATE POLICY "pdf_templates_select_own"
  ON pdf_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

CREATE POLICY "pdf_templates_insert_own"
  ON pdf_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "pdf_templates_update_own"
  ON pdf_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "pdf_templates_delete_own"
  ON pdf_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed pdf_templates RLS policies';
END $$;

-- ============================================
-- PART 5: Fix invoices RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable read access for own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable insert for own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable update for own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable delete for own invoices" ON invoices;

-- Create comprehensive policies
CREATE POLICY "invoices_select_own"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

CREATE POLICY "invoices_insert_own"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "invoices_update_own"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "invoices_delete_own"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed invoices RLS policies';
END $$;

-- ============================================
-- PART 6: Fix proforma_requests RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE proforma_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can insert their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can update their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can delete their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Enable read access for own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Enable insert for own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Enable update for own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Enable delete for own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Advocates can view their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Advocates can create proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Advocates can update their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Advocates can delete their own proforma requests" ON proforma_requests;

-- Create comprehensive policies
CREATE POLICY "proforma_requests_select_own"
  ON proforma_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

CREATE POLICY "proforma_requests_insert_own"
  ON proforma_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "proforma_requests_update_own"
  ON proforma_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "proforma_requests_delete_own"
  ON proforma_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed proforma_requests RLS policies';
END $$;

-- ============================================
-- PART 7: Fix matters RLS policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matters" ON matters;
DROP POLICY IF EXISTS "Users can insert their own matters" ON matters;
DROP POLICY IF EXISTS "Users can update their own matters" ON matters;
DROP POLICY IF EXISTS "Users can delete their own matters" ON matters;
DROP POLICY IF EXISTS "Enable read access for own matters" ON matters;
DROP POLICY IF EXISTS "Enable insert for own matters" ON matters;
DROP POLICY IF EXISTS "Enable update for own matters" ON matters;
DROP POLICY IF EXISTS "Enable delete for own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can view their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can create matters" ON matters;
DROP POLICY IF EXISTS "Advocates can update their own matters" ON matters;
DROP POLICY IF EXISTS "Advocates can delete their own matters" ON matters;

-- Create comprehensive policies
CREATE POLICY "matters_select_own"
  ON matters FOR SELECT
  TO authenticated
  USING (auth.uid() = advocate_id);

CREATE POLICY "matters_insert_own"
  ON matters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "matters_update_own"
  ON matters FOR UPDATE
  TO authenticated
  USING (auth.uid() = advocate_id)
  WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "matters_delete_own"
  ON matters FOR DELETE
  TO authenticated
  USING (auth.uid() = advocate_id);

DO $$
BEGIN
  RAISE NOTICE '✓ Fixed matters RLS policies';
END $$;

-- ============================================
-- FINAL SUMMARY
-- ============================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total RLS policies: %', policy_count;
  RAISE NOTICE '========================================';
END $$;
