# Fix 403 Forbidden Error - Matter Creation

## The Problem

You're getting a **403 Forbidden** error when trying to create a matter from a pro forma request. This means:

✅ The data is correct (no more 400 Bad Request)  
❌ Row Level Security (RLS) policy is blocking the insert

## The Solution

You need to update the RLS policy on the `matters` table to allow authenticated users to insert their own matters.

---

## Quick Fix - Run This SQL

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Paste and Run This SQL:**

```sql
-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;

-- Create a permissive INSERT policy for authenticated users
CREATE POLICY "matters_insert_policy" 
ON matters 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM advocates WHERE id = advocate_id
  )
);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'matters' AND policyname = 'matters_insert_policy';
```

4. **Click "Run"**

5. **Verify** - You should see the policy in the results

---

### Option 2: Via Migration File

If you prefer to create a migration:

1. The SQL is already saved in: `fix_matters_rls_policy.sql`
2. Copy it to a new migration file in `supabase/migrations/`
3. Run: `supabase db push`

---

## What This Does

The policy allows:
- ✅ Authenticated users to insert matters
- ✅ Only if they are inserting a matter for themselves (`advocate_id` matches their user ID)
- ✅ Prevents users from creating matters for other advocates

## After Running the SQL

1. **Refresh your browser**
2. **Try creating the pro forma again:**
   - Go to Dashboard
   - Find a submitted request
   - Click "Create Pro Forma"
   - Confirm

It should now work! ✅

---

## Troubleshooting

### If you still get 403:

1. **Check if you're logged in:**
   - Open browser console
   - Type: `localStorage.getItem('supabase.auth.token')`
   - Should return a token

2. **Check if policy was created:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'matters';
   ```

3. **Check advocate_id:**
   - Make sure you have a record in the `advocates` table
   - Your user ID should match an advocate ID

### If you get "policy already exists":

Run this first:
```sql
DROP POLICY IF EXISTS "matters_insert_policy" ON matters;
```

Then run the CREATE POLICY command again.

---

## Alternative: Temporary Disable RLS (NOT RECOMMENDED)

**Only for testing/debugging:**

```sql
ALTER TABLE matters DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** This removes all security! Only use temporarily for testing, then re-enable:

```sql
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
```

---

## Summary

The 403 error is a security feature (RLS) protecting your database. The fix adds a proper policy that allows authenticated users to create their own matters while maintaining security.

**Run the SQL in Supabase Dashboard and try again!** 🚀
