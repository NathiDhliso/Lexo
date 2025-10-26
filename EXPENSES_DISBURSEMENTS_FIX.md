# Expenses and Disbursements Schema Fix

## Issues Identified

Based on the console errors, the following database schema issues were found:

### 1. Missing `disbursements` Table (404 Error)
```
GET .../disbursements?select=*&matter_id=eq... 404 (Not Found)
Error: Could not find the table 'public.disbursements' in the schema cache
```

**Problem**: The code expects a `disbursements` table but it doesn't exist in the database.

**Impact**: 
- DisbursementsTable component fails to load
- WorkbenchExpensesTab cannot display unbilled disbursements
- Cannot track out-of-pocket expenses properly

### 2. Missing Columns in `expenses` Table (400 Error)
```
GET .../expenses?...&order=payment_date.desc 400 (Bad Request)
Error: column expenses.payment_date does not exist
```

**Problem**: The `expenses` table is missing several columns that the frontend code expects:
- `payment_date` (used by ExpenseList component)
- `date` (used by ExpensesService)
- `disbursement_type`
- `receipt_number`
- `vendor_name`
- `is_billable`

**Impact**:
- ExpenseList component cannot query expenses
- Cannot sort or filter expenses by date
- Missing metadata for expense tracking

### 3. Permission Denied for `logged_services` (403 Error)
```
GET .../logged_services?select=*&matter_id=eq... 403 (Forbidden)
Error: permission denied for table logged_services
```

**Problem**: RLS policies for `logged_services` table are not properly configured.

**Impact**:
- ServiceList component cannot load services
- Cannot view or manage logged services in the workbench

### 4. Incorrect API Endpoint Usage (400 Error)
```
POST .../expenses?columns="matter_id","advocate_id","invoice_id"... 400 (Bad Request)
```

**Problem**: Code is trying to POST to expenses with columns that don't match the schema.

## Solution Implemented

### Migration: `20250127000006_fix_expenses_and_disbursements.sql`

This comprehensive migration addresses all the issues:

#### Part 1: Create `disbursements` Table
- Full table schema with proper columns:
  - `id`, `matter_id`, `advocate_id`
  - `description`, `amount`, `date_incurred`
  - `vat_applicable`, `vat_amount` (calculated), `total_amount` (calculated)
  - `receipt_link`, `invoice_id`, `is_billed`
  - `deleted_at` (soft delete), `created_at`, `updated_at`
- Proper indexes for performance
- RLS policies for security
- Triggers for automatic calculations

#### Part 2: Fix `expenses` Table
- Added missing columns:
  - `payment_date` - for ExpenseList sorting
  - `date` - for ExpensesService compatibility
  - `disbursement_type` - categorization
  - `receipt_number` - tracking
  - `vendor_name` - vendor information
  - `is_billable` - billing flag
- Created trigger to keep date columns synchronized
- Maintains backwards compatibility

#### Part 3: Fix `logged_services` RLS Policies
- Recreated all RLS policies with correct permissions
- Ensures advocates can only access their own services
- Prevents modification of invoiced services

#### Part 4: Helper Functions
- `get_unbilled_disbursements(matter_id)` - Get unbilled disbursements for a matter
- `mark_disbursements_as_billed(ids[], invoice_id)` - Mark multiple disbursements as billed
- `disbursement_summary` view - Aggregate disbursement data by matter

## How to Apply

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\apply-expenses-fix.ps1
```

### Option 2: Using Supabase CLI
```bash
supabase db push
```

### Option 3: Manual Application
Copy the contents of `supabase/migrations/20250127000006_fix_expenses_and_disbursements.sql` and run it in your Supabase SQL editor.

## Verification Steps

After applying the migration, verify the fixes:

### 1. Check Disbursements Table
```sql
SELECT * FROM disbursements LIMIT 1;
```

### 2. Check Expenses Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'expenses' 
  AND column_name IN ('payment_date', 'date', 'disbursement_type', 'receipt_number', 'vendor_name', 'is_billable');
```

### 3. Test RLS Policies
```sql
-- Should return policies
SELECT * FROM pg_policies WHERE tablename = 'logged_services';
SELECT * FROM pg_policies WHERE tablename = 'disbursements';
```

### 4. Test in Application
1. Navigate to a matter's workbench
2. Click on the "Expenses" tab
3. Verify no console errors
4. Try logging a new disbursement
5. Check that services load properly

## Expected Results

After applying this fix:

✅ **Disbursements Tab Works**
- Can view all disbursements for a matter
- Can add new disbursements
- Can edit/delete unbilled disbursements
- Unbilled total displays correctly

✅ **Expenses List Works**
- Can query expenses by payment_date
- All expense metadata displays
- Can sort and filter expenses

✅ **Services List Works**
- Can view logged services
- No permission errors
- Can add/edit services

✅ **No Console Errors**
- No 404 errors for disbursements
- No 400 errors for expenses
- No 403 errors for logged_services

## Database Schema Alignment

This migration aligns the database schema with the application code expectations:

| Component | Expected Table | Expected Columns | Status |
|-----------|---------------|------------------|--------|
| DisbursementsTable | disbursements | id, matter_id, description, amount, date_incurred | ✅ Fixed |
| ExpenseList | expenses | payment_date, disbursement_type, vendor_name | ✅ Fixed |
| ExpensesService | expenses | date, category, receipt_url | ✅ Fixed |
| ServiceList | logged_services | (with proper RLS) | ✅ Fixed |

## Notes

- The migration is idempotent - safe to run multiple times
- Existing data is preserved
- Date columns are kept in sync automatically via triggers
- Soft delete is used for disbursements (deleted_at column)
- VAT calculations are automatic (15% rate)
- All changes are backwards compatible

## Related Files

- Migration: `supabase/migrations/20250127000006_fix_expenses_and_disbursements.sql`
- Apply Script: `apply-expenses-fix.ps1`
- Service: `src/services/api/disbursement.service.ts`
- Service: `src/services/api/expenses.service.ts`
- Component: `src/components/disbursements/DisbursementsTable.tsx`
- Component: `src/components/expenses/ExpenseList.tsx`
- Component: `src/components/services/ServiceList.tsx`
