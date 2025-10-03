-- Add missing pro forma status values to invoice_status enum

-- Add awaiting_acceptance status (when pro forma is sent to client)
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'awaiting_acceptance';

-- Add accepted status (when client accepts the pro forma)
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'accepted';

-- Add declined status (when client declines the pro forma)
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'declined';

-- Add expired status (when pro forma validity period expires)
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'expired';

-- Add converted_to_invoice status (when pro forma is converted to final invoice)
ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'converted_to_invoice';

-- Add pro_forma_declined_at timestamp column if it doesn't exist
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS pro_forma_declined_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN invoices.pro_forma_declined_at IS 'Timestamp when the pro forma was declined by the client';
