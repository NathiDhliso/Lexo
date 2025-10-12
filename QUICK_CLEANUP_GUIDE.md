# Quick Migration Cleanup Guide

## 🚨 The Problem
Migrations failing because `advocates` table doesn't exist (it's already `advocates_deprecated`).

## ✅ The Solution (2 Commands)

```powershell
# 1. Clean up obsolete migrations
.\cleanup-migrations.ps1

# 2. Apply the new alignment migration
supabase db push
```

## 📁 Files Created

| File | Purpose |
|------|---------|
| `cleanup-migrations.ps1` | Deletes obsolete migration files |
| `supabase/migrations/20250113000004_align_schema_with_database.sql` | New clean migration |
| `MIGRATION_CLEANUP_PLAN.md` | Detailed explanation |
| `MIGRATION_CLEANUP_SUMMARY.md` | Complete documentation |
| `QUICK_CLEANUP_GUIDE.md` | This file |

## 🗑️ What Gets Deleted

- ❌ `20250113000002_consolidate_user_advocate_models.sql`
- ❌ `20250113000002_consolidate_user_advocate_models_CORRECTED.sql`
- ❌ `20250113000001_add_invoice_pro_forma_status.sql` (duplicate)
- ❌ `20250113000003_update_rls_policies_for_user_profiles.sql` (outdated)

## ✨ What Gets Added

- ✅ All advocate columns to `user_profiles`
- ✅ `advocates_view` for backward compatibility
- ✅ Updated foreign keys pointing to `user_profiles`

## 🎯 Expected Outcome

After running both commands:
- ✓ Schema aligned with your database
- ✓ No more "table doesn't exist" errors
- ✓ All foreign keys working
- ✓ Backward compatible via view

## ⚡ That's It!

Two commands, clean database, ready to go.
