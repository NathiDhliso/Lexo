# Matter Creation Database Fixes

## Problems

### Problem 1: Missing Columns
The application was throwing a database error when trying to create matters:

```
Error creating active matter: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'urgency' column of 'matters' in the schema cache"
}
```

### Problem 2: Missing Advocates Table
After fixing the columns, another error appeared:

```
Error creating active matter: {
  code: '42P01',
  details: null,
  hint: null,
  message: 'relation "advocates" does not exist'
}
```

## Root Causes

### Root Cause 1: Missing Columns
The code in `matter-api.service.ts` was trying to insert data into columns that don't exist in the database:

- `urgency` - Urgency level (routine, standard, urgent, emergency)
- `practice_area` - Practice area or legal specialty
- `deadline_date` - Deadline date for the matter
- `creation_source` - Source of matter creation
- `is_quick_create` - Quick create workflow flag
- `date_accepted` - Date when matter was accepted
- `date_commenced` - Date when work commenced

These columns are used by:
1. **Quick Add Matter** feature (MattersPage.tsx)
2. **Quick Brief Capture** workflow
3. **Matter Request** workflow (attorney invitation system)

### Root Cause 2: Broken Trigger
The `set_matter_reference_trigger` function was querying the `advocates` table to get the bar association field:

```sql
SELECT bar FROM advocates WHERE id = NEW.advocate_id
```

However, your production database uses `user_profiles` table instead of `advocates`, and `user_profiles` doesn't have a `bar` field.

## Solutions

### Solution 1: Add Missing Columns
Created migration `20250127000004_add_urgency_column.sql` that:

1. Creates a new enum type `matter_urgency` with values: routine, standard, urgent, emergency
2. Adds all missing columns to the `matters` table
3. Creates indexes for efficient querying
4. Adds documentation comments

### Solution 2: Fix Matter Reference Trigger
Created migration `20250127000005_fix_matter_reference_trigger.sql` that:

1. Drops the broken trigger and function
2. Recreates the function without dependency on `advocates` table
3. Uses 'JHB' as default prefix (can be made configurable later)
4. Maintains the same reference format: JHB/YYYY/NNN

## How to Apply

### Option 1: Using PowerShell Script (Recommended)

```powershell
.\apply-matter-fixes.ps1
```

This script will apply both migrations in the correct order.

### Option 2: Using Supabase CLI

```bash
supabase db push
```

This will apply all pending migrations.

### Option 3: Manual SQL Execution

If you prefer to apply the migrations manually through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Apply migrations in order:
   - First: Copy and execute `supabase/migrations/20250127000004_add_urgency_column.sql`
   - Second: Copy and execute `supabase/migrations/20250127000005_fix_matter_reference_trigger.sql`

## Verification

After applying the migration, test the following features:

1. **Quick Add Matter** - Click the "Quick Add" button on the Matters page
2. **Quick Brief Capture** - Use the Quick Brief workflow to create a matter
3. **Matter Requests** - Submit a matter request from the attorney portal

All should work without the PGRST204 error.

## Files Created

- `supabase/migrations/20250127000004_add_urgency_column.sql` - Adds missing columns
- `supabase/migrations/20250127000005_fix_matter_reference_trigger.sql` - Fixes trigger
- `apply-matter-fixes.ps1` - Helper script to apply both migrations
- `URGENCY_COLUMN_FIX.md` - This documentation file

## Related Code

The following methods in `matter-api.service.ts` use these columns:

- `createActiveMatter()` - Uses urgency field
- `createFromQuickBrief()` - Uses all new fields
- `createMatterRequest()` - Uses urgency field

## Notes

- The `urgency` column defaults to 'standard' if not specified
- All other new columns are nullable and optional
- Existing matters will have NULL values for these new columns (which is fine)
- Matter reference numbers will now use 'JHB' prefix by default
- If you need different bar association prefixes (CPT), you'll need to add a bar field to user_profiles and update the trigger

## Schema Mismatch Issue

Your codebase has a schema mismatch:
- **Migration files** define an `advocates` table
- **Production database** uses `user_profiles` table
- **Code** references `user_profiles` in queries

This suggests the initial migration (`20250101000000_fresh_core_schema.sql`) was never applied to production, or a different schema was used. Consider:

1. Documenting which migrations have been applied to production
2. Creating a schema alignment migration if needed
3. Updating the base schema file to match production reality
