-- ============================================================================
-- PRIVACY-FIRST DOCUMENT LINKING SYSTEM
-- Stores references to documents in user's cloud storage (not the files themselves)
-- ============================================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Document references table - stores links to files, not the files themselves
CREATE TABLE IF NOT EXISTS document_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE, -- Optional: can be unlinked from matters
  
  -- File identification
  file_name TEXT NOT NULL,
  file_extension TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  
  -- Storage location
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('google_drive', 'onedrive', 'dropbox', 'icloud', 'box', 'local')),
  provider_file_id TEXT NOT NULL, -- Unique ID in the provider system
  provider_file_path TEXT NOT NULL, -- Full path in provider
  provider_web_url TEXT, -- Direct link to view in provider
  provider_download_url TEXT, -- Direct download link (if available)
  
  -- Local file path (for local storage)
  local_file_path TEXT, -- Only used when storage_provider = 'local'
  
  -- File verification
  file_hash TEXT, -- For detecting changes
  last_verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'unknown' CHECK (verification_status IN ('available', 'missing', 'access_denied', 'unknown')),
  verification_error TEXT,
  
  -- Categorization
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('contract', 'correspondence', 'evidence', 'pleading', 'research', 'general')),
  tags TEXT[], -- Array of tags for organization
  description TEXT,
  
  -- Privacy and security
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'firm', 'matter_team')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique reference per provider file
  UNIQUE(advocate_id, storage_provider, provider_file_id)
);

-- Document access log - track when documents are accessed
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_reference_id UUID NOT NULL REFERENCES document_references(id) ON DELETE CASCADE,
  
  -- Access details
  accessed_by UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'verify', 'link', 'unlink')),
  access_method TEXT DEFAULT 'web' CHECK (access_method IN ('web', 'api', 'desktop_app')),
  
  -- Context
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address INET,
  
  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamp
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matter document links - many-to-many relationship between matters and documents
CREATE TABLE IF NOT EXISTS matter_document_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  document_reference_id UUID NOT NULL REFERENCES document_references(id) ON DELETE CASCADE,
  
  -- Link metadata
  linked_by UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  link_reason TEXT, -- Why this document is linked to this matter
  is_primary BOOLEAN DEFAULT false, -- Is this a primary document for the matter?
  
  -- Timestamps
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique link per matter-document pair
  UNIQUE(matter_id, document_reference_id)
);

-- Document sharing - track who has access to which documents
CREATE TABLE IF NOT EXISTS document_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_reference_id UUID NOT NULL REFERENCES document_references(id) ON DELETE CASCADE,
  
  -- Sharing details
  shared_with UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
  
  -- Permissions
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'comment', 'edit')),
  can_reshare BOOLEAN DEFAULT false,
  
  -- Expiry
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique sharing per document-user pair
  UNIQUE(document_reference_id, shared_with)
);

-- ================================================================================
-- INDEXES
-- ================================================================================

-- Document references indexes
CREATE INDEX IF NOT EXISTS idx_document_references_advocate_id ON document_references(advocate_id);
CREATE INDEX IF NOT EXISTS idx_document_references_matter_id ON document_references(matter_id);
CREATE INDEX IF NOT EXISTS idx_document_references_storage_provider ON document_references(storage_provider);
CREATE INDEX IF NOT EXISTS idx_document_references_document_type ON document_references(document_type);
CREATE INDEX IF NOT EXISTS idx_document_references_verification_status ON document_references(verification_status);
CREATE INDEX IF NOT EXISTS idx_document_references_created_at ON document_references(created_at);
CREATE INDEX IF NOT EXISTS idx_document_references_tags ON document_references USING GIN(tags);

