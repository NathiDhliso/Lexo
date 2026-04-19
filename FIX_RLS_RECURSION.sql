-- ============================================================================
-- FIX RLS INFINITE RECURSION V2
-- ============================================================================

-- 1. DROP EXISTING POLICIES THAT MAY CAUSE RECURSION
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('matters', 'invoices', 'time_entries', 'expenses', 'logged_services', 'documents', 'proforma_requests', 'user_preferences', 'payments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END
$$;

-- 2. RECREATE SIMPLE, HIGH-PERFORMANCE POLICIES

-- MATTERS
CREATE POLICY "Enable full access for own matters" ON matters 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- INVOICES
CREATE POLICY "Enable full access for own invoices" ON invoices 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- TIME ENTRIES
CREATE POLICY "Enable full access for own time entries" ON time_entries 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- EXPENSES
CREATE POLICY "Enable full access for own expenses" ON expenses 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- LOGGED SERVICES
CREATE POLICY "Enable full access for own logged services" ON logged_services 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- PROFORMA REQUESTS
CREATE POLICY "Enable full access for own proforma_requests" ON proforma_requests 
  FOR ALL USING (auth.uid() = advocate_id) WITH CHECK (auth.uid() = advocate_id);

-- PAYMENTS
CREATE POLICY "Enable full access for own payments" ON payments 
  FOR ALL USING (auth.uid() IN (SELECT advocate_id FROM invoices WHERE id = payments.invoice_id)) 
  WITH CHECK (auth.uid() IN (SELECT advocate_id FROM invoices WHERE id = payments.invoice_id));

-- 3. ENSURE RLS IS ENABLED
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE logged_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Done!
