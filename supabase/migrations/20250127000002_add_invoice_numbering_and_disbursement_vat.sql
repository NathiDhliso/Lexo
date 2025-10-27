-- =====================================================
-- Phase 3: Invoice Numbering & Disbursement VAT System
-- Requirements: 5.1-5.7, 6.1-6.7
-- =====================================================

-- =====================================================
-- Part 1: Enhanced Invoice Numbering (Requirements 5.1-5.7)
-- =====================================================

-- 11.1: Extend invoice_settings for flexible numbering modes
ALTER TABLE invoice_settings
ADD COLUMN IF NOT EXISTS invoice_numbering_mode TEXT DEFAULT 'strict' CHECK (invoice_numbering_mode IN ('strict', 'flexible')),
ADD COLUMN IF NOT EXISTS year_reset_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_manual_numbers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gap_tolerance_days INTEGER DEFAULT 0 CHECK (gap_tolerance_days >= 0);

COMMENT ON COLUMN invoice_settings.invoice_numbering_mode IS 'Strict: No gaps allowed. Flexible: Gaps logged but allowed (Req 5.1)';
COMMENT ON COLUMN invoice_settings.year_reset_enabled IS 'Reset sequence to 1 every January 1st (Req 5.7)';
COMMENT ON COLUMN invoice_settings.allow_manual_numbers IS 'Allow manual invoice number entry';
COMMENT ON COLUMN invoice_settings.gap_tolerance_days IS 'Days to tolerate gaps in flexible mode before alerting';

-- 11.1: Extend invoice_numbering_audit for comprehensive tracking (Requirements 5.4, 5.5)
ALTER TABLE invoice_numbering_audit
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'created' CHECK (action_type IN ('created', 'voided', 'gap_detected', 'corrected', 'manual_override')),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS gap_size INTEGER,
ADD COLUMN IF NOT EXISTS previous_number TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS idx_invoice_numbering_audit_action ON invoice_numbering_audit(action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_numbering_audit_user ON invoice_numbering_audit(user_id);

COMMENT ON COLUMN invoice_numbering_audit.action_type IS 'Type of numbering action for SARS compliance (Req 5.4)';
COMMENT ON COLUMN invoice_numbering_audit.gap_size IS 'Size of gap detected in sequence';
COMMENT ON COLUMN invoice_numbering_audit.metadata IS 'Additional context (IP address, reason, etc.)';

-- =====================================================
-- Part 2: Smart Disbursement VAT System (Requirements 6.1-6.7)
-- =====================================================

-- 12.1: Create disbursement types with VAT rules (Requirements 6.1, 6.2, 6.4)
CREATE TABLE IF NOT EXISTS disbursement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advocate_id UUID REFERENCES advocates(id) ON DELETE CASCADE,
    
    -- Type details
    type_name TEXT NOT NULL,
    description TEXT,
    
    -- VAT rules
    vat_treatment TEXT NOT NULL DEFAULT 'suggest_no_vat' CHECK (vat_treatment IN (
        'always_vat',           -- Always include VAT (e.g., accommodation)
        'never_vat',            -- Never include VAT (e.g., court fees)
        'suggest_vat',          -- Suggest VAT, allow override
        'suggest_no_vat'        -- Suggest no VAT, allow override
    )),
    vat_rate DECIMAL(5,4) DEFAULT 0.15, -- 15% VAT
    
    -- Category and compliance
    category TEXT CHECK (category IN ('court_fees', 'travel', 'accommodation', 'document_fees', 'expert_fees', 'other')),
    is_system_default BOOLEAN DEFAULT FALSE,
    sars_code TEXT, -- SARS tax code for reporting
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_disbursement_types_advocate_name ON disbursement_types(advocate_id, LOWER(type_name)) 
    WHERE deleted_at IS NULL AND advocate_id IS NOT NULL;
CREATE INDEX idx_disbursement_types_system ON disbursement_types(is_system_default) 
    WHERE is_system_default = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_disbursement_types_category ON disbursement_types(category) WHERE deleted_at IS NULL;

COMMENT ON TABLE disbursement_types IS 'Disbursement type definitions with smart VAT rules (Req 6.1, 6.4)';
COMMENT ON COLUMN disbursement_types.vat_treatment IS 'VAT suggestion logic for auto-suggestion (Req 6.2)';

-- 12.2: Extend expenses table for smart VAT handling (Requirements 6.1, 6.3, 6.5)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS disbursement_type_id UUID REFERENCES disbursement_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vat_treatment TEXT CHECK (vat_treatment IN ('vat_inclusive', 'vat_exempt')),
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_suggested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vat_overridden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vat_override_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_expenses_disbursement_type ON expenses(disbursement_type_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_vat_treatment ON expenses(vat_treatment);

COMMENT ON COLUMN expenses.vat_suggested IS 'System suggested VAT based on type (Req 6.2)';
COMMENT ON COLUMN expenses.vat_overridden IS 'User manually changed VAT from suggestion (Req 6.3)';
COMMENT ON COLUMN expenses.vat_override_reason IS 'Reason for VAT correction (Req 6.5, 6.6)';

-- 12.2: Create disbursement VAT audit log (Requirement 6.5)
CREATE TABLE IF NOT EXISTS disbursement_vat_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    -- Audit details
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'vat_changed', 'corrected', 'overridden')),
    old_vat_treatment TEXT,
    new_vat_treatment TEXT,
    old_vat_amount DECIMAL(12,2),
    new_vat_amount DECIMAL(12,2),
    
    -- Reason and compliance
    reason TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Invoice impact
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    invoice_regenerated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disbursement_vat_audit_expense ON disbursement_vat_audit(expense_id);
CREATE INDEX idx_disbursement_vat_audit_advocate ON disbursement_vat_audit(advocate_id);
CREATE INDEX idx_disbursement_vat_audit_action ON disbursement_vat_audit(action_type, created_at);

