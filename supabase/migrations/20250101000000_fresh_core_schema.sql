-- ============================================================================
-- LEXOHUB CORE SCHEMA - Fresh Start
-- Pro Forma → Matter → Invoice Workflow
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE bar_association AS ENUM ('johannesburg', 'cape_town');
CREATE TYPE user_role AS ENUM ('junior_advocate', 'senior_advocate', 'chambers_admin');
CREATE TYPE matter_status AS ENUM ('active', 'inactive', 'closed', 'on_hold');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE proforma_request_status AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired', 'converted');
CREATE TYPE fee_type AS ENUM ('hourly', 'fixed', 'contingency', 'hybrid');
CREATE TYPE client_type AS ENUM ('individual', 'corporate', 'government', 'ngo');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Advocates (Users)
CREATE TABLE advocates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  initials TEXT NOT NULL,
  practice_number TEXT UNIQUE NOT NULL,
  bar bar_association NOT NULL,
  year_admitted INTEGER NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  phone_number TEXT,
  chambers_address TEXT,
  postal_address TEXT,
  user_role user_role DEFAULT 'junior_advocate',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pro Forma Requests (Step 1: Quotes)
CREATE TABLE proforma_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  
  instructing_attorney_name TEXT NOT NULL,
  instructing_attorney_email TEXT,
  instructing_attorney_phone TEXT,
  instructing_firm TEXT,
  
  work_title TEXT NOT NULL,
  work_description TEXT,
  
  estimated_amount DECIMAL(12,2),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  
  status proforma_request_status DEFAULT 'draft',
  
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  converted_matter_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_email CHECK (
    instructing_attorney_email IS NULL OR 
    instructing_attorney_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Matters (Step 2: Cases)
CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE,
  
  title TEXT NOT NULL,
  description TEXT,
  matter_type TEXT,
  court_case_number TEXT,
  
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  client_type client_type DEFAULT 'individual',
  
  instructing_attorney TEXT NOT NULL,
  instructing_attorney_email TEXT,
  instructing_attorney_phone TEXT,
  instructing_firm TEXT,
  instructing_firm_ref TEXT,
  
  fee_type fee_type DEFAULT 'hourly',
  estimated_fee DECIMAL(12,2),
  fee_cap DECIMAL(12,2),
  
  risk_level risk_level DEFAULT 'medium',
  settlement_probability INTEGER CHECK (settlement_probability BETWEEN 0 AND 100),
  expected_completion_date DATE,
  
  status matter_status DEFAULT 'active',
  wip_value DECIMAL(12,2) DEFAULT 0,
  
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  source_proforma_id UUID REFERENCES proforma_requests(id) ON DELETE SET NULL,
  is_prepopulated BOOLEAN DEFAULT false,
  
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Time Entries (WIP Tracking)
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  hourly_rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
  
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_billed BOOLEAN DEFAULT false,
  invoice_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses (WIP Tracking)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  
  is_billed BOOLEAN DEFAULT false,
  invoice_id UUID,
  
  receipt_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (Step 3: Billing)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE,
  
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  fees_amount DECIMAL(12,2) DEFAULT 0,
  disbursements_amount DECIMAL(12,2) DEFAULT 0,
  vat_rate DECIMAL(5,4) DEFAULT 0.15,
  
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (fees_amount + disbursements_amount) STORED,
  vat_amount DECIMAL(12,2) GENERATED ALWAYS AS ((fees_amount + disbursements_amount) * vat_rate) STORED,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS ((fees_amount + disbursements_amount) * (1 + vat_rate)) STORED,
  
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) GENERATED ALWAYS AS ((fees_amount + disbursements_amount) * (1 + vat_rate) - amount_paid) STORED,
  
  status invoice_status DEFAULT 'draft',
  is_pro_forma BOOLEAN DEFAULT false,
  
  fee_narrative TEXT,
  internal_notes TEXT,
  
  source_proforma_id UUID REFERENCES proforma_requests(id) ON DELETE SET NULL,
  
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  
  preferences JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Pro Forma Requests
