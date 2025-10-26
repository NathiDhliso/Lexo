-- Rollback for 20250127000006_fix_expenses_and_disbursements.sql
-- Use this if you need to undo the changes

-- Drop disbursement summary view
DROP VIEW IF EXISTS disbursement_summary;

-- Drop helper functions
DROP FUNCTION IF EXISTS mark_disbursements_as_billed(UUID[], UUID);
DROP FUNCTION IF EXISTS get_unbilled_disbursements(UUID);

-- Drop disbursements table
DROP TABLE IF EXISTS disbursements CASCADE;

-- Drop triggers and functions for disbursements
DROP TRIGGER IF EXISTS disbursements_updated_at ON disbursements;
DROP FUNCTION IF EXISTS update_disbursements_updated_at();

-- Remove added columns from expenses table
ALTER TABLE expenses DROP COLUMN IF EXISTS disbursement_type;
ALTER TABLE expenses DROP COLUMN IF EXISTS payment_date;
ALTER TABLE expenses DROP COLUMN IF EXISTS date;
ALTER TABLE expenses DROP COLUMN IF EXISTS receipt_number;
ALTER TABLE expenses DROP COLUMN IF EXISTS vendor_name;
ALTER TABLE expenses DROP COLUMN IF EXISTS is_billable;

-- Drop expenses sync trigger
DROP TRIGGER IF EXISTS expenses_sync_date_columns ON expenses;
DROP FUNCTION IF EXISTS sync_expenses_date_columns();

-- Note: RLS policies for logged_services are not rolled back
-- as they are fixes, not additions
