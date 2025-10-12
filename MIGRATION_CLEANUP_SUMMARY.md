# Migration Cleanup - Complete Summary

## 🎯 Problem Identified

Your migrations were failing because:
1. **advocates table doesn't exist** - It's already been renamed to `advocates_deprecated`
2. **Conflicting migrations** - Multiple versions trying to do the same thing
3. **Schema misalignment** - Migrations assuming a different database state

## ✅ Solution Provided

### 1. New Clean Migration Created
**File:** `supabase/migrations/20250113000004_align_schema_with_database.sql`

This migration:
- ✓ Checks if columns exist before adding them (idempotent)
- ✓ Adds all advocate-specific columns to `user_profiles`
- ✓ Creates `advocates_view` for backward compatibility
- ✓ Updates foreign keys to point to `user_profiles`
- ✓ Handles missing `advocates` table gracefully
- ✓ Provides clear progress notifications

### 2. Cleanup Script Created
**File:** `cleanup-migrations.ps1`

Automatically removes these obsolete migrations:
- `20250113000002_consolidate_user_advocate_models.sql`
- `20250113000002_consolidate_user_advocate_models_CORRECTED.sql`
- `20250113000001_add_invoice_pro_forma_status.sql` (duplicate)
- `20250113000003_update_rls_policies_for_user_profiles.sql` (outdated)

### 3. Documentation Created
**File:** `MIGRATION_CLEANUP_PLAN.md`

Complete explanation of:
- Why each migration is being removed
- What the new migration does
- Execution order
- Next steps

## 🚀 How to Execute

### Option 1: Automated (Recommended)
```powershell
# Run the cleanup script
.\cleanup-migrations.ps1

# Apply the new migration
supabase db push
```

### Option 2: Manual
```powershell
# Delete obsolete migrations
Remove-Item supabase/migrations/20250113000002_consolidate_user_advocate_models.sql
Remove-Item supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql
Remove-Item supabase/migrations/20250113000001_add_invoice_pro_forma_status.sql
Remove-Item supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql

# Apply the new migration
supabase db push
```

## 📋 What the New Migration Does

### Part 1: Add Columns to user_profiles
Safely adds these columns if they don't exist:
- `practice_number` - Advocate's practice number
- `year_admitted` - Year admitted to the bar
- `hourly_rate` - Default hourly rate
- `contingency_rate` - Contingency fee rate
- `success_fee_rate` - Success fee rate
- `chambers_address` - Physical address
- `postal_address` - Postal address
- `firm_name` - Firm/chambers name
- `firm_tagline` - Firm tagline
- `firm_logo_url` - Logo URL
- `vat_number` - VAT registration
- `bank_name` - Banking details
- `bank_account_number` - Account number
- `bank_branch_code` - Branch code
- `is_active` - Active status
- `user_role` - Role (junior/senior/admin)
- `initials` - User initials
- `email` - Email address
- `last_login_at` - Last login timestamp

### Part 2: Create advocates_view
Creates a view that:
- Maps `user_profiles` to look like the old `advocates` table
- Provides backward compatibility
- Filters to only show users with `practice_number`

### Part 3: Update Foreign Keys
Automatically finds and updates all foreign keys that point to `advocates_deprecated` to point to `user_profiles.user_id` instead.

## 🔍 Migration Safety Features

1. **Idempotent** - Can be run multiple times safely
2. **Checks existence** - Only adds what's missing
3. **No data loss** - Doesn't drop or modify existing data
4. **Clear logging** - Shows exactly what it's doing
5. **Graceful handling** - Works regardless of current state

## 📊 Expected Results

After running the migration, you should see:
```
========================================
Starting Schema Alignment Migration
========================================
✓ Added practice_number column
✓ Added year_admitted column
✓ Added hourly_rate column
... (etc)
✓ Created advocates_view
========================================
Updating foreign key constraints
========================================
✓ Updated FK: matters.advocate_id -> user_profiles
✓ Updated FK: invoices.advocate_id -> user_profiles
... (etc)
========================================
🎉 SCHEMA ALIGNMENT COMPLETE!
========================================
User profiles: X
Foreign keys to user_profiles: Y
========================================
```

## 🎯 Benefits

1. **Clean migration history** - No conflicting files
2. **Aligned schema** - Database matches your types
3. **Backward compatible** - Old code still works via view
4. **Future-proof** - Proper foundation for new features
5. **Maintainable** - Clear, documented approach

## ⚠️ Important Notes

1. **Backup first** - Always backup before running migrations
2. **Test in dev** - Run in development environment first
3. **Check foreign keys** - Verify all relationships work
4. **Update code** - May need to update queries to use `user_profiles`
5. **RLS policies** - May need new policies for `user_profiles`

## 🔄 Next Steps After Migration

1. ✓ Run the cleanup script
2. ✓ Apply the new migration
3. ⏳ Test user authentication
4. ⏳ Test matter creation
5. ⏳ Test invoice generation
6. ⏳ Verify all foreign key relationships
7. ⏳ Update RLS policies if needed
8. ⏳ Update any hardcoded `advocates` references in code

## 📞 If Issues Occur

If the migration fails:
1. Check the error message carefully
2. Verify `user_profiles` table exists
3. Check if columns already exist
4. Look for foreign key conflicts
5. Review the migration log output

Common issues and fixes:
- **Column already exists** - Migration will skip it (safe)
- **Foreign key conflict** - Migration checks before creating
- **View already exists** - Will be replaced
- **No user_profiles table** - Check team_members migration ran

## ✨ Summary

You now have:
- ✅ Clean migration that works with your current schema
- ✅ Automated cleanup script
- ✅ Complete documentation
- ✅ Safe, idempotent approach
- ✅ Backward compatibility via view

Ready to execute when you are!
