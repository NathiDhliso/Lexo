# Simple Fix - Use Supabase Dashboard

Since the CLI is having connection issues, let's use the Supabase Dashboard directly.

## Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)

## Step 2: Check What Columns Exist

Paste this query and click **Run**:

```sql
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Look for `full_name` in the results.**

## Step 3A: If `full_name` is MISSING

Run this query to add all missing columns:

```sql
-- Add all advocate columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS practice_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS year_admitted INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS contingency_rate NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS success_fee_rate NUMERIC(5,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chambers_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS postal_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firm_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firm_tagline TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firm_logo_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bank_branch_code TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS initials TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
```

## Step 3B: Fix RLS Policies

Run this query to fix access permissions:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Team members can view organization profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;

-- Create new policies
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
```

## Step 4: Fix Other Tables' RLS

Run this to fix RLS on other tables:

```sql
-- Subscriptions
DROP POLICY IF EXISTS subscriptions_select_own ON subscriptions;
DROP POLICY IF EXISTS subscriptions_insert_own ON subscriptions;
DROP POLICY IF EXISTS subscriptions_update_own ON subscriptions;

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

-- PDF Templates
DROP POLICY IF EXISTS pdf_templates_select_own ON pdf_templates;
DROP POLICY IF EXISTS pdf_templates_insert_own ON pdf_templates;
DROP POLICY IF EXISTS pdf_templates_update_own ON pdf_templates;
DROP POLICY IF EXISTS pdf_templates_delete_own ON pdf_templates;

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

-- Invoices
DROP POLICY IF EXISTS invoices_select_own ON invoices;
DROP POLICY IF EXISTS invoices_insert_own ON invoices;
DROP POLICY IF EXISTS invoices_update_own ON invoices;
DROP POLICY IF EXISTS invoices_delete_own ON invoices;

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

-- Pro Forma Requests
DROP POLICY IF EXISTS proforma_requests_select_own ON proforma_requests;
DROP POLICY IF EXISTS proforma_requests_insert_own ON proforma_requests;
DROP POLICY IF EXISTS proforma_requests_update_own ON proforma_requests;
DROP POLICY IF EXISTS proforma_requests_delete_own ON proforma_requests;

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

-- Matters
DROP POLICY IF EXISTS matters_select_own ON matters;
DROP POLICY IF EXISTS matters_insert_own ON matters;
DROP POLICY IF EXISTS matters_update_own ON matters;
DROP POLICY IF EXISTS matters_delete_own ON matters;

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
```

## Step 5: Add Missing Invoice Columns

```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS next_reminder_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
```

## Step 6: Restart Your App

```powershell
# In your terminal
npm run dev
```

## Step 7: Test

1. Refresh browser (Ctrl+Shift+R)
2. Try logging in
3. Check console - should be clean!

## ✅ Done!

Your database is now aligned with your code. Everything should work!

---

## Quick Checklist

- [ ] Ran Step 2 query - checked for `full_name` column
- [ ] Ran Step 3A query - added missing columns
- [ ] Ran Step 3B query - fixed user_profiles RLS
- [ ] Ran Step 4 query - fixed other tables' RLS
- [ ] Ran Step 5 query - added invoice columns
- [ ] Restarted dev server
- [ ] Tested app - works! ✅