COMMENT ON TABLE disbursement_vat_audit IS 'Audit trail for VAT treatment changes (Req 6.5)';

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function: Generate next invoice number with mode support (Requirements 5.1, 5.2, 5.3)
CREATE OR REPLACE FUNCTION get_next_invoice_number(p_advocate_id UUID, p_mode TEXT DEFAULT 'strict')
RETURNS TEXT AS $$
DECLARE
    settings RECORD;
    current_year INTEGER;
    next_sequence INTEGER;
    invoice_number TEXT;
    last_number_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get settings
    SELECT * INTO settings
    FROM invoice_settings
    WHERE advocate_id = p_advocate_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice settings not found for advocate %', p_advocate_id;
    END IF;
    
    -- Check if year reset is needed (Requirement 5.7)
    IF settings.year_reset_enabled AND settings.invoice_sequence_year != current_year THEN
        next_sequence := 1;
        
        -- Update settings with new year
        UPDATE invoice_settings
        SET invoice_sequence_year = current_year,
            invoice_sequence_current = 0
        WHERE advocate_id = p_advocate_id;
    ELSE
        next_sequence := settings.invoice_sequence_current + 1;
    END IF;
    
    -- Format invoice number based on format template
    invoice_number := REPLACE(settings.invoice_number_format, 'YYYY', current_year::TEXT);
    invoice_number := REPLACE(invoice_number, 'NNN', LPAD(next_sequence::TEXT, 3, '0'));
    invoice_number := REPLACE(invoice_number, 'NNNN', LPAD(next_sequence::TEXT, 4, '0'));
    
    -- In strict mode, validate no gaps (Requirement 5.1, 5.2)
    IF p_mode = 'strict' OR settings.invoice_numbering_mode = 'strict' THEN
        -- Check for gaps in sequence
        PERFORM 1 FROM invoice_numbering_audit
        WHERE advocate_id = p_advocate_id
        AND status = 'voided'
        AND number_type = 'invoice'
        AND created_at > NOW() - INTERVAL '1 year';
        
        IF FOUND THEN
            RAISE EXCEPTION 'Gap detected in invoice sequence. Strict mode requires sequential numbering (Req 5.2)';
        END IF;
    END IF;
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_invoice_number IS 'Generate next invoice number with strict/flexible mode support (Req 5.1)';

