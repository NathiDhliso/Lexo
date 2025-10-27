# Apply Logged Services RLS Fix

## Problem
Getting 403 Forbidden errors when accessing the WIP Tracker page:
```
Failed to load resource: the server responded with a status of 403
Error loading WIP items: Object
```

## Root Cause
The `logged_services` table RLS policies only check if `advocate_id = auth.uid()`, but queries are made by `matter_id`. The policies need to verify that the user owns the matter.

## Solution
Update RLS policies to check matter ownership through the `matters` table.

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `FIX_LOGGED_SERVICES_RLS.sql`
4. Copy and paste the entire contents
5. Click **Run**
6. Verify success message

### Option 2: Supabase CLI
```powershell
# From the project root
supabase db push --include-all
```

Or apply directly:
```powershell
psql $DATABASE_URL -f FIX_LOGGED_SERVICES_RLS.sql
```

### Option 3: Create New Migration
```powershell
# Create a new migration file
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
New-Item -ItemType File -Path "supabase/migrations/${timestamp}_fix_logged_services_rls.sql"

# Copy the contents from FIX_LOGGED_SERVICES_RLS.sql
# Then apply:
supabase db push
```

## Verification

After applying the fix, run these tests in the SQL Editor:

### Test 1: Verify Policies Exist
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'logged_services'
ORDER BY policyname;
```

Expected output (4 policies):
- Advocates can delete own uninvoiced logged services
- Advocates can insert logged services for their matters
- Advocates can update own uninvoiced logged services
- Advocates can view logged services for their matters

### Test 2: Test SELECT Permission
```sql
-- Replace with your actual matter_id
SELECT * 
FROM logged_services 
WHERE matter_id = '4a3b9ac0-d374-41da-b049-b58eceb09851' 
  AND invoice_id IS NULL
ORDER BY service_date DESC;
```

Should return results (or empty array) with no 403 error.

### Test 3: Test INSERT Permission
```sql
-- Replace with your actual matter_id
INSERT INTO logged_services (
  matter_id, 
  advocate_id, 
  service_date, 
  description, 
  service_type, 
  unit_rate,
  quantity
) VALUES (
  '4a3b9ac0-d374-41da-b049-b58eceb09851',
  auth.uid(),
  CURRENT_DATE,
  'Test service entry',
  'consultation',
  1000.00,
  1
)
RETURNING *;
```

Should succeed and return the new record.

### Test 4: Application Test
1. Open your LexoHub application
2. Navigate to a matter
3. Click **WIP Tracker** in the MegaMenu
4. **Expected:** Page loads without 403 errors
5. **Expected:** Console shows no "Failed to load resource" errors
6. **Expected:** WIP items display correctly

## What Changed

### BEFORE (Broken)
```sql
CREATE POLICY "Advocates can view own logged services"
  ON logged_services FOR SELECT TO authenticated
  USING (advocate_id = auth.uid());
```
❌ Only checks if service.advocate_id matches user
❌ Fails when querying by matter_id

### AFTER (Fixed)
```sql
CREATE POLICY "Advocates can view logged services for their matters"
  ON logged_services FOR SELECT TO authenticated
  USING (
    advocate_id = auth.uid()
    OR
    matter_id IN (SELECT id FROM matters WHERE advocate_id = auth.uid())
  );
```
✅ Checks if service.advocate_id matches user
✅ OR if matter belongs to user
✅ Allows queries by matter_id

## Impact
- ✅ Fixes 403 errors on WIP Tracker page
- ✅ Allows viewing logged services by matter
- ✅ Maintains security (users can only see their own data)
- ✅ No breaking changes to application code

## Rollback
If you need to rollback (unlikely), restore the original policies:

```sql
DROP POLICY IF EXISTS "Advocates can view logged services for their matters" ON logged_services;
DROP POLICY IF EXISTS "Advocates can insert logged services for their matters" ON logged_services;
DROP POLICY IF EXISTS "Advocates can update own uninvoiced logged services" ON logged_services;
DROP POLICY IF EXISTS "Advocates can delete own uninvoiced logged services" ON logged_services;

-- Restore original (more restrictive) policies
CREATE POLICY "Advocates can view own logged services"
  ON logged_services FOR SELECT TO authenticated
  USING (advocate_id = auth.uid());

-- ... (other policies)
```

## Related Tables
The following tables already have correct RLS policies:
- ✅ `time_entries` - checks advocate_id, works correctly
- ✅ `expenses` - checks advocate_id, works correctly
- ✅ `matters` - checks advocate_id, works correctly

## Questions?
If the fix doesn't work:
1. Check that you're logged in (auth.uid() returns a value)
2. Verify the matter exists and belongs to you
3. Check Supabase logs for detailed error messages
4. Verify RLS is enabled: `SELECT tablename FROM pg_tables WHERE tablename = 'logged_services' AND rowsecurity = true;`

---

**Status:** Ready to apply  
**Risk:** Low (only affects RLS policies, no schema changes)  
**Downtime:** None (applied instantly)
