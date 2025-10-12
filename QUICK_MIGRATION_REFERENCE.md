# 🚀 Quick Migration Reference Card

## Execution Order (Copy-Paste Ready)

```bash
# ============================================
# LEXO DATABASE MIGRATIONS - EXECUTION SEQUENCE
# Version: 2.0.0 (Corrected)
# Date: 2025-01-13
# ============================================

# STEP 1: Pro Forma Status - Part 1 (Enum & Column)
# File: 20250113000001_add_invoice_pro_forma_status_PART1.sql
# Action: Run and COMMIT before proceeding
psql -d your_database -f supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART1.sql

# ⏸️ WAIT FOR COMMIT ⏸️

# STEP 2: Pro Forma Status - Part 2 (Data Update)
# File: 20250113000001_add_invoice_pro_forma_status_PART2.sql
# Action: Run and COMMIT before proceeding
psql -d your_database -f supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART2.sql

# ⏸️ WAIT FOR COMMIT ⏸️

# STEP 3: User Consolidation (Complete Migration)
# File: 20250113000002_consolidate_user_advocate_models_CORRECTED.sql
# Action: Run and COMMIT before proceeding
psql -d your_database -f supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql

# ⏸️ WAIT FOR COMMIT ⏸️

# STEP 4: RLS Policy Updates
# File: 20250113000003_update_rls_policies_for_user_profiles.sql
# Action: Run and COMMIT
psql -d your_database -f supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql

# ============================================
# VERIFICATION
# ============================================

# Quick health check
psql -d your_database -c "
SELECT 'Pro Forma Invoices' as check_name, COUNT(*) as count 
FROM invoices WHERE is_pro_forma = true
UNION ALL
SELECT 'User Profiles', COUNT(*) 
FROM user_profiles WHERE practice_number IS NOT NULL
UNION ALL
SELECT 'Foreign Keys', COUNT(*) 
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%advocate%';
"

# ============================================
# DONE! 🎉
# ============================================
```

---

## ⚠️ Critical Reminders

1. **BACKUP FIRST** - Always create a backup before running migrations
2. **STAGING FIRST** - Test in staging before production
3. **COMMIT BETWEEN STEPS** - Do not skip the commit between migrations
4. **READ THE GUIDE** - See MIGRATION_EXECUTION_GUIDE.md for details

---

## 📊 Expected Outputs

### Step 1:
```
✓ Added pro_forma to invoice_status enum
✓ Added is_pro_forma column
✓ PART 1 COMPLETE
```

### Step 2:
```
✓ Updated X existing pro forma invoices
✓ PART 2 COMPLETE: Data updated
```

### Step 3:
```
PART 1 COMPLETE: All columns added
✓ PART 2 COMPLETE: Data validation passed
✓ PART 3 COMPLETE: Migrated X rows
✓ PART 4 COMPLETE: All foreign keys updated
🎉 MIGRATION COMPLETE!
```

### Step 4:
```
✓ Updated matters policies
✓ Updated invoices policies
... (15+ tables)
🎉 RLS POLICIES UPDATE COMPLETE!
```

---

## 🆘 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "enum value already exists" | Skip Part 1, run Part 2 |
| "column already exists" | Safe to continue |
| "no matching user_profiles" | Create profiles first |
| "foreign key violation" | Ensure Step 3 completed |

---

## 📚 Full Documentation

- **Complete Guide:** [MIGRATION_EXECUTION_GUIDE.md](MIGRATION_EXECUTION_GUIDE.md)
- **Status:** [MIGRATIONS_READY.md](MIGRATIONS_READY.md)
- **Technical Details:** [ITERATION_1_COMPLETE.md](ITERATION_1_COMPLETE.md) & [ITERATION_2_COMPLETE.md](ITERATION_2_COMPLETE.md)

---

**Version:** 2.0.0 (Corrected)
**Status:** ✅ Ready
**Last Updated:** 2025-01-13
