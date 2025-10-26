# Quick Fix: Expenses & Disbursements Errors

## The Problem
Your console shows these errors:
- ❌ `disbursements` table not found (404)
- ❌ `expenses.payment_date` column doesn't exist (400)
- ❌ Permission denied for `logged_services` (403)

## The Solution
Run this one command:

```powershell
.\apply-expenses-fix.ps1
```

Or if you prefer:
```bash
supabase db push
```

## What Gets Fixed

### 1. Disbursements Table ✅
- Creates the missing `disbursements` table
- Adds all required columns and relationships
- Sets up RLS policies for security
- Adds helper functions for billing

### 2. Expenses Table ✅
- Adds `payment_date` column (for sorting)
- Adds `date` column (for compatibility)
- Adds `disbursement_type`, `receipt_number`, `vendor_name`, `is_billable`
- Syncs all date columns automatically

### 3. Logged Services ✅
- Fixes RLS policies
- Allows advocates to view/edit their own services
- Prevents editing of invoiced services

## After Applying

Test in your app:
1. Go to any matter's workbench
2. Click "Expenses" tab
3. Should load without errors
4. Try adding a disbursement
5. Check that services load properly

All console errors should be gone! ✨

## Need Help?

See `EXPENSES_DISBURSEMENTS_FIX.md` for detailed information.
