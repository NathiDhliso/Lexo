-- Retainer Agreements Table
CREATE TABLE IF NOT EXISTS retainer_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    engagement_agreement_id UUID REFERENCES engagement_agreements(id) ON DELETE SET NULL,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    retainer_type TEXT NOT NULL CHECK (retainer_type IN ('monthly', 'annual', 'project', 'evergreen')),
    
    retainer_amount DECIMAL(12,2) NOT NULL CHECK (retainer_amount > 0),
    billing_period TEXT CHECK (billing_period IN ('monthly', 'quarterly', 'annual', 'one_time')),
    
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    trust_account_balance DECIMAL(12,2) DEFAULT 0 CHECK (trust_account_balance >= 0),
    total_drawn DECIMAL(12,2) DEFAULT 0 CHECK (total_drawn >= 0),
    remaining_balance DECIMAL(12,2) GENERATED ALWAYS AS (retainer_amount - total_drawn) STORED,
    
    low_balance_threshold DECIMAL(5,2) DEFAULT 20.0,
    low_balance_alert_sent BOOLEAN DEFAULT FALSE,
    
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired', 'cancelled', 'refunded')),
    
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_retainer_agreements_matter ON retainer_agreements(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_retainer_agreements_advocate ON retainer_agreements(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_retainer_agreements_status ON retainer_agreements(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_retainer_agreements_end_date ON retainer_agreements(end_date) WHERE status = 'active';

COMMENT ON TABLE retainer_agreements IS 'Retainer agreements for prepaid legal services';
COMMENT ON COLUMN retainer_agreements.retainer_type IS 'Type: monthly, annual, project, evergreen';
COMMENT ON COLUMN retainer_agreements.trust_account_balance IS 'Current balance in trust account';
COMMENT ON COLUMN retainer_agreements.total_drawn IS 'Total amount drawn down from retainer';
COMMENT ON COLUMN retainer_agreements.remaining_balance IS 'Computed: retainer_amount - total_drawn';

-- Trust Transactions Table
CREATE TABLE IF NOT EXISTS trust_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retainer_id UUID NOT NULL REFERENCES retainer_agreements(id) ON DELETE CASCADE,
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'drawdown', 'refund', 'transfer', 'adjustment')),
    
    amount DECIMAL(12,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    reference TEXT,
    description TEXT NOT NULL,
    
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL,
    expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
    
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_trust_transactions_retainer ON trust_transactions(retainer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trust_transactions_matter ON trust_transactions(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trust_transactions_advocate ON trust_transactions(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trust_transactions_type ON trust_transactions(transaction_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_trust_transactions_date ON trust_transactions(transaction_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE trust_transactions IS 'Trust account transaction history for retainers';
COMMENT ON COLUMN trust_transactions.transaction_type IS 'Type: deposit, drawdown, refund, transfer, adjustment';

-- Extend matters table for retainer and state management
ALTER TABLE matters
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'active' CHECK (
    state IN ('active', 'paused', 'on_hold', 'awaiting_court', 'completed', 'archived')
),
ADD COLUMN IF NOT EXISTS court_date DATE,
ADD COLUMN IF NOT EXISTS paused_reason TEXT,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS agreed_fee_cap DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS agreed_hourly_rate DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS agreed_timeline_days INTEGER;

CREATE INDEX IF NOT EXISTS idx_matters_state ON matters(state) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matters_court_date ON matters(court_date) WHERE state = 'awaiting_court';

COMMENT ON COLUMN matters.state IS 'Matter state: active, paused, on_hold, awaiting_court, completed, archived';
COMMENT ON COLUMN matters.agreed_fee_cap IS 'Fee cap from engagement agreement';
COMMENT ON COLUMN matters.agreed_hourly_rate IS 'Agreed hourly rate from engagement agreement';

-- Extend invoices table for sequencing
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS invoice_sequence INTEGER;

-- Function to auto-set invoice sequence per matter
CREATE OR REPLACE FUNCTION set_invoice_sequence()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.matter_id IS NOT NULL THEN
        SELECT COALESCE(MAX(invoice_sequence), 0) + 1
        INTO NEW.invoice_sequence
        FROM invoices
        WHERE matter_id = NEW.matter_id
        AND deleted_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_sequence_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.matter_id IS NOT NULL)
    EXECUTE FUNCTION set_invoice_sequence();

-- Constraint: only one final invoice per matter
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_one_final_per_matter 
ON invoices(matter_id) 
WHERE invoice_type = 'final' AND deleted_at IS NULL;

-- Function to update retainer balance on drawdown
CREATE OR REPLACE FUNCTION update_retainer_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL(12,2);
    new_balance DECIMAL(12,2);
BEGIN
    IF NEW.transaction_type = 'drawdown' THEN
        UPDATE retainer_agreements
        SET total_drawn = total_drawn + NEW.amount,
            trust_account_balance = trust_account_balance - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.retainer_id
        RETURNING trust_account_balance INTO new_balance;
        
        IF new_balance <= 0 THEN
            UPDATE retainer_agreements
            SET status = 'depleted'
            WHERE id = NEW.retainer_id;
        END IF;
        
    ELSIF NEW.transaction_type = 'deposit' THEN
        UPDATE retainer_agreements
        SET trust_account_balance = trust_account_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.retainer_id;
        
    ELSIF NEW.transaction_type = 'refund' THEN
        UPDATE retainer_agreements
        SET trust_account_balance = trust_account_balance - NEW.amount,
            status = 'refunded',
            updated_at = NOW()
        WHERE id = NEW.retainer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_retainer_balance_trigger
    AFTER INSERT ON trust_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_retainer_balance();

-- Function to check low retainer balance
CREATE OR REPLACE FUNCTION check_low_retainer_balance()
RETURNS TRIGGER AS $$
DECLARE
    threshold_amount DECIMAL(12,2);
    percentage_remaining DECIMAL(5,2);
BEGIN
    threshold_amount := NEW.retainer_amount * (NEW.low_balance_threshold / 100);
    percentage_remaining := (NEW.remaining_balance / NEW.retainer_amount) * 100;
    
    IF percentage_remaining <= NEW.low_balance_threshold AND NOT NEW.low_balance_alert_sent THEN
        NEW.low_balance_alert_sent := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_low_retainer_balance_trigger
    BEFORE UPDATE OF trust_account_balance ON retainer_agreements
    FOR EACH ROW
    EXECUTE FUNCTION check_low_retainer_balance();

-- Function to compare costs against engagement agreement terms
CREATE OR REPLACE FUNCTION check_cost_vs_agreement()
RETURNS TRIGGER AS $$
DECLARE
    variance_percentage DECIMAL(5,2);
    agreed_cap DECIMAL(12,2);
BEGIN
    agreed_cap := NEW.agreed_fee_cap;
    
    IF agreed_cap IS NOT NULL AND agreed_cap > 0 AND NEW.actual_total > agreed_cap THEN
        variance_percentage := ((NEW.actual_total - agreed_cap) / agreed_cap) * 100;
        
        IF variance_percentage > 10 THEN
            INSERT INTO scope_amendments (
                matter_id,
                advocate_id,
                amendment_type,
                reason,
                original_estimate,
                new_estimate,
                status
            ) VALUES (
                NEW.id,
                NEW.advocate_id,
                'scope_increase',
                'Actual costs exceeded agreed fee cap by ' || ROUND(variance_percentage, 2) || '%',
                agreed_cap,
                NEW.actual_total,
                'pending'
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_matter_cost_vs_agreement
    AFTER UPDATE OF actual_total ON matters
    FOR EACH ROW
    WHEN (NEW.agreed_fee_cap IS NOT NULL AND NEW.actual_total > OLD.actual_total)
    EXECUTE FUNCTION check_cost_vs_agreement();

-- RLS Policies
ALTER TABLE retainer_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own retainer agreements"
    ON retainer_agreements FOR SELECT
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create retainer agreements"
    ON retainer_agreements FOR INSERT
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own retainer agreements"
    ON retainer_agreements FOR UPDATE
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can view their own trust transactions"
    ON trust_transactions FOR SELECT
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create trust transactions"
    ON trust_transactions FOR INSERT
    WITH CHECK (advocate_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_retainer_agreements_updated_at
    BEFORE UPDATE ON retainer_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_transactions_updated_at
    BEFORE UPDATE ON trust_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Validation: urgent matters must have engagement agreement
ALTER TABLE matters
DROP CONSTRAINT IF EXISTS urgent_matters_require_engagement;

ALTER TABLE matters
ADD CONSTRAINT urgent_matters_require_engagement
CHECK (
    (is_urgent = FALSE) OR 
    (is_urgent = TRUE AND engagement_agreement_id IS NOT NULL)
);
