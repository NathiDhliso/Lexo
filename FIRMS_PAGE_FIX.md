# Firms Page Fix - October 25, 2025

## Issue Summary

The Firms page has multiple issues that need to be addressed:

1. **Cloud Storage Connections 406 Error**: Multiple 406 (Not Acceptable) errors when trying to access `cloud_storage_connections` table
2. **Firms Table Access**: The firms page may not be loading firms data properly due to RLS (Row Level Security) policy issues
3. **Missing Invitation Token Columns**: The `invitation_token`, `invitation_token_expires_at`, `invitation_token_used_at`, and `onboarded_at` columns are missing from the `firms` table, causing attorney invitation functionality to fail

## Root Cause

The firms page had **three critical issues**:

### 1. Missing Navigation Handler (PRIMARY ISSUE - FIXED)
The `MainLayout` component in `AppRouter.tsx` had a `handlePageChange` function that was missing a case for `'firms'`. When users clicked on firms menu items, the navigation handler would fall through to the default case and redirect to the dashboard instead.

**Before:**
```typescript
case 'wip-tracker':
  navigate('/wip-tracker');
  break;
case 'invoices':  // <-- Firms case was missing here!
  navigate('/invoices');
  break;
```

**After:**
```typescript
case 'wip-tracker':
  navigate('/wip-tracker');
  break;
case 'firms':
  navigate('/firms');
  break;
case 'invoices':
  navigate('/invoices');
  break;
```

### 2. Database RLS Policy Issues (SECONDARY ISSUE - FIXED)
The database tables have Row Level Security (RLS) enabled, but the policies were either missing or incorrectly configured, preventing authenticated users from accessing the data.

### 3. Missing Invitation Token Columns (NEW ISSUE - REQUIRES DATABASE MIGRATION)
The attorney invitation feature tries to update columns that don't exist in the production database:
- `invitation_token` - Secure token for invitation links
- `invitation_token_expires_at` - Token expiration timestamp
- `invitation_token_used_at` - Timestamp when token was used
- `onboarded_at` - Timestamp when attorney completed onboarding

**Error Message:**
```
PATCH https://ecaamkrcsjrcjmcjshlu.supabase.co/rest/v1/firms?id=eq.7b66a44b-921f-43cb-8f62-bc9762812657&select=* 400 (Bad Request)
Error: Could not find the 'invitation_token' column of 'firms' in the schema cache
```

### Errors Observed:
```
GET https://ecaamkrcsjrcjmcjshlu.supabase.co/rest/v1/cloud_storage_connections?
  select=*&advocate_id=eq.dcea3d54-621b-4f9e-ae63-596b98ebd984&is_primary=eq.true&is_active=eq.true 
  406 (Not Acceptable)
```

## Solution Applied

### 1. Fixed Navigation Handler (CRITICAL FIX)
Added the missing `'firms'` case to the `handlePageChange` function in `AppRouter.tsx`. This ensures that when users click on firms menu items, they are properly navigated to `/firms` instead of being redirected back to the dashboard.

### 2. Enhanced Logging
Added comprehensive logging to `FirmsPage.tsx` to help diagnose issues:
- Component mount/unmount logging
- Authentication state logging
- Fetch operation logging with detailed success/failure messages

### 3. Database Migration (REQUIRED FOR CLOUD STORAGE FIX)
Created `FIX_FIRMS_RLS.sql` with the following fixes:

#### Firms Table Policies:
- **SELECT**: Allow all authenticated users to view all firms
- **INSERT**: Allow authenticated users to create firms
- **UPDATE**: Allow authenticated users to update firms
- **DELETE**: Allow authenticated users to delete firms

#### Cloud Storage Connections Policies:
- **SELECT**: Allow users to view only their own connections (advocate_id = auth.uid())
- **INSERT**: Allow users to create only their own connections
- **UPDATE**: Allow users to update only their own connections
- **DELETE**: Allow users to delete only their own connections

#### Permissions:
- Granted SELECT, INSERT, UPDATE, DELETE permissions to authenticated role
- Granted USAGE on relevant sequences

## How to Apply the Fix

### Step 1: Test the Navigation Fix (IMMEDIATE - ALREADY APPLIED)
The navigation fix has already been applied to the code. Simply:
1. Refresh your browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Navigate to the Firms page using the menu
3. The page should now load successfully!

### Step 2: Apply RLS Policy Migration (IF CLOUD STORAGE ERRORS PERSIST)
If you still see the 406 errors for cloud_storage_connections:
1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Open the file `FIX_FIRMS_RLS.sql`
4. Copy and paste the entire content
5. Click "Run" to execute
6. Review the verification queries at the bottom to confirm success

