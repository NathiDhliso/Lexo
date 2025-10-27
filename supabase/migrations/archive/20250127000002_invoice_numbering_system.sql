-- ARCHIVED: Original invoice numbering system migration
-- REASON: Consolidated into 20250127000010_enhanced_invoice_numbering.sql
-- DATE ARCHIVED: 2025-01-27

-- Migration: Invoice Numbering & VAT Compliance System
-- Description: Creates tables and functions for sequential invoice numbering and SARS compliance
-- Requirements: 3.1, 3.2, 3.4

-- Create invoice_settings table
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL UNIQUE REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  invoice_number_format VARCHAR(50) DEFAULT 'INV-YYYY-NNN',
  invoice_sequence_current INTEGER DEFAULT 0,
  invoice_sequence_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  credit_note_format VARCHAR(50) DEFAULT 'CN-YYYY-NNN',
  credit_note_sequence_current INTEGER DEFAULT 0,
  credit_note_sequence_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  vat_registered BOOLEAN DEFAULT false,
  vat_number VARCHAR(50),
  vat_rate DECIMAL(5,4) DEFAULT 0.15,
  vat_rate_history JSONB DEFAULT '[]'::jsonb,
  advocate_full_name VARCHAR(255),
  advocate_address TEXT,
  advocate_phone VARCHAR(50),
  advocate_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create invoice_numbering_audit table
CREATE TABLE IF NOT EXISTS invoice_numbering_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  number_type VARCHAR(20) NOT NULL CHECK (number_type IN ('invoice', 'credit_note')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('used', 'voided')),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  void_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_invoice_settings_advocate ON invoice_settings(advocate_id);
CREATE INDEX idx_invoice_numbering_audit_advocate ON invoice_numbering_audit(advocate_id);
CREATE INDEX idx_invoice_numbering_audit_number ON invoice_numbering_audit(invoice_number);
CREATE INDEX idx_invoice_numbering_audit_status ON invoice_numbering_audit(status);
CREATE INDEX idx_invoice_numbering_audit_created ON invoice_numbering_audit(created_at DESC);

-- Enable RLS
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_numbering_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_settings
CREATE POLICY "Users can view their own invoice settings"
  ON invoice_settings FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can insert their own invoice settings"
  ON invoice_settings FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own invoice settings"
  ON invoice_settings FOR UPDATE
  USING (advocate_id = auth.uid());

-- RLS Policies for invoice_numbering_audit
CREATE POLICY "Users can view their own numbering audit"
  ON invoice_numbering_audit FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "System can insert audit records"
  ON invoice_numbering_audit FOR INSERT
  WITH CHECK (true);

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_next_invoice_number(advocate_id_param UUID)
RETURNS VARCHAR AS $
DECLARE
  settings RECORD;
  current_year INTEGER;
  next_sequence INTEGER;
  invoice_number VARCHAR(50);
BEGIN
  -- Get settings with row lock to prevent race conditions
  SELECT * INTO settings 
  FROM invoice_settings 
  WHERE advocate_id = advocate_id_param
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice settings not found for advocate. Please configure invoice settings first.';
  END IF;
  
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Reset sequence if year changed
  IF settings.invoice_sequence_year != current_year THEN
    UPDATE invoice_settings 
    SET invoice_sequence_current = 0,
        invoice_sequence_year = current_year,
        updated_at = NOW()
    WHERE advocate_id = advocate_id_param;
    next_sequence := 1;
  ELSE
    next_sequence := settings.invoice_sequence_current + 1;
  END IF;
  
  -- Generate number based on format
  invoice_number := settings.invoice_number_format;
  invoice_number := REPLACE(invoice_number, 'YYYY', current_year::TEXT);
  invoice_number := REPLACE(invoice_number, 'YY', RIGHT(current_year::TEXT, 2));
  invoice_number := REPLACE(invoice_number, 'NNNN', LPAD(next_sequence::TEXT, 4, '0'));
  invoice_number := REPLACE(invoice_number, 'NNN', LPAD(next_sequence::TEXT, 3, '0'));
  invoice_number := REPLACE(invoice_number, 'NN', LPAD(next_sequence::TEXT, 2, '0'));
  
  -- Update sequence
  UPDATE invoice_settings 
  SET invoice_sequence_current = next_sequence,
      updated_at = NOW()
  WHERE advocate_id = advocate_id_param;
  
  -- Log in audit table (invoice_id will be updated later when invoice is created)
  INSERT INTO invoice_numbering_audit (advocate_id, invoice_number, number_type, status)
  VALUES (advocate_id_param, invoice_number, 'invoice', 'used');
  
  RETURN invoice_number;
END;
$ LANGUAGE plpgsql;

-- Function to generate next credit note number
CREATE OR REPLACE FUNCTION generate_next_credit_note_number(advocate_id_param UUID)
RETURNS VARCHAR AS $
DECLARE
  settings RECORD;
  current_year INTEGER;
  next_sequence INTEGER;
  credit_note_number VARCHAR(50);
