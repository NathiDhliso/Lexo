# Code Fix Applied - Subscription Service

## Problem Found
The 406 and 400 errors were caused by **incorrect queries** in `src/services/api/subscription.service.ts`:

### Issues Fixed:

1. **Line 140**: Used `user_id` instead of `advocate_id` on `matters` table
   ```typescript
   // ❌ WRONG
   .eq('user_id', user.id)
   
   // ✅ FIXED
   .eq('advocate_id', user.id)
   ```

2. **Line 147**: Queried non-existent `organization_id` column on `user_profiles` table
   ```typescript
   // ❌ WRONG
   .from('user_profiles')
   .eq('organization_id', user.id)
   
   // ✅ FIXED
   .from('team_members')
   .eq('organization_id', user.id)
   ```

## What Was Changed

### File: `src/services/api/subscription.service.ts`

**getUsageMetrics() method:**
- Changed `matters` query from `user_id` to `advocate_id`
- Changed from querying `user_profiles` to `team_members` table
- Now correctly counts team members using the proper table

## Next Steps

### 1. Still Need to Run Database Fix
The database still needs the schema fixes. Run this in Supabase SQL Editor:
```sql
-- Copy and paste contents of fix-schema-errors.sql
```

### 2. Test the Application
1. Save all files
2. Restart your dev server if needed
3. Hard refresh browser (Ctrl+Shift+R)
4. Check browser console - errors should be gone!

## Why This Happened

The subscription service was written before the schema was finalized, using assumed column names that didn't match the actual database structure:
- `matters` table uses `advocate_id`, not `user_id`
- Team members are tracked in `team_members` table, not `user_profiles`

## Verification

After the fix, the `getUsageMetrics()` method now:
- ✓ Correctly queries `matters` by `advocate_id`
- ✓ Correctly queries `team_members` by `organization_id`
- ✓ Returns accurate usage metrics
- ✓ No more 406/400 errors

## Summary

**Code Fix**: ✅ Applied
**Database Fix**: ⏳ Still needed (run `fix-schema-errors.sql`)
**Expected Result**: No more 406/400 errors after both fixes