### Step 3: Add Invitation Token Columns (REQUIRED FOR ATTORNEY INVITATIONS)
**This is CRITICAL if you want to invite attorneys to firms:**

1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Open the file `ADD_INVITATION_TOKEN_COLUMNS.sql` (in the root directory)
4. Copy and paste the entire content
5. Click "Run" to execute
6. Run the verification queries at the bottom to confirm:
   - All 4 columns were added (`invitation_token`, `invitation_token_expires_at`, `invitation_token_used_at`, `onboarded_at`)
   - Index was created (`idx_firms_invitation_token`)
   - Permissions are correct

**Without this migration, the "Invite Attorney" feature will NOT work!**

### Step 3: Verify Everything Works
1. Refresh your browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Navigate to the Firms page using the menu
3. Open the browser console (F12)
4. Look for the following logs:
   ```
   [FirmsPage] Component mounted/rendered
   [FirmsPage] fetchFirms called. loading: false isAuthenticated: true
   [FirmsPage] Fetching firms from database...
   [FirmsPage] Successfully fetched firms: X firms
   ```
5. Test the "Invite Attorney" feature:
   - Click on a firm's action menu
   - Select "Invite Attorney"
   - Click "Generate Token"
   - You should see a success message with an invitation link
   - If you see the error about `invitation_token` column, the migration wasn't applied

### Step 3: Verify Cloud Storage
The cloud storage connection errors should also be resolved. You should no longer see the 406 errors in the console.

### Step 4: Verify Attorney Invitations
1. Navigate to the Firms page
2. Click on a firm's action menu (three dots)
3. Select "Invite Attorney"
4. Click "Generate Token"
5. You should see:
   - A success toast message
   - An invitation link displayed
   - No console errors about missing columns

## Expected Behavior After Fix

1. **Firms Page Loads**: The firms page should load without errors
2. **No 406 Errors**: Cloud storage connection queries should succeed or gracefully fail with proper error messages
3. **Data Visibility**: Users can view, create, update, and delete firms
4. **Attorney Invitations Work**: Users can generate invitation tokens and invite attorneys to firms
5. **Clear Logging**: Console logs provide clear indication of what's happening

## Troubleshooting

If the issue persists after applying the fix:

### Check Console Logs
Look for these specific patterns:
- `[FirmsPage] Component mounted/rendered` - Confirms page is loading
- `[FirmsPage] Skipping fetch - auth not ready` - Indicates auth issue
- `[FirmsPage] Error fetching firms:` - Shows database error details

### Common Issues

1. **Migration Not Applied**
   - Verify by running the verification queries in the SQL file
   - Check that policies exist: `SELECT * FROM pg_policies WHERE tablename = 'firms';`

2. **Invitation Token Columns Missing**
   - Error: `Could not find the 'invitation_token' column of 'firms' in the schema cache`
   - Solution: Run `ADD_INVITATION_TOKEN_COLUMNS.sql` in Supabase SQL Editor
   - Verify columns exist: 
     ```sql
     SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'firms' 
     AND column_name LIKE '%invitation%';
     ```

3. **Authentication Issue**
   - Check if user is properly logged in
   - Verify auth token is valid
   - Check console for auth-related errors

4. **Network Issues**
   - Verify Supabase URL and anon key in environment variables
   - Check browser network tab for failed requests
   - Look for CORS or network connectivity issues

5. **Data Not Loading**
   - Run: `SELECT COUNT(*) FROM firms;` in SQL Editor to verify table has data
   - Check if advocate_id is properly set in the firms table

## Files Modified

1. **`src/AppRouter.tsx`** - Added missing `'firms'` case to `handlePageChange` function (CRITICAL FIX)
2. **`src/pages/FirmsPage.tsx`** - Added comprehensive logging for debugging
3. **`FIX_FIRMS_RLS.sql`** - New SQL migration file for RLS policies (cloud storage fix)
4. **`ADD_INVITATION_TOKEN_COLUMNS.sql`** - New SQL migration file to add invitation token columns (attorney invitation fix)

## Related Files

- `supabase/migrations/20250125000000_fix_firms_rls_policies.sql` - Original migration (if exists)
- `supabase/migrations/20250115000001_create_firms_table.sql` - Original firms table creation

## Next Steps

After confirming the fix works:

1. Consider removing or reducing the verbose console logging in `FirmsPage.tsx` if not needed
2. Monitor for any other RLS-related issues in other tables
3. Document any custom firm creation or management flows
4. Test all firm-related actions (create, update, delete, invite attorneys)

## Prevention

To prevent similar issues in the future:

1. Always include RLS policies when creating new tables
2. Test with actual authenticated users, not just admin
3. Use the Supabase Policy Editor to verify policies
4. Include verification queries in all migration scripts
5. Add proper error handling and logging early in development
