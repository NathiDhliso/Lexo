-- Rollback Migration: Partial Payments System
-- Description: Rollback payment tracking columns and functions
-- Date: January 27, 2025

-- Drop trigger
DROP TRIGGER IF EXISTS payment_status_update ON payments;

-- Drop functions
DROP FUNCTION IF EXISTS update_invoice_payment_status();
DROP FUNCTION IF EXISTS determine_payment_status(UUID);
DROP FUNCTION IF EXISTS calculate_outstanding_balance(UUID);

-- Drop view
DROP VIEW IF EXISTS invoice_payment_history;

-- Remove RLS policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;

-- Drop indexes
DROP INDEX IF EXISTS idx_invoices_payment_status;
DROP INDEX IF EXISTS idx_invoices_outstanding_balance;
DROP INDEX IF EXISTS idx_payments_invoice_id;
DROP INDEX IF EXISTS idx_payments_payment_date;

-- Remove columns from invoices
ALTER TABLE invoices 
DROP COLUMN IF EXISTS amount_paid,
DROP COLUMN IF EXISTS outstanding_balance,
DROP COLUMN IF EXISTS payment_status;

-- Remove columns from payments
ALTER TABLE payments
DROP COLUMN IF EXISTS payment_type,
DROP COLUMN IF EXISTS allocated_amount,
DROP COLUMN IF EXISTS payment_reference;

-- Log rollback
COMMENT ON TABLE invoices IS 'Partial payments system rolled back on ' || NOW()::TEXT;
