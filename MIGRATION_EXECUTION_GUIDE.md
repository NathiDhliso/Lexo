# Migration Execution Guide

## 🚀 Complete Migration Sequence

This guide provides the exact order and commands to execute all database migrations for the Lexo refactoring project.

---

## ⚠️ CRITICAL: Read Before Starting

1. **Backup First**: Create database backups before running any migrations
2. **Staging Environment**: Test in staging before production
3. **Transaction Order**: Some migrations MUST be run in separate transactions
4. **Commit Between Steps**: Wait for each transaction to commit before proceeding

---

## 📋 Migration Files Overview

| Order | File | Purpose | Transaction |
|-------|------|---------|-------------|
| 1 | `20250113000001_add_invoice_pro_forma_status_PART1.sql` | Add enum value & column | Separate |
| 2 | `20250113000001_add_invoice_pro_forma_status_PART2.sql` | Update existing data | Separate |
| 3 | `20250113000002_consolidate_user_advocate_models_CORRECTED.sql` | User consolidation | Single |
| 4 | `20250113000003_update_rls_policies_for_user_profiles.sql` | RLS policy updates | Single |

---

## 🔧 Step-by-Step Execution

### Step 1: Pro Forma Status - Part 1 (Enum & Column)

**File:** `20250113000001_add_invoice_pro_forma_status_PART1.sql`

**What it does:**
- Adds `pro_forma` value to `invoice_status` enum
- Adds `is_pro_forma` boolean column to invoices table
- Creates index for efficient filtering

**Execute:**
```sql
-- In Supabase SQL Editor or psql:
\i supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART1.sql

-- OR copy-paste the file contents and run
```

**Expected Output:**
```
✓ Added pro_forma to invoice_status enum
✓ Added is_pro_forma column
✓ PART 1 COMPLETE
COMMIT this transaction, then run Part 2
```

**⚠️ CRITICAL:** Wait for this transaction to COMMIT before proceeding!

---

### Step 2: Pro Forma Status - Part 2 (Data Update)

**File:** `20250113000001_add_invoice_pro_forma_status_PART2.sql`

**What it does:**
- Updates existing pro forma invoices (identified by internal_notes)
- Sets `is_pro_forma = true` and `status = 'pro_forma'`
- Verifies the update

**Execute:**
```sql
-- In Supabase SQL Editor or psql:
\i supabase/migrations/20250113000001_add_invoice_pro_forma_status_PART2.sql

-- OR copy-paste the file contents and run
```

**Expected Output:**
```
✓ Updated X existing pro forma invoices
Pro forma invoices: X
Draft invoices (non-pro forma): Y
✓ PART 2 COMPLETE: Data updated
```

**Verification:**
```sql
-- Check the results
SELECT 
  status,
  is_pro_forma,
  COUNT(*) as count
FROM invoices
GROUP BY status, is_pro_forma
ORDER BY status;
```

---

### Step 3: User Consolidation (Complete Migration)

**File:** `20250113000002_consolidate_user_advocate_models_CORRECTED.sql`

**What it does:**
- Adds ALL advocate columns to user_profiles
- Validates data relationships
- Migrates data from advocates to user_profiles
- Updates ALL 15+ foreign keys
- Updates handle_new_user trigger
- Renames advocates to advocates_deprecated
- Creates indexes and constraints

**Pre-Flight Checks:**
```sql
-- Verify all advocates have user_profiles
SELECT 
  a.id as advocate_id,
  a.email as advocate_email,
  up.user_id as profile_user_id,
  CASE 
    WHEN up.user_id = a.id THEN '✅ Match'
    WHEN up.user_id IS NULL THEN '❌ No profile'
    ELSE '⚠️ Mismatch'
  END as status
FROM advocates a
LEFT JOIN user_profiles up ON up.user_id = a.id
ORDER BY status DESC;

-- Should show ZERO rows with '❌ No profile' status
```

**Execute:**
```sql
-- In Supabase SQL Editor or psql:
\i supabase/migrations/20250113000002_consolidate_user_advocate_models_CORRECTED.sql

-- OR copy-paste the file contents and run
```

**Expected Output:**
```
PART 1 COMPLETE: All columns added
✓ PART 2 COMPLETE: Data validation passed
✓ PART 3 COMPLETE: Migrated X rows
✓ Updated matters
✓ Updated invoices
... (15+ tables)
✓ PART 4 COMPLETE: All foreign keys updated
✓ PART 5 COMPLETE: Updated handle_new_user trigger
✓ PART 6 COMPLETE: Renamed advocates to advocates_deprecated
✓ PART 7 COMPLETE: Added performance indexes
🎉 MIGRATION COMPLETE!
User profiles with practice_number: X
Foreign key constraints updated: Y
```

