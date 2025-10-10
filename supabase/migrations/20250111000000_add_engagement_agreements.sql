-- Engagement Agreements Table
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

CREATE INDEX idx_engagement_agreements_proforma ON engagement_agreements(proforma_request_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_engagement_agreements_matter ON engagement_agreements(matter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_engagement_agreements_advocate ON engagement_agreements(advocate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_engagement_agreements_status ON engagement_agreements(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE engagement_agreements IS 'Formal engagement agreements between advocates and clients';
COMMENT ON COLUMN engagement_agreements.status IS 'Agreement status: draft, sent, signed, cancelled';
COMMENT ON COLUMN engagement_agreements.client_signature_data IS 'Base64 encoded signature or signature metadata';
COMMENT ON COLUMN engagement_agreements.advocate_signature_data IS 'Base64 encoded signature or signature metadata';

-- RLS Policies
ALTER TABLE engagement_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advocates can view their own engagement agreements"
    ON engagement_agreements FOR SELECT
    USING (advocate_id = auth.uid());

CREATE POLICY "Advocates can create engagement agreements"
    ON engagement_agreements FOR INSERT
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can update their own engagement agreements"
    ON engagement_agreements FOR UPDATE
    USING (advocate_id = auth.uid())
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Advocates can soft delete their own engagement agreements"
    ON engagement_agreements FOR DELETE
    USING (advocate_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_engagement_agreements_updated_at
    BEFORE UPDATE ON engagement_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