BEGIN
  -- Get settings with row lock to prevent race conditions
  SELECT * INTO settings 
  FROM invoice_settings 
  WHERE advocate_id = advocate_id_param
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice settings not found for advocate. Please configure invoice settings first.';
  END IF;
  
  current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Reset sequence if year changed
  IF settings.credit_note_sequence_year != current_year THEN
    UPDATE invoice_settings 
    SET credit_note_sequence_current = 0,
        credit_note_sequence_year = current_year,
        updated_at = NOW()
    WHERE advocate_id = advocate_id_param;
    next_sequence := 1;
  ELSE
    next_sequence := settings.credit_note_sequence_current + 1;
  END IF;
  
  -- Generate number based on format
  credit_note_number := settings.credit_note_format;
  credit_note_number := REPLACE(credit_note_number, 'YYYY', current_year::TEXT);
  credit_note_number := REPLACE(credit_note_number, 'YY', RIGHT(current_year::TEXT, 2));
  credit_note_number := REPLACE(credit_note_number, 'NNNN', LPAD(next_sequence::TEXT, 4, '0'));
  credit_note_number := REPLACE(credit_note_number, 'NNN', LPAD(next_sequence::TEXT, 3, '0'));
  credit_note_number := REPLACE(credit_note_number, 'NN', LPAD(next_sequence::TEXT, 2, '0'));
  
  -- Update sequence
  UPDATE invoice_settings 
  SET credit_note_sequence_current = next_sequence,
      updated_at = NOW()
  WHERE advocate_id = advocate_id_param;
  
  -- Log in audit table
  INSERT INTO invoice_numbering_audit (advocate_id, invoice_number, number_type, status)
  VALUES (advocate_id_param, credit_note_number, 'credit_note', 'used');
  
  RETURN credit_note_number;
END;
$ LANGUAGE plpgsql;

-- Function to update audit record with invoice_id
CREATE OR REPLACE FUNCTION update_invoice_audit_record(
  invoice_number_param VARCHAR,
  invoice_id_param UUID
)
RETURNS VOID AS $
BEGIN
  UPDATE invoice_numbering_audit
  SET invoice_id = invoice_id_param
  WHERE invoice_number = invoice_number_param
    AND status = 'used';
END;
$ LANGUAGE plpgsql;

-- Function to void an invoice number
CREATE OR REPLACE FUNCTION void_invoice_number(
  invoice_number_param VARCHAR,
  advocate_id_param UUID,
  void_reason_param TEXT
)
RETURNS VOID AS $
BEGIN
  -- Update the audit record to voided status
  UPDATE invoice_numbering_audit
  SET status = 'voided',
      void_reason = void_reason_param
  WHERE invoice_number = invoice_number_param
    AND advocate_id = advocate_id_param
    AND status = 'used';
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice number % not found or already voided', invoice_number_param;
  END IF;
END;
$ LANGUAGE plpgsql;

-- Function to get current VAT rate for a given date
CREATE OR REPLACE FUNCTION get_vat_rate_for_date(
  advocate_id_param UUID,
  invoice_date_param DATE
)
RETURNS DECIMAL AS $
DECLARE
  settings RECORD;
  rate_history JSONB;
  rate_entry JSONB;
  applicable_rate DECIMAL;
BEGIN
  SELECT * INTO settings FROM invoice_settings WHERE advocate_id = advocate_id_param;
  
  IF NOT FOUND THEN
    RETURN 0.15; -- Default VAT rate
  END IF;
  
  -- If no history, return current rate
  IF settings.vat_rate_history IS NULL OR jsonb_array_length(settings.vat_rate_history) = 0 THEN
    RETURN settings.vat_rate;
  END IF;
  
  -- Find applicable rate from history
  applicable_rate := settings.vat_rate;
  
  FOR rate_entry IN SELECT * FROM jsonb_array_elements(settings.vat_rate_history)
  LOOP
    IF (rate_entry->>'effective_date')::DATE <= invoice_date_param THEN
      applicable_rate := (rate_entry->>'rate')::DECIMAL;
    END IF;
  END LOOP;
  
  RETURN applicable_rate;
END;
$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoice_settings_timestamp()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_settings_updated_at
  BEFORE UPDATE ON invoice_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_settings_timestamp();

-- Add invoice_number column to invoices table if it doesn't exist
DO $ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(50) UNIQUE;
  END IF;
END $;

-- Create index on invoice_number
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Comments for documentation
COMMENT ON TABLE invoice_settings IS 'Stores invoice numbering configuration and VAT settings for each advocate';
COMMENT ON TABLE invoice_numbering_audit IS 'Audit trail for all invoice and credit note numbers generated';
COMMENT ON FUNCTION generate_next_invoice_number IS 'Generates the next sequential invoice number with year rollover support';
COMMENT ON FUNCTION generate_next_credit_note_number IS 'Generates the next sequential credit note number with year rollover support';
COMMENT ON FUNCTION void_invoice_number IS 'Marks an invoice number as voided with a reason';
COMMENT ON FUNCTION get_vat_rate_for_date IS 'Returns the applicable VAT rate for a given invoice date based on rate history';