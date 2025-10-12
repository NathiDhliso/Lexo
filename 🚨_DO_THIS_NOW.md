# 🚨 DO THIS NOW - Simple Dashboard Fix

## The CLI isn't working, so use the Supabase Dashboard instead!

### 1️⃣ Open Supabase Dashboard

Go to: https://supabase.com/dashboard

- Select your project
- Click **SQL Editor** in the left sidebar

### 2️⃣ Copy & Paste These Queries

Run each query by clicking **Run** after pasting.

#### Query 1: Add Missing Columns

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS practice_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS year_admitted INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chambers_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS postal_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firm_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS initials TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
```

#### Query 2: Fix RLS Policies

```sql
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;

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

#### Query 3: Fix Invoice Columns

```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS next_reminder_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;
```

#### Query 4: Fix ProForma Requests Columns

```sql
ALTER TABLE proforma_requests ADD COLUMN IF NOT EXISTS matter_type TEXT;
```

### 3️⃣ Restart Your Dev Server

```powershell
npm run dev
```

### 4️⃣ Test Your App

- Refresh browser (Ctrl+Shift+R)
- Try logging in
- Should work now! ✅

---

## That's It!

3 queries, restart server, done.

See `SIMPLE_FIX.md` for more detailed instructions including fixing other tables.
