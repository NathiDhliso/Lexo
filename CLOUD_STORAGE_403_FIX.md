# Fix 403 Forbidden Error - Cloud Storage

## Problem
Getting 403 Forbidden when trying to access cloud storage connections. This happens because:
1. The RLS policies expect `advocate_id` to match `auth.uid()`
2. But your app uses an `advocates` table where `user_id` links to auth users
3. The service is passing `user.id` but the policies need to check the `advocates` table

## Solution

### Step 1: Run the RLS Fix SQL

Run `fix-cloud-storage-rls.sql` in your Supabase SQL Editor. This updates the policies to work with both:
- Direct `auth.uid()` match (for simple setups)
- `advocates` table lookup (for your setup)

### Step 2: Verify Your Schema

Check if you have an `advocates` table:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'advocates' 
AND table_schema = 'public';
```

You should see columns like:
- `id` (UUID)
- `user_id` (UUID) - links to auth.users

### Step 3: Test the Fix

After running the SQL:
1. Refresh your app
2. Go to Settings → Cloud Storage
3. The 403 error should be gone
4. You should see the cloud storage providers

## What the Fix Does

The new RLS policies check BOTH:
```sql
advocate_id IN (
  SELECT id FROM advocates WHERE user_id = auth.uid()
)
OR advocate_id = auth.uid()
```

This works whether:
- You're using the `advocates` table (first condition)
- You're using auth.uid() directly (second condition)

## If You Still Get 403

### Option A: Check if advocates table exists
```sql
SELECT * FROM advocates WHERE user_id = auth.uid();
```

If this returns nothing, you need to create an advocate record for your user.

### Option B: Temporarily disable RLS (NOT for production!)
```sql
ALTER TABLE cloud_storage_connections DISABLE ROW LEVEL SECURITY;
```

This will let you test the OAuth flow, but re-enable it before going to production!

### Option C: Check your user ID
```sql
SELECT auth.uid();
```

Make sure this returns your actual user ID.

## Next Steps

Once the 403 is fixed:
1. Add your OneDrive OAuth credentials to `.env`
2. Restart your dev server
3. Test the "Connect" button
4. You should be redirected to Microsoft login
