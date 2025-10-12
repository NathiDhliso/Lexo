# Migration Cleanup Plan

## Current Situation
Your database has evolved and some migrations are now outdated or conflicting with the current schema. The main issues:

1. **advocates table** - Already renamed to `advocates_deprecated` in your database
2. **user_profiles table** - Exists and is the primary user table
3. **Duplicate/conflicting migrations** - Multiple versions of the same migration

## Migrations to DELETE

### ❌ Obsolete User Consolidation Migrations
These try to migrate from `advocates` to `user_profiles`, but `advocates` is already gone:

```
supabase/migrations/20250113000002_consolidate_user_advocate_models.sql
supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql
```

**Why delete:** These migrations assume `advocates` table exists and try to migrate data from it. Since the table is already `advocates_deprecated`, these will fail.

### ❌ Duplicate Invoice Status Migrations
You have 3 versions of the same migration:

```
supabase/migrations/20250113000001_add_invoice_pro_forma_status.sql
supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART1.sql
supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART2.sql
```

**Keep:** The PART1 and PART2 versions (they're split for size)
**Delete:** The original single file version

### ❌ Outdated RLS Policy Migration
```
supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql
```

**Why delete:** This migration references `advocates` table columns that don't exist. We'll create a new one that works with the current schema.

## Migrations to KEEP

### ✅ Core Schema
```
supabase/migrations/20250101000000_fresh_core_schema.sql
```
Your base schema - keep this.

### ✅ Team & User Profiles
```
supabase/migrations/20250110_team_members.sql
```
This creates the `user_profiles` table - essential.

### ✅ All Feature Migrations
Keep all migrations that add features:
- Cloud storage
- Subscriptions
- PDF templates
- Document uploads
- Engagement agreements
- Retainer system
- Attorney portal
- Brief management
- etc.

## New Migration to ADD

### ✅ Schema Alignment Migration
```
supabase/migrations/20250113000004_align_schema_with_database.sql
```

This new migration:
- Adds all necessary columns to `user_profiles`
- Creates `advocates_view` for backward compatibility
- Updates foreign keys to point to `user_profiles`
- Handles the case where `advocates` is already gone

## Recommended Actions

### Step 1: Delete Obsolete Migrations
```powershell
# Delete conflicting user consolidation migrations
Remove-Item supabase/migrations/20250113000002_consolidate_user_advocate_models.sql
Remove-Item supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql

# Delete duplicate invoice migration
Remove-Item supabase/migrations/20250113000001_add_invoice_pro_forma_status.sql

# Delete outdated RLS migration
Remove-Item supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql
```

### Step 2: Run the New Alignment Migration
```powershell
# This will align your schema properly
supabase db push
```

### Step 3: Create New RLS Migration (if needed)
After the alignment migration runs successfully, we can create a new RLS policy migration that works with the current schema.

## Why This Approach?

1. **Idempotent** - The new migration checks if things exist before creating them
2. **Safe** - Doesn't assume any particular state
3. **Clean** - Removes conflicting migrations that will never work
4. **Forward-compatible** - Sets up proper structure for future migrations

## Migration Execution Order

After cleanup, migrations will run in this order:
1. Core schema (20250101000000)
2. Feature additions (2025010x - 2025011x)
3. Team members & user_profiles (20250110_team_members)
4. Schema alignment (20250113000004) ← NEW
5. Invoice status updates (PART1 & PART2)

## Next Steps

1. Review this plan
2. Backup your database
3. Delete the obsolete migrations
4. Run `supabase db push` to apply the new alignment migration
5. Verify everything works
6. Create new RLS policies if needed
