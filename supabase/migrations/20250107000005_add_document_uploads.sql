-- Add document upload functionality
-- This migration adds tables for storing uploaded documents and their extracted data

-- ================================================================================
-- DOCUMENT UPLOADS TABLES
-- ================================================================================

-- Document uploads table
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proforma_request_id UUID REFERENCES proforma_requests(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  
  -- File information
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  
  -- Processing information
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  processing_error TEXT,
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Extracted text
  extracted_text TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES advocates(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted document data table
CREATE TABLE IF NOT EXISTS document_extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_upload_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
  
  -- Extracted client information
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  law_firm TEXT,
  
  -- Case information
  case_title TEXT,
  case_number TEXT,
  date_of_incident DATE,
  description TEXT,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
  estimated_amount DECIMAL(15,2),
  
  -- Additional extracted data
  deadlines JSONB DEFAULT '[]'::jsonb,
  parties JSONB DEFAULT '[]'::jsonb,
  entities JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  extraction_confidence INTEGER DEFAULT 0 CHECK (extraction_confidence >= 0 AND extraction_confidence <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================================
-- INDEXES
-- ================================================================================

-- Document uploads indexes
CREATE INDEX IF NOT EXISTS idx_document_uploads_proforma_request_id ON document_uploads(proforma_request_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_matter_id ON document_uploads(matter_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_processing_status ON document_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_document_uploads_uploaded_by ON document_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_document_uploads_created_at ON document_uploads(created_at);

-- Document extracted data indexes
CREATE INDEX IF NOT EXISTS idx_document_extracted_data_document_upload_id ON document_extracted_data(document_upload_id);
CREATE INDEX IF NOT EXISTS idx_document_extracted_data_client_email ON document_extracted_data(client_email);
CREATE INDEX IF NOT EXISTS idx_document_extracted_data_case_number ON document_extracted_data(case_number);

-- ================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================================

-- Enable RLS
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extracted_data ENABLE ROW LEVEL SECURITY;

-- Document uploads policies
CREATE POLICY "Users can view their own document uploads" ON document_uploads
  FOR SELECT USING (
    uploaded_by = auth.uid() OR
    proforma_request_id IN (
      SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
    ) OR
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own document uploads" ON document_uploads
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() OR
    proforma_request_id IN (
      SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
    ) OR
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own document uploads" ON document_uploads
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR
    proforma_request_id IN (
      SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
    ) OR
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own document uploads" ON document_uploads
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    proforma_request_id IN (
      SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
    ) OR
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- Document extracted data policies
CREATE POLICY "Users can view extracted data for their documents" ON document_extracted_data
  FOR SELECT USING (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE 
        uploaded_by = auth.uid() OR
        proforma_request_id IN (
          SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
        ) OR
        matter_id IN (
          SELECT id FROM matters WHERE advocate_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can insert extracted data for their documents" ON document_extracted_data
  FOR INSERT WITH CHECK (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE 
        uploaded_by = auth.uid() OR
        proforma_request_id IN (
          SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
        ) OR
        matter_id IN (
          SELECT id FROM matters WHERE advocate_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can update extracted data for their documents" ON document_extracted_data
  FOR UPDATE USING (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE 
        uploaded_by = auth.uid() OR
        proforma_request_id IN (
          SELECT id FROM proforma_requests WHERE advocate_id = auth.uid()
        ) OR
        matter_id IN (
          SELECT id FROM matters WHERE advocate_id = auth.uid()
        )
    )
  );

-- ================================================================================
-- FUNCTIONS
-- ================================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_document_extracted_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================================
-- TRIGGERS
-- ================================================================================

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER trigger_update_document_uploads_updated_at
  BEFORE UPDATE ON document_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_document_uploads_updated_at();

CREATE TRIGGER trigger_update_document_extracted_data_updated_at
  BEFORE UPDATE ON document_extracted_data
  FOR EACH ROW
  EXECUTE FUNCTION update_document_extracted_data_updated_at();