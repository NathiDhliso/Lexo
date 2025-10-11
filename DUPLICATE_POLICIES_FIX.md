# Duplicate Policies Fix

## Issue Detected
Your `matters` table has **8 RLS policies** when it should only have **4**:

**Duplicates Found:**
- `matters_select_policy` AND `Advocates can view their own matters`
- `matters_insert_policy` AND `Advocates can create their own matters`
- `matters_update_policy` AND `Advocates can update their own matters`
- `matters_delete_policy` AND `Advocates can delete their own matters`

This causes conflicts and unpredictable behavior.

## Quick Fix

### Option 1: Run Complete Fix (Recommended)
Run `fix-schema-errors.sql` in Supabase SQL Editor - it handles everything including duplicates.

### Option 2: Fix Only Duplicates
If you just want to fix the duplicate policies:

1. Open Supabase SQL Editor
2. Copy and paste `fix-duplicate-policies.sql`
3. Click "Run"

## What Gets Fixed
- Removes all 8 duplicate policies
- Creates 4 clean, consolidated policies
- Maintains proper security with team member access
- Supports both `advocate_id` and `user_id` columns

## After the Fix
Run this query to verify:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'matters'
ORDER BY cmd;
```

You should see exactly 4 policies:
- `matters_delete_policy` (DELETE)
- `matters_insert_policy` (INSERT)
- `matters_select_policy` (SELECT)
- `matters_update_policy` (UPDATE)

## Why This Happened
Multiple migrations created policies with different names, causing duplicates. The fix consolidates them into a single, clean set.
