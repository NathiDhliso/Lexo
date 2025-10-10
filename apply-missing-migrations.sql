-- ============================================================================
-- APPLY MISSING MIGRATIONS TO REMOTE DATABASE
-- Run this script to sync your remote database with your codebase
-- ============================================================================
-- 
-- IMPORTANT: This script applies migrations that are missing from your
-- remote database. Review each section before running.
--
-- Current Remote State: Based on 20251007074419_remote_commit.sql
-- Missing Tables: engagement_agreements, retainer_agreements, trust_transactions,
--                 partner_approvals, scope_amendments, payment_disputes
-- Missing Columns: public_token, link tracking fields, billing_status
-- ============================================================================

\echo '============================================================================'
\echo 'STEP 1: Engagement Agreements'
\echo '============================================================================'

CREATE TABLE IF NOT EXISTS engagement_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proforma_request_id UUID REFERENCES proforma_requests(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    client_name TEXT NOT NULL,
    client_email TEXT,
    
    signed_at TIMESTAMPTZ,
    document_url TEXT,
    
    client_signature_data TEXT,
    advocate_signature_data TEXT,
    
    terms_and_conditions TEXT,
    scope_of_work TEXT,
    fee_structure TEXT,
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_engagement_agreements_proforma ON engagement_agreements(proforma_request_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_agreements_matter ON engagement_agreements(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_agreements_advocate ON engagement_agreements(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_agreements_status ON engagement_agreements(status) WHERE deleted_at IS NULL;

ALTER TABLE engagement_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advocates can view their own engagement agreements" ON engagement_agreements;
CREATE POLICY "Advocates can view their own engagement agreements"
    ON engagement_agreements FOR SELECT
    TO authenticated
    USING (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can create engagement agreements" ON engagement_agreements;
CREATE POLICY "Advocates can create engagement agreements"
    ON engagement_agreements FOR INSERT
    TO authenticated
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can update their own engagement agreements" ON engagement_agreements;
CREATE POLICY "Advocates can update their own engagement agreements"
    ON engagement_agreements FOR UPDATE
    TO authenticated
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can soft delete their own engagement agreements" ON engagement_agreements;
CREATE POLICY "Advocates can soft delete their own engagement agreements"
    ON engagement_agreements FOR DELETE
    TO authenticated
    USING (advocate_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON engagement_agreements TO authenticated;

\echo '============================================================================'
\echo 'STEP 2: Scope Amendments'
\echo '============================================================================'

CREATE TABLE IF NOT EXISTS scope_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_agreement_id UUID NOT NULL REFERENCES engagement_agreements(id) ON DELETE CASCADE,
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    amendment_type TEXT NOT NULL CHECK (amendment_type IN ('scope_expansion', 'scope_reduction', 'fee_adjustment', 'timeline_extension', 'other')),
    
    original_scope TEXT,
    amended_scope TEXT NOT NULL,
    
    original_fee DECIMAL(12,2),
    amended_fee DECIMAL(12,2),
    
    reason TEXT NOT NULL,
    justification TEXT,
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'implemented')),
    
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    implemented_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scope_amendments_engagement ON scope_amendments(engagement_agreement_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scope_amendments_matter ON scope_amendments(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scope_amendments_advocate ON scope_amendments(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scope_amendments_status ON scope_amendments(status) WHERE deleted_at IS NULL;

ALTER TABLE scope_amendments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advocates can view their own scope amendments" ON scope_amendments;
CREATE POLICY "Advocates can view their own scope amendments"
    ON scope_amendments FOR SELECT
    TO authenticated
    USING (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can create scope amendments" ON scope_amendments;
CREATE POLICY "Advocates can create scope amendments"
    ON scope_amendments FOR INSERT
    TO authenticated
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can update their own scope amendments" ON scope_amendments;
CREATE POLICY "Advocates can update their own scope amendments"
    ON scope_amendments FOR UPDATE
    TO authenticated
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can delete their own scope amendments" ON scope_amendments;
CREATE POLICY "Advocates can delete their own scope amendments"
    ON scope_amendments FOR DELETE
    TO authenticated
    USING (advocate_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON scope_amendments TO authenticated;

\echo '============================================================================'
\echo 'STEP 3: Payment Disputes'
\echo '============================================================================'

CREATE TABLE IF NOT EXISTS payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('amount_disputed', 'service_quality', 'billing_error', 'unauthorized_charge', 'other')),
    
    disputed_amount DECIMAL(12,2) NOT NULL,
    claimed_amount DECIMAL(12,2),
    
    client_reason TEXT NOT NULL,
    advocate_response TEXT,
    
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
    
    resolution_notes TEXT,
    resolution_amount DECIMAL(12,2),
    
    filed_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_invoice ON payment_disputes(invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_disputes_matter ON payment_disputes(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_disputes_advocate ON payment_disputes(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status) WHERE deleted_at IS NULL;

ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advocates can view their own payment disputes" ON payment_disputes;
CREATE POLICY "Advocates can view their own payment disputes"
    ON payment_disputes FOR SELECT
    TO authenticated
    USING (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can create payment disputes" ON payment_disputes;
CREATE POLICY "Advocates can create payment disputes"
    ON payment_disputes FOR INSERT
    TO authenticated
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can update their own payment disputes" ON payment_disputes;
CREATE POLICY "Advocates can update their own payment disputes"
    ON payment_disputes FOR UPDATE
    TO authenticated
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON payment_disputes TO authenticated;

\echo '============================================================================'
\echo 'STEP 4: Retainer System'
\echo '============================================================================'

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

CREATE INDEX IF NOT EXISTS idx_retainer_agreements_matter ON retainer_agreements(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_retainer_agreements_advocate ON retainer_agreements(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_retainer_agreements_status ON retainer_agreements(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trust_transactions_retainer ON trust_transactions(retainer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trust_transactions_matter ON trust_transactions(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trust_transactions_advocate ON trust_transactions(advocate_id) WHERE deleted_at IS NULL;

ALTER TABLE retainer_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advocates can view their own retainer agreements" ON retainer_agreements;
CREATE POLICY "Advocates can view their own retainer agreements"
    ON retainer_agreements FOR SELECT
    TO authenticated
    USING (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can create retainer agreements" ON retainer_agreements;
CREATE POLICY "Advocates can create retainer agreements"
    ON retainer_agreements FOR INSERT
    TO authenticated
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can update their own retainer agreements" ON retainer_agreements;
CREATE POLICY "Advocates can update their own retainer agreements"
    ON retainer_agreements FOR UPDATE
    TO authenticated
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can view their own trust transactions" ON trust_transactions;
CREATE POLICY "Advocates can view their own trust transactions"
    ON trust_transactions FOR SELECT
    TO authenticated
    USING (advocate_id = auth.uid());

DROP POLICY IF EXISTS "Advocates can create trust transactions" ON trust_transactions;
CREATE POLICY "Advocates can create trust transactions"
    ON trust_transactions FOR INSERT
    TO authenticated
    WITH CHECK (advocate_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON retainer_agreements TO authenticated;
GRANT SELECT, INSERT ON trust_transactions TO authenticated;

\echo '============================================================================'
\echo 'STEP 5: Partner Approvals'
\echo '============================================================================'

CREATE TABLE IF NOT EXISTS partner_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  comments TEXT,
  checklist JSONB,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matters
ADD COLUMN IF NOT EXISTS billing_status TEXT CHECK (billing_status IN ('pending', 'approved', 'rejected', 'invoiced')) DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_partner_approvals_matter_id ON partner_approvals(matter_id);
CREATE INDEX IF NOT EXISTS idx_partner_approvals_partner_id ON partner_approvals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_approvals_status ON partner_approvals(status);
CREATE INDEX IF NOT EXISTS idx_matters_billing_status ON matters(billing_status);

ALTER TABLE partner_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view partner approvals" ON partner_approvals;
CREATE POLICY "Users can view partner approvals"
  ON partner_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = partner_approvals.matter_id
      AND m.advocate_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create approvals" ON partner_approvals;
CREATE POLICY "Users can create approvals"
  ON partner_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matters m
      WHERE m.id = partner_approvals.matter_id
      AND m.advocate_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their approvals" ON partner_approvals;
CREATE POLICY "Users can update their approvals"
  ON partner_approvals FOR UPDATE
  TO authenticated
  USING (partner_id = auth.uid())
  WITH CHECK (partner_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON partner_approvals TO authenticated;

\echo '============================================================================'
\echo 'STEP 6: Public Tokens for Attorney Portal'
\echo '============================================================================'

ALTER TABLE proforma_requests 
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid() UNIQUE;

CREATE INDEX IF NOT EXISTS idx_proforma_public_token 
ON proforma_requests(public_token);

ALTER TABLE engagement_agreements 
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid() UNIQUE;

CREATE INDEX IF NOT EXISTS idx_engagement_public_token 
ON engagement_agreements(public_token);

ALTER TABLE proforma_requests
ADD COLUMN IF NOT EXISTS link_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS link_sent_to TEXT;

ALTER TABLE engagement_agreements
ADD COLUMN IF NOT EXISTS link_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS link_sent_to TEXT;

\echo '============================================================================'
\echo 'STEP 7: Extended Matter Fields'
\echo '============================================================================'

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

CREATE INDEX IF NOT EXISTS idx_matters_state ON matters(state);
CREATE INDEX IF NOT EXISTS idx_matters_court_date ON matters(court_date) WHERE state = 'awaiting_court';

\echo '============================================================================'
\echo 'STEP 8: Invoice Bar Reminders'
\echo '============================================================================'

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS bar_reminder_sent BOOLEAN DEFAULT FALSE;

\echo '============================================================================'
\echo 'MIGRATION COMPLETE'
\echo '============================================================================'
\echo 'All missing tables and columns have been added to your remote database.'
\echo 'Your database is now in sync with your codebase.'
\echo '============================================================================'
