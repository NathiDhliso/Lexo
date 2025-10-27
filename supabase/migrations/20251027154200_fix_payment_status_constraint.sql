-- Fix payment status constraint issue
-- The previous migration failed because existing invoices have different status values

-- Drop existing constraint if it exists
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_payment_status_check;

-- First, add the payment_status column without a constraint
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Add amount_paid if it doesn't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0;

-- Update existing invoices to set payment_status based on their current state
UPDATE invoices 
SET 
  amount_paid = COALESCE((
    SELECT SUM(amount) 
    FROM payments 
    WHERE payments.invoice_id = invoices.id
  ), 0)
WHERE amount_paid IS NULL;

-- Set payment_status based on payment amounts for ALL rows (not just NULL ones)
UPDATE invoices 
SET payment_status = CASE 
  WHEN COALESCE(amount_paid, 0) = 0 THEN 'unpaid'
  WHEN COALESCE(amount_paid, 0) >= total_amount THEN 'paid'
  ELSE 'partially_paid'
END;

-- Check for any invalid payment_status values before adding constraint
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Count rows with invalid payment_status
  SELECT COUNT(*) INTO invalid_count
  FROM invoices 
  WHERE payment_status NOT IN ('unpaid', 'partially_paid', 'paid', 'overpaid') 
     OR payment_status IS NULL;
  
  -- If there are invalid values, fix them
  IF invalid_count > 0 THEN
    RAISE NOTICE 'Found % rows with invalid payment_status, fixing...', invalid_count;
    
    -- Fix any remaining invalid or NULL values
    UPDATE invoices 
    SET payment_status = 'unpaid'
    WHERE payment_status NOT IN ('unpaid', 'partially_paid', 'paid', 'overpaid') 
       OR payment_status IS NULL;
  END IF;
END $$;

-- Now add the constraint after data is properly set
ALTER TABLE invoices ADD CONSTRAINT invoices_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'overpaid'));

-- Update the balance_due calculation to use amount_paid
-- Drop and recreate the generated column if it exists
ALTER TABLE invoices DROP COLUMN IF EXISTS balance_due;
ALTER TABLE invoices ADD COLUMN balance_due DECIMAL(12,2) GENERATED ALWAYS AS ((fees_amount + disbursements_amount) * (1 + vat_rate) - COALESCE(amount_paid, 0)) STORED;

-- Create the payment status update function
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the invoice's amount_paid and payment_status
  UPDATE invoices 
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM payments 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    payment_status = CASE 
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) = 0 THEN 'unpaid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) >= total_amount THEN 'paid'
      ELSE 'partially_paid'
    END
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update payment status
DROP TRIGGER IF EXISTS payment_status_update ON payments;
CREATE TRIGGER payment_status_update
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_payment_status();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Add comments
COMMENT ON COLUMN invoices.amount_paid IS 'Total amount paid towards this invoice';
COMMENT ON COLUMN invoices.payment_status IS 'Payment status: unpaid, partially_paid, paid, overpaid';