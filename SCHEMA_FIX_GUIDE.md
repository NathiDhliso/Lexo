# Schema Fix Guide

## Problem Summary

You're experiencing 406 (Not Acceptable) and 400 (Bad Request) errors when querying Supabase:

```
GET /rest/v1/user_profiles?select=*&user_id=eq.xxx 406 (Not Acceptable)
HEAD /rest/v1/matters?select=*&user_id=eq.xxx&status=eq.active 400 (Bad Request)
HEAD /rest/v1/user_profiles?select=*&organization_id=eq.xxx 400 (Bad Request)
```

## Root Causes

1. **user_profiles RLS Policy Issue**: The RLS policies only allow `auth.uid() = user_id`, but queries are trying to filter by `user_id` explicitly, which gets blocked
2. **matters Missing user_id Column**: The `matters` table uses `advocate_id` but queries are looking for `user_id`
3. **user_profiles Missing organization_id**: Queries are trying to filter by `organization_id` which doesn't exist

## Solution

### Option 1: Run SQL Directly in Supabase (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-schema-errors.sql`
4. Click "Run" to execute
5. Refresh your application

### Option 2: Apply Migrations via CLI

```powershell
# Apply the migrations
supabase db push --file supabase/migrations/20250111000020_fix_user_profiles_rls.sql
supabase db push --file supabase/migrations/20250111000021_add_missing_columns.sql
```

Or use the PowerShell script:

```powershell
.\apply-schema-fixes.ps1
```

## What the Fix Does

### 1. Fixes user_profiles RLS Policies
- Maintains security while allowing proper queries
- Adds team member access for organization profiles
- Ensures users can only see their own data or their team's data

### 2. Adds user_id to matters Table
- Creates `user_id` column as an alias for `advocate_id`
- Automatically syncs `user_id` with `advocate_id` via trigger
- Updates RLS policies to work with both columns
- Maintains backward compatibility

### 3. Updates matters RLS Policies
- Allows queries using either `advocate_id` or `user_id`
- Adds team member access for organization matters
- Maintains proper security boundaries

## Verification

After applying the fix, run these queries in Supabase SQL Editor to verify:

```sql
-- Check if user_id column exists in matters
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matters' AND column_name = 'user_id';

-- Check RLS policies on user_profiles
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check RLS policies on matters
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'matters';
```

## Testing

After applying the fix:

1. Clear your browser cache and refresh
2. Log in to your application
3. Navigate to the dashboard
4. Check the browser console - the 406 and 400 errors should be gone
5. Verify that matters and profiles load correctly

## Additional Notes

- The `user_id` column in `matters` is automatically kept in sync with `advocate_id`
- All existing data is preserved
- No breaking changes to existing functionality
- Team members can now access organization data properly

## Troubleshooting

If you still see errors after applying the fix:

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Check migrations**: Verify migrations were applied in Supabase Dashboard > Database > Migrations
3. **Check RLS**: Ensure RLS is enabled on both tables
4. **Check auth**: Verify you're properly authenticated

## Need Help?

If issues persist, check:
- Supabase logs in Dashboard > Logs
- Browser console for detailed error messages
- Network tab to see exact query parameters
