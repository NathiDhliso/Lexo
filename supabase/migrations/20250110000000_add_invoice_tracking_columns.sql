-- Add missing invoice tracking columns
-- These columns are used by InvoiceService for payment tracking, reminders, and soft deletes

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS next_reminder_date DATE,
ADD COLUMN IF NOT EXISTS last_reminder_date DATE,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN invoices.next_reminder_date IS 'Scheduled date for next payment reminder';
COMMENT ON COLUMN invoices.last_reminder_date IS 'Date when last reminder was sent';
COMMENT ON COLUMN invoices.payment_method IS 'Method used for payment (e.g., EFT, cash, cheque)';
COMMENT ON COLUMN invoices.payment_reference IS 'Payment reference or transaction ID';
COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp';

CREATE INDEX IF NOT EXISTS idx_invoices_next_reminder ON invoices(next_reminder_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at);
