-- Migration: Partial Payments System
-- Description: Add payment tracking columns to invoices and create payment history view
-- Requirements: 1.1, 1.9

-- Add payment tracking columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
ADD COLUMN IF NOT EXISTS outstanding_balance DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'overpaid'));

-- Add comment for documentation
COMMENT ON COLUMN invoices.amount_paid IS 'Total amount paid towards this invoice';
COMMENT ON COLUMN invoices.outstanding_balance IS 'Remaining balance to be paid (calculated)';
COMMENT ON COLUMN invoices.payment_status IS 'Payment status: unpaid, partially_paid, paid, overpaid';

-- Update existing invoices to set outstanding_balance
UPDATE invoices 
SET outstanding_balance = COALESCE(total_amount, 0) - COALESCE(amount_paid, 0)
WHERE outstanding_balance IS NULL;

-- Ensure payments table has all required columns (extend if needed)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'full',
ADD COLUMN IF NOT EXISTS allocated_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255);

COMMENT ON COLUMN payments.payment_type IS 'Type of payment: full, partial, overpayment';
COMMENT ON COLUMN payments.allocated_amount IS 'Amount allocated to this invoice (for split payments)';
COMMENT ON COLUMN payments.payment_reference IS 'External payment reference number';

-- Create function to calculate outstanding balance
CREATE OR REPLACE FUNCTION calculate_outstanding_balance(invoice_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
  paid DECIMAL;
BEGIN
  SELECT total_amount, amount_paid 
  INTO total, paid
  FROM invoices 
  WHERE id = invoice_id_param;
  
  RETURN COALESCE(total, 0) - COALESCE(paid, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to determine payment status
CREATE OR REPLACE FUNCTION determine_payment_status(invoice_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  total DECIMAL;
  paid DECIMAL;
  balance DECIMAL;
BEGIN
  SELECT total_amount, amount_paid 
  INTO total, paid
  FROM invoices 
  WHERE id = invoice_id_param;
  
  balance := COALESCE(total, 0) - COALESCE(paid, 0);
  
  IF balance <= 0 AND paid > 0 THEN
    IF balance < 0 THEN
      RETURN 'overpaid';
    ELSE
      RETURN 'paid';
    END IF;
  ELSIF paid > 0 AND balance > 0 THEN
    RETURN 'partially_paid';
  ELSE
    RETURN 'unpaid';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update balances on payment insert/update
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total DECIMAL;
  total_paid DECIMAL;
  new_balance DECIMAL;
  new_status VARCHAR;
BEGIN
  -- Calculate total paid for this invoice
  SELECT COALESCE(SUM(amount), 0) 
  INTO total_paid
  FROM payments 
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get invoice total
  SELECT total_amount 
  INTO invoice_total
  FROM invoices 
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Calculate new balance
  new_balance := COALESCE(invoice_total, 0) - COALESCE(total_paid, 0);
  
  -- Determine new status
  IF new_balance <= 0 AND total_paid > 0 THEN
    IF new_balance < 0 THEN
      new_status := 'overpaid';
    ELSE
      new_status := 'paid';
    END IF;
  ELSIF total_paid > 0 AND new_balance > 0 THEN
    new_status := 'partially_paid';
  ELSE
    new_status := 'unpaid';
  END IF;
  
  -- Update invoice
  UPDATE invoices 
  SET 
    amount_paid = total_paid,
    outstanding_balance = new_balance,
    payment_status = new_status,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS payment_status_update ON payments;
CREATE TRIGGER payment_status_update
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

-- Create invoice payment history view
CREATE OR REPLACE VIEW invoice_payment_history AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.total_amount,
  i.amount_paid,
  i.outstanding_balance,
  i.payment_status,
  i.invoice_date,
  i.due_date,
  i.matter_id,
  p.id as payment_id,
  p.amount as payment_amount,
  p.payment_date,
  p.payment_method,
  p.reference_number,
  p.notes,
  p.created_at as payment_created_at
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
ORDER BY i.created_at DESC, p.payment_date DESC;

COMMENT ON VIEW invoice_payment_history IS 'Complete payment history for all invoices with payment details';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_outstanding_balance ON invoices(outstanding_balance) WHERE outstanding_balance > 0;
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Grant permissions
GRANT SELECT ON invoice_payment_history TO authenticated;

-- Add RLS policies for payments table if not exists
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (
    advocate_id = auth.uid()
    OR
    advocate_id IN (
      SELECT user_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own payments
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT
  WITH CHECK (
    advocate_id = auth.uid()
    OR
    advocate_id IN (
      SELECT user_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own payments
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE
  USING (
    advocate_id = auth.uid()
    OR
    advocate_id IN (
      SELECT user_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own payments
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;
CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE
  USING (
    advocate_id = auth.uid()
    OR
    advocate_id IN (
      SELECT user_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );
