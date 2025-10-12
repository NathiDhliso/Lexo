# Next Steps - Migration Sync Issue

## What Happened

The migrations show as "applied" but you're still getting errors. This means either:
1. The migrations didn't actually run (false positive)
2. The schema cache is stale
3. The columns exist but RLS is blocking access

## What to Do Now

### Step 1: Check What's Actually in the Database

```powershell
.\check-user-profiles-columns.ps1
```

This will show you:
- What columns exist in `user_profiles`
- What RLS policies are active

### Step 2: Based on the Output

#### If you see `full_name` column:
✅ Schema is correct!

The issue is likely RLS policies. Run:
```powershell
# Manually apply RLS fix
supabase db remote exec -f supabase/migrations/20250113000005_fix_rls_and_missing_columns.sql
```

#### If you DON'T see `full_name` column:
❌ Migration didn't actually run.

Run:
```powershell
# Manually add all columns
supabase db remote exec -f supabase/migrations/20250113000004_align_schema_with_database.sql
```

### Step 3: Restart Everything

```powershell
# Restart dev server
npm run dev

# In browser: Hard refresh
# Ctrl + Shift + R
```

### Step 4: Test

- Try logging in
- Check browser console
- Should work now!

## Alternative: Nuclear Option

If the above doesn't work, you can manually add the columns:

```powershell
supabase db remote exec "
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS practice_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS year_admitted INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chambers_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS postal_address TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS initials TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
"
```

Then fix RLS:
```powershell
supabase db remote exec "
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;

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
"
```

## Summary

1. ✅ Run `.\check-user-profiles-columns.ps1`
2. ✅ Based on output, either:
   - Apply schema migration manually
   - Apply RLS migration manually
   - Or use nuclear option above
3. ✅ Restart dev server
4. ✅ Test app

See `TROUBLESHOOTING.md` for more detailed help.
