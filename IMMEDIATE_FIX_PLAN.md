# Immediate Fix Plan - Database & RLS Issues

## 🚨 Current Problems

1. **404 errors** - Code trying to query `advocates` table (doesn't exist)
2. **406 errors** - RLS policies blocking all queries to `user_profiles`, `subscriptions`, `pdf_templates`
3. **400 errors** - Missing column `next_reminder_date` in `invoices`
4. **409 errors** - Conflict in `proforma_requests` (likely unique constraint)

## ✅ Solutions Created

### 1. Migration Files

#### `20250113000004_align_schema_with_database.sql`
- Adds all advocate columns to `user_profiles`
- Creates `advocates_view` for compatibility
- Updates foreign keys

#### `20250113000005_fix_rls_and_missing_columns.sql` (NEW)
- Fixes RLS policies for all tables
- Adds missing `next_reminder_date` column to invoices
- Creates proper authenticated user policies

### 2. Code Updates

#### `src/services/api/advocate.service.ts` (UPDATED)
- Changed from `advocates` table to `user_profiles`
- Maps `id` to `user_id`
- Auto-creates profile if missing
- Handles schema differences

## 🚀 Execution Steps

### Step 1: Clean Up Old Migrations
```powershell
.\cleanup-migrations.ps1
```

### Step 2: Apply New Migrations
```powershell
supabase db push
```

This will run:
1. `20250113000004_align_schema_with_database.sql` - Schema alignment
2. `20250113000005_fix_rls_and_missing_columns.sql` - RLS fixes

### Step 3: Verify in Browser
Refresh your app and check:
- ✓ No more 404 errors on `/advocates`
- ✓ No more 406 errors on `/user_profiles`
- ✓ No more 406 errors on `/subscriptions`
- ✓ No more 400 errors on `/invoices`
- ✓ User profile loads correctly

## 📋 What Each Migration Does

### Migration 20250113000004 (Schema Alignment)

**Adds to user_profiles:**
- `practice_number` - Advocate's practice number
- `year_admitted` - Year admitted to bar
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

**Creates:**
- `advocates_view` - Backward compatible view

**Updates:**
- All foreign keys from `advocates_deprecated` to `user_profiles`

### Migration 20250113000005 (RLS & Columns)

**Adds to invoices:**
- `next_reminder_date` - When to send next reminder
- `last_reminder_sent_at` - When last reminder was sent

**Fixes RLS policies for:**
- `user_profiles` - Users can CRUD their own profile
- `subscriptions` - Users can CRUD their own subscription
- `pdf_templates` - Users can CRUD their own templates
- `invoices` - Users can CRUD their own invoices
- `proforma_requests` - Users can CRUD their own requests
- `matters` - Users can CRUD their own matters

**Policy Pattern:**
```sql
-- SELECT: User can read their own data
USING (auth.uid() = user_id/advocate_id)

-- INSERT: User can create their own data
WITH CHECK (auth.uid() = user_id/advocate_id)

-- UPDATE: User can update their own data
USING (auth.uid() = user_id/advocate_id)
WITH CHECK (auth.uid() = user_id/advocate_id)

-- DELETE: User can delete their own data
USING (auth.uid() = user_id/advocate_id)
```

## 🔧 Code Changes Made

### advocate.service.ts

**Before:**
```typescript
.from('advocates')
.eq('id', advocateId)
```

**After:**
```typescript
.from('user_profiles')
.eq('user_id', advocateId)
```

**Key Changes:**
1. Table: `advocates` → `user_profiles`
2. ID column: `id` → `user_id`
3. Auto-create profile if missing
4. Map schema differences (e.g., `phone_number` → `phone`)

## ⚠️ Important Notes

### Schema Mapping

| Old (advocates) | New (user_profiles) |
|----------------|---------------------|
| `id` | `user_id` |
| `phone_number` | `phone` |
| `bar` | (to be added) |
| All other fields | Same name |

### Foreign Keys

All tables that reference `advocate_id` now point to `user_profiles.user_id`:
- `matters.advocate_id`
- `invoices.advocate_id`
- `proforma_requests.advocate_id`
- `pdf_templates.advocate_id`
- `time_entries.advocate_id`
- `expenses.advocate_id`
- etc.

## 🎯 Expected Results

After running both migrations:

### Database State:
- ✓ `user_profiles` has all advocate columns
- ✓ `advocates_view` exists for compatibility
- ✓ All foreign keys point to `user_profiles`
- ✓ RLS policies allow authenticated users to access their data
- ✓ `invoices` has reminder columns

### Application State:
- ✓ No 404 errors
- ✓ No 406 errors
- ✓ No 400 errors
- ✓ User can log in
- ✓ User profile loads
- ✓ Matters, invoices, etc. load correctly

## 🐛 Troubleshooting

### If you still get 406 errors:
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

### If you still get 404 on advocates:
- Check that advocate.service.ts was updated
- Clear browser cache
- Restart dev server

### If foreign key errors:
```sql
-- Check foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

## 📞 Next Steps After Fix

1. ✓ Run migrations
2. ✓ Test login
3. ✓ Test profile loading
4. ⏳ Update other services if needed
5. ⏳ Test all CRUD operations
6. ⏳ Monitor for any remaining errors

## 🎉 Success Criteria

You'll know it's working when:
- ✓ No console errors on page load
- ✓ User profile displays correctly
- ✓ Can create matters
- ✓ Can create invoices
- ✓ Can create pro forma requests
- ✓ All data loads without 406/404 errors
