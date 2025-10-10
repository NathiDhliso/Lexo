-- Scope Amendments Table
CREATE TABLE IF NOT EXISTS scope_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    engagement_agreement_id UUID REFERENCES engagement_agreements(id) ON DELETE SET NULL,
    advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
    
    amendment_type TEXT NOT NULL CHECK (amendment_type IN ('scope_increase', 'scope_decrease', 'fee_adjustment', 'timeline_change', 'other')),
    
    reason TEXT NOT NULL,
    description TEXT,
    
    original_estimate DECIMAL(12,2),
    new_estimate DECIMAL(12,2),
    estimate_variance DECIMAL(12,2) GENERATED ALWAYS AS (new_estimate - original_estimate) STORED,
    variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN original_estimate > 0 THEN ((new_estimate - original_estimate) / original_estimate * 100)
            ELSE 0
        END
    ) STORED,
    
    original_timeline_days INTEGER,
    new_timeline_days INTEGER,
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'superseded')),
    
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES advocates(id),
    rejection_reason TEXT,
    
    client_notified_at TIMESTAMPTZ,
    client_approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_scope_amendments_matter ON scope_amendments(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scope_amendments_engagement ON scope_amendments(engagement_agreement_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_scope_amendments_status ON scope_amendments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_scope_amendments_advocate ON scope_amendments(advocate_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE scope_amendments IS 'Track scope changes and amendments to matters after initial engagement';
COMMENT ON COLUMN scope_amendments.amendment_type IS 'Type of amendment: scope_increase, scope_decrease, fee_adjustment, timeline_change, other';
COMMENT ON COLUMN scope_amendments.status IS 'Amendment status: pending, approved, rejected, superseded';

-- RLS Policies
ALTER TABLE scope_amendments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own scope amendments"
    ON scope_amendments FOR SELECT
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create scope amendments"
    ON scope_amendments FOR INSERT
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own scope amendments"
    ON scope_amendments FOR UPDATE
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_scope_amendments_updated_at
    BEFORE UPDATE ON scope_amendments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
