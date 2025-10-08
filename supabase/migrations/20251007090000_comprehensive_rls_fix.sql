-- ============================================================================
-- COMPREHENSIVE RLS FIX - Corrected Version
-- Fix all 403 permission errors by ensuring proper RLS policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE advocates ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON advocates;
DROP POLICY IF EXISTS "Users can update their own profile" ON advocates;
DROP POLICY IF EXISTS "Users can view their own matters" ON matters;
DROP POLICY IF EXISTS "Users can create matters" ON matters;
DROP POLICY IF EXISTS "Users can update their own matters" ON matters;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own unbilled time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own unbilled expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view payments for their invoices" ON payments;
DROP POLICY IF EXISTS "Users can create payments for their invoices" ON payments;
DROP POLICY IF EXISTS "Users can view their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can create proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can update their own proforma requests" ON proforma_requests;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

-- ============================================================================
-- ADVOCATES TABLE POLICIES
-- ============================================================================

CREATE POLICY "advocates_select_policy" ON advocates
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "advocates_update_policy" ON advocates
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- MATTERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "matters_select_policy" ON matters
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "matters_insert_policy" ON matters
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "matters_update_policy" ON matters
  FOR UPDATE USING (auth.uid() = advocate_id);

-- ============================================================================
-- INVOICES TABLE POLICIES
-- ============================================================================

CREATE POLICY "invoices_select_policy" ON invoices
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "invoices_insert_policy" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "invoices_update_policy" ON invoices
  FOR UPDATE USING (auth.uid() = advocate_id);

-- ============================================================================
-- TIME ENTRIES TABLE POLICIES
-- ============================================================================

CREATE POLICY "time_entries_select_policy" ON time_entries
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "time_entries_insert_policy" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "time_entries_update_policy" ON time_entries
  FOR UPDATE USING (auth.uid() = advocate_id);

CREATE POLICY "time_entries_delete_policy" ON time_entries
  FOR DELETE USING (auth.uid() = advocate_id AND is_billed = false);

-- ============================================================================
-- EXPENSES TABLE POLICIES
-- ============================================================================

CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE USING (auth.uid() = advocate_id);

CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE USING (auth.uid() = advocate_id AND is_billed = false);

-- ============================================================================
-- PAYMENTS TABLE POLICIES (Corrected - no advocate_id column)
-- ============================================================================

CREATE POLICY "payments_select_policy" ON payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert_policy" ON payments
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE advocate_id = auth.uid()
    )
  );

-- ============================================================================
-- PROFORMA REQUESTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "proforma_requests_select_policy" ON proforma_requests
  FOR SELECT USING (auth.uid() = advocate_id);

CREATE POLICY "proforma_requests_insert_policy" ON proforma_requests
  FOR INSERT WITH CHECK (auth.uid() = advocate_id);

CREATE POLICY "proforma_requests_update_policy" ON proforma_requests
  FOR UPDATE USING (auth.uid() = advocate_id);

-- ============================================================================
-- USER PREFERENCES TABLE POLICIES
-- ============================================================================

CREATE POLICY "user_preferences_select_policy" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_policy" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_policy" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON advocates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON matters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;
GRANT SELECT, INSERT ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON proforma_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;

-- ============================================================================
-- END OF COMPREHENSIVE RLS FIX
-- ============================================================================