**Verification:**
```sql
-- Verify data migration
SELECT 
  COUNT(*) as total_profiles,
  COUNT(practice_number) as profiles_with_practice_number,
  COUNT(CASE WHEN practice_number IS NOT NULL AND bar IS NOT NULL THEN 1 END) as complete_profiles
FROM user_profiles;

-- Verify foreign keys
SELECT 
  tc.table_name,
  tc.constraint_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%advocate%'
ORDER BY tc.table_name;

-- Should show all foreign keys pointing to user_profiles(user_id)
```

---

### Step 4: RLS Policy Updates

**File:** `20250113000003_update_rls_policies_for_user_profiles.sql`

**What it does:**
- Updates ALL RLS policies to reference user_profiles.user_id
- Covers 15+ tables
- Maintains proper access control

**Execute:**
```sql
-- In Supabase SQL Editor or psql:
\i supabase/migrations/20250113000003_update_rls_policies_for_user_profiles.sql

-- OR copy-paste the file contents and run
```

**Expected Output:**
```
✓ Updated matters policies
✓ Updated invoices policies
✓ Updated time_entries policies
... (15+ tables)
🎉 RLS POLICIES UPDATE COMPLETE!
All policies now reference user_profiles.user_id
```

**Verification:**
```sql
-- Check updated policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('matters', 'invoices', 'time_entries', 'expenses')
ORDER BY tablename, policyname;
```

---

## ✅ Post-Migration Verification

### 1. Test Authentication Flow
```sql
-- Verify handle_new_user trigger
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- Should show function inserting into user_profiles
```

### 2. Test Data Access
```sql
-- Test that queries work
SELECT 
  m.id,
  m.title,
  up.first_name,
  up.last_name,
  up.practice_number
FROM matters m
JOIN user_profiles up ON m.advocate_id = up.user_id
LIMIT 5;
```

### 3. Test RLS Policies
```sql
-- As authenticated user, verify access
SET ROLE authenticated;
SET request.jwt.claim.sub = '<your-user-id>';

SELECT * FROM matters LIMIT 1;
SELECT * FROM invoices LIMIT 1;

-- Should return only your data
```

---

## 🔄 Rollback Procedures

### If Step 1 or 2 Fails (Pro Forma)
```sql
-- Remove the enum value (if added)
-- Note: Can't remove enum values in PostgreSQL < 12
-- Instead, just don't use it

-- Remove the column
ALTER TABLE invoices DROP COLUMN IF EXISTS is_pro_forma;

-- Remove the index
DROP INDEX IF EXISTS idx_invoices_is_pro_forma;
```

### If Step 3 Fails (User Consolidation)
```sql
-- Restore advocates table
ALTER TABLE advocates_deprecated RENAME TO advocates;

-- Restore foreign keys (example for matters)
ALTER TABLE matters 
  DROP CONSTRAINT IF EXISTS matters_advocate_id_fkey,
  ADD CONSTRAINT matters_advocate_id_fkey 
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE;

-- Repeat for all 15+ tables
```

### If Step 4 Fails (RLS Policies)
```sql
-- Re-run the old policies
-- (Keep a backup of old policy definitions)
```

---

## 📊 Success Criteria

After all migrations:

- [ ] All 4 migration files executed successfully
- [ ] No errors in Supabase logs
- [ ] `advocates_deprecated` table exists with original data
- [ ] `user_profiles` has all advocate columns populated
- [ ] All foreign keys point to `user_profiles(user_id)`
- [ ] `handle_new_user` inserts into `user_profiles`
- [ ] All RLS policies reference `user_profiles.user_id`
- [ ] Application login works
- [ ] User profile updates work
- [ ] Matter creation works
- [ ] Invoice generation works
- [ ] No console errors in browser

---

## 🆘 Troubleshooting

### Issue: "enum value already exists"
**Solution:** The enum value was already added. Skip Part 1 and proceed to Part 2.

### Issue: "column already exists"
**Solution:** The column was already added. Skip to the next migration.

### Issue: "advocates without matching user_profiles"
**Solution:** 
```sql
-- Create missing user_profiles
INSERT INTO user_profiles (user_id, email, created_at, updated_at)
SELECT id, email, created_at, updated_at
FROM advocates a
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.user_id = a.id
);
```

### Issue: "foreign key constraint violation"
**Solution:** Ensure Step 3 completed successfully before running Step 4.

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs for detailed error messages
2. Verify each step's expected output matches actual output
3. Run verification queries after each step
4. Keep backups ready for rollback if needed

---

**Last Updated:** 2025-01-13
**Migration Version:** 2.0.0 (Corrected)
**Status:** Ready for Execution
