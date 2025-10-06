-- Add invoice line items table for structured proforma/invoice data
-- This enables proper itemization on PDFs and better reporting

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Line item details
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Service categorization
  service_category VARCHAR(50),
  rate_card_id UUID REFERENCES rate_cards(id) ON DELETE SET NULL,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_unit_price CHECK (unit_price >= 0),
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_rate_card_id ON invoice_line_items(rate_card_id);
CREATE INDEX idx_invoice_line_items_category ON invoice_line_items(service_category);

-- Enable RLS
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Line items inherit access from parent invoice
CREATE POLICY "Advocates can view their invoice line items" ON invoice_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can insert line items for their invoices" ON invoice_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can update their invoice line items" ON invoice_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.advocate_id = auth.uid()
    )
  );

CREATE POLICY "Advocates can delete their invoice line items" ON invoice_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND invoices.advocate_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_invoice_line_items_updated_at 
  BEFORE UPDATE ON invoice_line_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE invoice_line_items IS 'Individual line items for invoices and proformas, enabling structured itemization';
COMMENT ON COLUMN invoice_line_items.description IS 'Service description (e.g., "Initial Consultation")';
COMMENT ON COLUMN invoice_line_items.quantity IS 'Quantity or hours (e.g., 2.5 hours)';
COMMENT ON COLUMN invoice_line_items.unit_price IS 'Price per unit/hour';
COMMENT ON COLUMN invoice_line_items.amount IS 'Total amount for this line item (quantity × unit_price)';
COMMENT ON COLUMN invoice_line_items.service_category IS 'Category for grouping (consultation, research, drafting, etc.)';
COMMENT ON COLUMN invoice_line_items.rate_card_id IS 'Reference to rate card if applicable';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Invoice line items table created successfully!';
  RAISE NOTICE '✓ RLS policies configured';
  RAISE NOTICE '✓ Indexes created for performance';
END $$;
