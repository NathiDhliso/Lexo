# Troubleshooting Guide

## Current Situation

Your migrations show as "applied" in the remote database:
- ✅ `20250113000004` - Schema alignment (applied)
- ✅ `20250113000005` - RLS fixes (applied)

But you're still getting errors. Let's diagnose why.

## Step 1: Check What Columns Exist

Run this to see what's actually in your database:

```powershell
.\check-user-profiles-columns.ps1
```

This will show:
1. All columns in `user_profiles` table
2. All RLS policies on `user_profiles` table

## Step 2: Diagnose the Issue

### If `full_name` column is MISSING:
The migration didn't actually run despite showing as "applied". 

**Fix:**
```powershell
# Force re-run the migration
supabase db reset
# Then push migrations
supabase db push
```

### If `full_name` column EXISTS but you still get 400 error:
The schema cache might be stale.

**Fix:**
```powershell
# Restart PostgREST
supabase functions deploy --no-verify-jwt
# Or restart the whole project
supabase stop
supabase start
```

### If RLS policies are MISSING:
The RLS migration didn't run.

**Fix:**
```powershell
# Manually apply RLS fix
supabase db remote exec -f supabase/migrations/20250113000005_fix_rls_and_missing_columns.sql
```

## Step 3: Common Issues

### Issue: "Could not find 'full_name' column"

**Diagnosis:**
```powershell
.\check-user-profiles-columns.ps1
```

Look for `full_name` in the output.

**If Missing:**
```powershell
# Manually add the column
supabase db remote exec "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;"
```

**If Exists:**
```powershell
# Clear PostgREST schema cache
supabase db remote exec "NOTIFY pgrst, 'reload schema';"
```

### Issue: 406 (Not Acceptable) on user_profiles

**Diagnosis:**
```powershell
.\check-user-profiles-columns.ps1
```

Look for RLS policies in the output.

**If No Policies:**
```powershell
# Manually apply RLS policies
supabase db remote exec -f supabase/migrations/20250113000005_fix_rls_and_missing_columns.sql
```

**If Policies Exist:**
```powershell
# Check if RLS is enabled
supabase db remote exec "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles';"
```

## Step 4: Nuclear Option (If Nothing Works)

### Option A: Reset and Rebuild
```powershell
# WARNING: This will delete all data!
supabase db reset
supabase db push
```

### Option B: Manual Column Addition
```powershell
# Add columns one by one
supabase db remote exec @"
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS practice_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS year_admitted INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
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
"@
```

### Option C: Manual RLS Fix
```powershell
supabase db remote exec @"
-- Drop existing policies
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;

-- Create new policies
CREATE POLICY user_profiles_select_own
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_profiles_insert_own
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_profiles_update_own
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
"@
```

## Step 5: Verify the Fix

After applying any fix:

1. **Check columns exist:**
```powershell
.\check-user-profiles-columns.ps1
```

2. **Restart dev server:**
```powershell
npm run dev
```

3. **Clear browser cache:**
- Hard refresh: `Ctrl + Shift + R`

4. **Test the app:**
- Try logging in
- Check console for errors

## Step 6: Still Not Working?

### Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. Find `user_profiles` table
5. Check if columns exist
6. Go to "Authentication" > "Policies"
7. Check if policies exist for `user_profiles`

### Check Migration History

```powershell
supabase db remote exec "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20;"
```

This shows which migrations have actually been applied.

### Get Help

If still stuck, provide:
1. Output of `.\check-user-profiles-columns.ps1`
2. Output of migration history query above
3. Exact error message from browser console

## Quick Reference

| Problem | Command |
|---------|---------|
| Check columns | `.\check-user-profiles-columns.ps1` |
| Add missing column | `supabase db remote exec "ALTER TABLE user_profiles ADD COLUMN full_name TEXT;"` |
| Fix RLS | `supabase db remote exec -f supabase/migrations/20250113000005_fix_rls_and_missing_columns.sql` |
| Reset database | `supabase db reset` |
| Restart PostgREST | `supabase db remote exec "NOTIFY pgrst, 'reload schema';"` |

## Expected Working State

When everything is working, you should see:

### Columns in user_profiles:
- ✅ user_id
- ✅ full_name
- ✅ email
- ✅ phone
- ✅ practice_number
- ✅ year_admitted
- ✅ hourly_rate
- ✅ chambers_address
- ✅ postal_address
- ✅ is_active
- ✅ user_role
- ✅ initials
- ✅ (and more...)

### RLS Policies:
- ✅ user_profiles_select_own
- ✅ user_profiles_insert_own
- ✅ user_profiles_update_own

### Browser Console:
- ✅ No 404 errors
- ✅ No 406 errors
- ✅ No 400 errors
- ✅ User profile loads

Good luck! 🚀