-- Function: Log invoice number action (Requirements 5.4, 5.5, 5.6)
CREATE OR REPLACE FUNCTION log_invoice_number_action()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
    gap_detected INTEGER;
    prev_number TEXT;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
    ELSIF NEW.status = 'voided' AND OLD.status != 'voided' THEN
        action_type := 'voided';
    ELSE
        action_type := 'updated';
    END IF;
    
    -- Check for gaps in flexible mode
    IF action_type = 'voided' THEN
        SELECT invoice_sequence INTO gap_detected
        FROM invoices
        WHERE advocate_id = NEW.advocate_id
        AND invoice_sequence = NEW.invoice_sequence - 1
        AND deleted_at IS NULL;
        
        IF NOT FOUND THEN
            action_type := 'gap_detected';
        END IF;
    END IF;
    
    -- Insert audit log
    INSERT INTO invoice_numbering_audit (
        advocate_id,
        invoice_id,
        invoice_number,
        number_type,
        status,
        action_type,
        void_reason,
        gap_size,
        user_id
    ) VALUES (
        NEW.advocate_id,
        NEW.id,
        NEW.invoice_number,
        'invoice',
        NEW.status,
        action_type,
        NEW.void_reason,
        gap_detected,
        auth.uid()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_invoice_number_action_trigger
    AFTER INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION log_invoice_number_action();

-- Function: Auto-suggest VAT for disbursements (Requirements 6.1, 6.2, 6.3)
CREATE OR REPLACE FUNCTION suggest_disbursement_vat()
RETURNS TRIGGER AS $$
DECLARE
    disbursement_type RECORD;
    vat_amount DECIMAL(12,2);
BEGIN
    -- Only suggest on insert or when type changes
    IF TG_OP = 'UPDATE' AND NEW.disbursement_type_id = OLD.disbursement_type_id THEN
        RETURN NEW;
    END IF;
    
    -- Get disbursement type VAT rules
    IF NEW.disbursement_type_id IS NOT NULL THEN
        SELECT * INTO disbursement_type
        FROM disbursement_types
        WHERE id = NEW.disbursement_type_id;
        
        IF FOUND THEN
            -- Apply VAT suggestion based on rules
            CASE disbursement_type.vat_treatment
                WHEN 'always_vat', 'suggest_vat' THEN
                    NEW.vat_treatment := 'vat_inclusive';
                    NEW.vat_amount := NEW.amount * disbursement_type.vat_rate / (1 + disbursement_type.vat_rate);
                    NEW.vat_suggested := TRUE;
                    
                WHEN 'never_vat', 'suggest_no_vat' THEN
                    NEW.vat_treatment := 'vat_exempt';
                    NEW.vat_amount := 0;
                    NEW.vat_suggested := TRUE;
            END CASE;
            
            -- Update usage count
            UPDATE disbursement_types
            SET usage_count = usage_count + 1,
                last_used_at = NOW()
            WHERE id = NEW.disbursement_type_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER suggest_disbursement_vat_trigger
    BEFORE INSERT OR UPDATE OF disbursement_type_id ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION suggest_disbursement_vat();

-- Function: Audit VAT changes (Requirement 6.5)
CREATE OR REPLACE FUNCTION audit_disbursement_vat_change()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
BEGIN
    -- Only audit VAT-related changes
    IF TG_OP = 'UPDATE' AND (
        NEW.vat_treatment IS DISTINCT FROM OLD.vat_treatment OR
        NEW.vat_amount IS DISTINCT FROM OLD.vat_amount
    ) THEN
        -- Determine action type
        IF NEW.vat_overridden THEN
            action_type := 'overridden';
        ELSE
            action_type := 'vat_changed';
        END IF;
        
        -- Log the change
        INSERT INTO disbursement_vat_audit (
            expense_id,
            advocate_id,
            action_type,
            old_vat_treatment,
            new_vat_treatment,
            old_vat_amount,
            new_vat_amount,
            reason,
            changed_by,
            invoice_id
        ) VALUES (
            NEW.id,
            NEW.advocate_id,
            action_type,
            OLD.vat_treatment,
            NEW.vat_treatment,
            OLD.vat_amount,
            NEW.vat_amount,
            COALESCE(NEW.vat_override_reason, 'VAT treatment updated'),
            auth.uid(),
            NEW.invoice_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_disbursement_vat_change_trigger
    AFTER UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION audit_disbursement_vat_change();

-- =====================================================
-- Row-Level Security (RLS)
-- =====================================================

ALTER TABLE disbursement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursement_vat_audit ENABLE ROW LEVEL SECURITY;

-- Disbursement Types RLS
CREATE POLICY "Advocates can view system and own disbursement types"
    ON disbursement_types FOR SELECT
    USING (is_system_default = TRUE OR advocate_id = auth.uid());

CREATE POLICY "Advocates can create their own disbursement types"
    ON disbursement_types FOR INSERT
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own disbursement types"
    ON disbursement_types FOR UPDATE
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can delete their own disbursement types"
    ON disbursement_types FOR DELETE
    USING (advocate_id = auth.uid() AND is_system_default = FALSE);

-- VAT Audit RLS
CREATE POLICY "Advocates can view their own VAT audit logs"
    ON disbursement_vat_audit FOR SELECT
    USING (advocate_id = auth.uid());

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_disbursement_types_updated_at
    BEFORE UPDATE ON disbursement_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Default System Disbursement Types (Requirement 6.1)
-- =====================================================

INSERT INTO disbursement_types (type_name, description, vat_treatment, vat_rate, category, is_system_default, sars_code) VALUES
('Court Filing Fees', 'Official court filing and motion fees', 'never_vat', 0, 'court_fees', TRUE, 'COURT001'),
('Sheriff Fees', 'Service of documents by sheriff', 'never_vat', 0, 'court_fees', TRUE, 'COURT002'),
('Travel - Local', 'Local travel expenses (within 50km)', 'suggest_no_vat', 0, 'travel', TRUE, 'TRAVEL001'),
('Travel - Long Distance', 'Long distance travel (over 50km)', 'suggest_vat', 0.15, 'travel', TRUE, 'TRAVEL002'),
('Accommodation', 'Hotel and accommodation costs', 'always_vat', 0.15, 'accommodation', TRUE, 'ACCOM001'),
('Document Certification', 'Certified copies and notary fees', 'never_vat', 0, 'document_fees', TRUE, 'DOC001'),
('Photocopying', 'Photocopying and printing', 'suggest_vat', 0.15, 'document_fees', TRUE, 'DOC002'),
('Expert Witness Fees', 'Expert witness consultation fees', 'suggest_no_vat', 0, 'expert_fees', TRUE, 'EXPERT001'),
('Medical Reports', 'Medical examination and report fees', 'suggest_no_vat', 0, 'expert_fees', TRUE, 'EXPERT002'),
('Postage and Courier', 'Postal and courier services', 'suggest_vat', 0.15, 'other', TRUE, 'POST001'),
('Communication Costs', 'Phone calls, faxes, data', 'always_vat', 0.15, 'other', TRUE, 'COMM001'),
('Other Disbursements', 'Miscellaneous disbursements', 'suggest_no_vat', 0, 'other', TRUE, 'OTHER001')
ON CONFLICT DO NOTHING;
