# Database Permission Errors - Quick Fix

## Errors Identified

```
403 Forbidden: /rest/v1/firms?select=*&order=firm_name.asc
406 Not Acceptable: /rest/v1/cloud_storage_connections
```

## Root Cause

The Row Level Security (RLS) policies for these tables are either:
1. Missing
2. Too restrictive
3. Not allowing SELECT operations for the current user

## Quick Fix SQL

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Fix firms table RLS policies
-- Allow advocates to read all firms they're associated with
DROP POLICY IF EXISTS "Advocates can view their firms" ON firms;
CREATE POLICY "Advocates can view their firms" ON firms
  FOR SELECT
  USING (
    advocate_id = auth.uid()
    OR id IN (
      SELECT firm_id FROM firm_attorneys WHERE attorney_user_id = auth.uid()
    )
  );

-- Allow advocates to create firms
DROP POLICY IF EXISTS "Advocates can create firms" ON firms;
CREATE POLICY "Advocates can create firms" ON firms
  FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

-- Allow advocates to update their own firms
DROP POLICY IF EXISTS "Advocates can update their firms" ON firms;
CREATE POLICY "Advocates can update their firms" ON firms
  FOR UPDATE
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());

-- Fix cloud_storage_connections table RLS policies
-- Allow advocates to view their own connections
DROP POLICY IF EXISTS "Advocates can view their storage connections" ON cloud_storage_connections;
CREATE POLICY "Advocates can view their storage connections" ON cloud_storage_connections
  FOR SELECT
  USING (advocate_id = auth.uid());

-- Allow advocates to manage their own connections
DROP POLICY IF EXISTS "Advocates can manage their storage connections" ON cloud_storage_connections;
CREATE POLICY "Advocates can manage their storage connections" ON cloud_storage_connections
  FOR ALL
  USING (advocate_id = auth.uid())
  WITH CHECK (advocate_id = auth.uid());
```

## Verification

After running the SQL, test by:

1. Refresh the Firms page
2. Check browser console - errors should be gone
3. Try creating a new firm
4. Check Settings > Cloud Storage

## Alternative: Temporary Disable RLS (NOT RECOMMENDED FOR PRODUCTION)

If you need immediate access for development:

```sql
-- DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
ALTER TABLE firms DISABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_connections DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable RLS before deploying:

```sql
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_connections ENABLE ROW LEVEL SECURITY;
```

## Root Cause Analysis

The errors suggest:
- **403 Forbidden**: RLS policy exists but denies access
- **406 Not Acceptable**: Possible content-type mismatch or missing policy

The firms table likely needs policies that allow:
- Advocates to SELECT firms where they are the advocate_id
- Advocates to INSERT new firms
- Advocates to UPDATE their own firms

The cloud_storage_connections table needs:
- Advocates to SELECT/INSERT/UPDATE/DELETE their own connections

## Next Steps

1. Run the SQL fix above
2. Refresh the application
3. Test firms page functionality
4. Test cloud storage settings
5. If issues persist, check Supabase logs for detailed error messages