CREATE INDEX idx_proforma_requests_advocate ON proforma_requests(advocate_id);
CREATE INDEX idx_proforma_requests_status ON proforma_requests(status);
CREATE INDEX idx_proforma_requests_quote_number ON proforma_requests(quote_number);
CREATE INDEX idx_proforma_requests_converted_matter ON proforma_requests(converted_matter_id);
CREATE INDEX idx_proforma_requests_created_at ON proforma_requests(created_at DESC);

-- Matters
CREATE INDEX idx_matters_advocate ON matters(advocate_id);
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_reference ON matters(reference_number);
CREATE INDEX idx_matters_source_proforma ON matters(source_proforma_id);
CREATE INDEX idx_matters_created_at ON matters(created_at DESC);
CREATE INDEX idx_matters_client_name ON matters(client_name);

-- Time Entries
CREATE INDEX idx_time_entries_matter ON time_entries(matter_id);
CREATE INDEX idx_time_entries_advocate ON time_entries(advocate_id);
CREATE INDEX idx_time_entries_date ON time_entries(entry_date DESC);
CREATE INDEX idx_time_entries_billed ON time_entries(is_billed);
CREATE INDEX idx_time_entries_invoice ON time_entries(invoice_id);

-- Expenses
CREATE INDEX idx_expenses_matter ON expenses(matter_id);
CREATE INDEX idx_expenses_advocate ON expenses(advocate_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_billed ON expenses(is_billed);
CREATE INDEX idx_expenses_invoice ON expenses(invoice_id);

-- Invoices
CREATE INDEX idx_invoices_matter ON invoices(matter_id);
CREATE INDEX idx_invoices_advocate ON invoices(advocate_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_source_proforma ON invoices(source_proforma_id);

-- Payments
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate Quote Number (PF-YYYY-NNN)
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  quote_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(quote_number FROM 'PF-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM proforma_requests
  WHERE quote_number LIKE 'PF-' || year_part || '-%';
  
  quote_num := 'PF-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql;

-- Generate Matter Reference (JHB/YYYY/NNN or CPT/YYYY/NNN)
CREATE OR REPLACE FUNCTION generate_matter_reference(p_bar bar_association)
RETURNS TEXT AS $$
DECLARE
  bar_prefix TEXT;
  year_part TEXT;
  sequence_num INTEGER;
  ref_num TEXT;
BEGIN
  bar_prefix := CASE p_bar 
    WHEN 'johannesburg' THEN 'JHB'
    WHEN 'cape_town' THEN 'CPT'
  END;
  
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d{4}/(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM matters
  WHERE reference_number LIKE bar_prefix || '/' || year_part || '/%';
  
  ref_num := bar_prefix || '/' || year_part || '/' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN ref_num;
END;
$$ LANGUAGE plpgsql;

-- Generate Invoice Number (INV-YYYY-NNN)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  inv_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%'
  AND is_pro_forma = false;
  
  inv_num := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN inv_num;
END;
$$ LANGUAGE plpgsql;

-- Update Matter WIP Value
CREATE OR REPLACE FUNCTION update_matter_wip()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matters
  SET wip_value = (
    SELECT COALESCE(SUM(amount), 0)
    FROM time_entries
    WHERE matter_id = NEW.matter_id
    AND is_billed = false
  ) + (
    SELECT COALESCE(SUM(amount), 0)
    FROM expenses
    WHERE matter_id = NEW.matter_id
    AND is_billed = false
  )
  WHERE id = NEW.matter_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION set_quote_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := generate_quote_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_proforma_quote_number
  BEFORE INSERT ON proforma_requests
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL)
  EXECUTE FUNCTION set_quote_number_trigger();

-- Auto-generate matter references
CREATE OR REPLACE FUNCTION set_matter_reference_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference_number := generate_matter_reference(
    (SELECT bar FROM advocates WHERE id = NEW.advocate_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_matter_reference
  BEFORE INSERT ON matters
  FOR EACH ROW
  WHEN (NEW.reference_number IS NULL)
  EXECUTE FUNCTION set_matter_reference_trigger();

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := generate_invoice_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL AND NEW.is_pro_forma = false)
  EXECUTE FUNCTION set_invoice_number_trigger();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proforma_requests_updated_at
  BEFORE UPDATE ON proforma_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matters_updated_at
  BEFORE UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update matter WIP on time entry changes
CREATE TRIGGER update_matter_wip_on_time_entry
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_matter_wip();

-- Update matter WIP on expense changes
CREATE TRIGGER update_matter_wip_on_expense
  AFTER INSERT OR UPDATE OR DELETE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_matter_wip();

-- Link converted matter to pro forma
CREATE OR REPLACE FUNCTION link_converted_matter_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE proforma_requests
  SET converted_matter_id = NEW.id,
      status = 'converted'
  WHERE id = NEW.source_proforma_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER link_converted_matter
  AFTER INSERT ON matters
  FOR EACH ROW
  WHEN (NEW.source_proforma_id IS NOT NULL)
  EXECUTE FUNCTION link_converted_matter_trigger();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE advocates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Advocates: Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON advocates FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON advocates FOR UPDATE
  USING (id = auth.uid());

-- Pro Forma Requests: Users can manage their own requests
CREATE POLICY "Users can view their own proforma requests"
  ON proforma_requests FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create proforma requests"
  ON proforma_requests FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own proforma requests"
  ON proforma_requests FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own draft proforma requests"
  ON proforma_requests FOR DELETE
  USING (advocate_id = auth.uid() AND status = 'draft');

-- Matters: Users can manage their own matters
CREATE POLICY "Users can view their own matters"
  ON matters FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create matters"
  ON matters FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own matters"
  ON matters FOR UPDATE
  USING (advocate_id = auth.uid());

-- Time Entries: Users can manage their own time entries
CREATE POLICY "Users can view their own time entries"
  ON time_entries FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create time entries"
  ON time_entries FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own unbilled time entries"
  ON time_entries FOR DELETE
  USING (advocate_id = auth.uid() AND is_billed = false);

-- Expenses: Users can manage their own expenses
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own unbilled expenses"
  ON expenses FOR DELETE
  USING (advocate_id = auth.uid() AND is_billed = false);

-- Invoices: Users can manage their own invoices
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (advocate_id = auth.uid());

CREATE POLICY "Users can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (advocate_id = auth.uid());

-- Payments: Users can manage payments for their invoices
CREATE POLICY "Users can view payments for their invoices"
  ON payments FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their invoices"
  ON payments FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE advocate_id = auth.uid()
    )
  );

-- User Preferences: Users can manage their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE proforma_requests IS 'Lightweight quote/estimate requests (Step 1)';
COMMENT ON TABLE matters IS 'Legal matters and cases (Step 2)';
COMMENT ON TABLE invoices IS 'Final invoices and billing (Step 3)';
COMMENT ON TABLE time_entries IS 'Time tracking for WIP calculation';
COMMENT ON TABLE expenses IS 'Expense tracking for WIP calculation';
COMMENT ON TABLE payments IS 'Payment records against invoices';

COMMENT ON COLUMN proforma_requests.quote_number IS 'Auto-generated: PF-YYYY-NNN';
COMMENT ON COLUMN matters.reference_number IS 'Auto-generated: JHB/YYYY/NNN or CPT/YYYY/NNN';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated: INV-YYYY-NNNN';
COMMENT ON COLUMN matters.source_proforma_id IS 'Links to the pro forma that was converted to this matter';
COMMENT ON COLUMN invoices.source_proforma_id IS 'Links to the original pro forma request';
COMMENT ON COLUMN matters.wip_value IS 'Work in Progress value (unbilled time + expenses)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
