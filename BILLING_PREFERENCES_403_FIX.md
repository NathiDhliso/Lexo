# Billing Preferences 403 Error Fix

## Issue
Console shows 403 Forbidden error when fetching advocate billing preferences:
```
GET https://ecaamkrcsjrcjmcjshlu.supabase.co/rest/v1/advocate_billing_preferences?select=*&advocate_id=eq.dcea3d54-621b-4f9e-ae63-596b98ebd984 403 (Forbidden)
```

## Root Cause
The `advocate_billing_preferences` table was missing proper RLS (Row Level Security) policies, preventing authenticated users from accessing their own billing preferences.

## Solution

### 1. Database Migration
Created migration `20251027180000_fix_advocate_billing_preferences_rls.sql` that:

1. Ensures RLS is enabled on the table
2. Drops all conflicting/outdated policies
3. Creates fresh, properly scoped policies:
   - `Advocates can view own billing preferences` - SELECT access
   - `Advocates can insert own billing preferences` - INSERT access
   - `Advocates can update own billing preferences` - UPDATE access
   - `Advocates can delete own billing preferences` - DELETE access
4. Grants necessary permissions to authenticated users

### 2. Service Layer Improvement
Updated `billing-preferences.service.ts` to handle 403 permission errors gracefully:
- Detects RLS policy issues (403/PGRST301 errors)
- Falls back to default preferences automatically
- Logs warning for debugging without breaking the app
- Ensures smooth user experience even during migration

## How to Apply

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\apply-billing-preferences-rls-fix.ps1
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/20251027180000_fix_advocate_billing_preferences_rls.sql`
3. Paste and run the SQL
4. Verify policies in Authentication > Policies section

### Option 3: Using Supabase CLI
```bash
supabase db push
```

## Verification
After applying the migration:

1. Refresh your app
2. Check browser console - the 403 error should be gone
3. Verify in Supabase Dashboard:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd
   FROM pg_policies
   WHERE tablename = 'advocate_billing_preferences'
   ORDER BY policyname;
   ```

## Expected Result
- No more 403 errors in console
- Billing preferences load correctly
- Users can view/update their own preferences
- Service continues to fall back to defaults gracefully if no preferences exist

## Related Files
- Migration: `supabase/migrations/20251027180000_fix_advocate_billing_preferences_rls.sql`
- Service: `src/services/api/billing-preferences.service.ts`
- Apply Script: `apply-billing-preferences-rls-fix.ps1`