-- Document access log indexes
CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON document_access_log(document_reference_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_accessed_by ON document_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_document_access_log_matter_id ON document_access_log(matter_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_accessed_at ON document_access_log(accessed_at);

-- Matter document links indexes
CREATE INDEX IF NOT EXISTS idx_matter_document_links_matter_id ON matter_document_links(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_document_links_document_id ON matter_document_links(document_reference_id);
CREATE INDEX IF NOT EXISTS idx_matter_document_links_linked_by ON matter_document_links(linked_by);

-- Document sharing indexes
CREATE INDEX IF NOT EXISTS idx_document_sharing_document_id ON document_sharing(document_reference_id);
CREATE INDEX IF NOT EXISTS idx_document_sharing_shared_with ON document_sharing(shared_with);
CREATE INDEX IF NOT EXISTS idx_document_sharing_shared_by ON document_sharing(shared_by);
CREATE INDEX IF NOT EXISTS idx_document_sharing_is_active ON document_sharing(is_active);

-- ================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================================

ALTER TABLE document_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sharing ENABLE ROW LEVEL SECURITY;

-- Document references policies
CREATE POLICY "Users can view their own document references" ON document_references
  FOR SELECT USING (
    advocate_id = auth.uid() OR
    id IN (
      SELECT document_reference_id FROM document_sharing 
      WHERE shared_with = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own document references" ON document_references
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own document references" ON document_references
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own document references" ON document_references
  FOR DELETE USING (advocate_id = auth.uid());

-- Document access log policies
CREATE POLICY "Users can view access logs for their documents" ON document_access_log
  FOR SELECT USING (
    document_reference_id IN (
      SELECT id FROM document_references WHERE advocate_id = auth.uid()
    ) OR
    accessed_by = auth.uid()
  );

CREATE POLICY "System can insert access logs" ON document_access_log
  FOR INSERT WITH CHECK (true);

-- Matter document links policies
CREATE POLICY "Users can view document links for their matters" ON matter_document_links
  FOR SELECT USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    ) OR
    document_reference_id IN (
      SELECT id FROM document_references WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can link documents to their matters" ON matter_document_links
  FOR INSERT WITH CHECK (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    ) AND
    document_reference_id IN (
      SELECT id FROM document_references WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their matter document links" ON matter_document_links
  FOR UPDATE USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their matter document links" ON matter_document_links
  FOR DELETE USING (
    matter_id IN (
      SELECT id FROM matters WHERE advocate_id = auth.uid()
    )
  );

-- Document sharing policies
CREATE POLICY "Users can view sharing for their documents" ON document_sharing
  FOR SELECT USING (
    document_reference_id IN (
      SELECT id FROM document_references WHERE advocate_id = auth.uid()
    ) OR
    shared_with = auth.uid() OR
    shared_by = auth.uid()
  );

CREATE POLICY "Users can share their own documents" ON document_sharing
  FOR INSERT WITH CHECK (
    document_reference_id IN (
      SELECT id FROM document_references WHERE advocate_id = auth.uid()
    ) AND
    shared_by = auth.uid()
  );

CREATE POLICY "Users can update sharing they created" ON document_sharing
  FOR UPDATE USING (shared_by = auth.uid());

CREATE POLICY "Users can delete sharing they created" ON document_sharing
  FOR DELETE USING (shared_by = auth.uid());

-- ================================================================================
-- FUNCTIONS
-- ================================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_document_references_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log document access
CREATE OR REPLACE FUNCTION log_document_access(
  p_document_reference_id UUID,
  p_accessed_by UUID,
  p_access_type TEXT,
  p_matter_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO document_access_log (
    document_reference_id,
    accessed_by,
    access_type,
    matter_id,
    success,
    error_message
  ) VALUES (
    p_document_reference_id,
    p_accessed_by,
    p_access_type,
    p_matter_id,
    p_success,
    p_error_message
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get documents for matter
CREATE OR REPLACE FUNCTION get_matter_documents(p_matter_id UUID)
RETURNS TABLE (
  document_id UUID,
  file_name TEXT,
  document_type TEXT,
  storage_provider TEXT,
  verification_status TEXT,
  linked_at TIMESTAMPTZ,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id,
    dr.file_name,
    dr.document_type,
    dr.storage_provider,
    dr.verification_status,
    mdl.linked_at,
    mdl.is_primary
  FROM document_references dr
  JOIN matter_document_links mdl ON dr.id = mdl.document_reference_id
  WHERE mdl.matter_id = p_matter_id
  ORDER BY mdl.is_primary DESC, mdl.linked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify document availability
CREATE OR REPLACE FUNCTION verify_document_availability(p_document_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  doc_record document_references%ROWTYPE;
  is_available BOOLEAN := false;
BEGIN
  SELECT * INTO doc_record FROM document_references WHERE id = p_document_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- For now, we'll mark as verified (actual verification would be done by external service)
  -- In production, this would call the appropriate cloud storage API
  is_available := true;
  
  UPDATE document_references 
  SET 
    last_verified_at = NOW(),
    verification_status = CASE WHEN is_available THEN 'available' ELSE 'missing' END
  WHERE id = p_document_id;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================================
-- TRIGGERS
-- ================================================================================

CREATE TRIGGER trigger_update_document_references_updated_at
  BEFORE UPDATE ON document_references
  FOR EACH ROW
  EXECUTE FUNCTION update_document_references_updated_at();

-- ================================================================================
-- VIEWS
-- ================================================================================

-- View for document statistics
CREATE OR REPLACE VIEW document_statistics AS
SELECT 
  advocate_id,
  COUNT(*) as total_documents,
  COUNT(*) FILTER (WHERE verification_status = 'available') as available_documents,
  COUNT(*) FILTER (WHERE verification_status = 'missing') as missing_documents,
  COUNT(*) FILTER (WHERE verification_status = 'access_denied') as access_denied_documents,
  COUNT(*) FILTER (WHERE is_confidential = true) as confidential_documents,
  COUNT(DISTINCT storage_provider) as storage_providers_used,
  COUNT(DISTINCT matter_id) FILTER (WHERE matter_id IS NOT NULL) as matters_with_documents
FROM document_references
GROUP BY advocate_id;

-- ================================================================================
-- COMMENTS
-- ================================================================================

COMMENT ON TABLE document_references IS 'Stores references to documents in user cloud storage (privacy-first approach)';
COMMENT ON TABLE document_access_log IS 'Audit trail for document access and operations';
COMMENT ON TABLE matter_document_links IS 'Links documents to matters (many-to-many relationship)';
COMMENT ON TABLE document_sharing IS 'Manages document sharing permissions between users';

COMMENT ON COLUMN document_references.provider_file_id IS 'Unique identifier in the cloud storage provider system';
COMMENT ON COLUMN document_references.local_file_path IS 'Only used for local storage provider';
COMMENT ON COLUMN document_references.verification_status IS 'Last known availability status of the file';
COMMENT ON COLUMN document_references.access_level IS 'Who can access this document reference';
