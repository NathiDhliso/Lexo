-- ============================================================================
-- MATTER SEARCH & ARCHIVING SYSTEM
-- Full-text search, filtering, and archiving for matters
-- ============================================================================

-- Add search and archive columns to matters table
ALTER TABLE matters ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL;
ALTER TABLE matters ADD COLUMN IF NOT EXISTS archive_reason TEXT;

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_matters_search ON matters USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_matters_archived ON matters(is_archived);
CREATE INDEX IF NOT EXISTS idx_matters_archived_at ON matters(archived_at DESC);

-- Create trigger function to update search vector
CREATE OR REPLACE FUNCTION update_matter_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.client_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.instructing_attorney, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.instructing_firm, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.matter_type, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.court_case_number, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
DROP TRIGGER IF EXISTS matter_search_vector_update ON matters;
CREATE TRIGGER matter_search_vector_update
  BEFORE INSERT OR UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION update_matter_search_vector();

-- Backfill search vectors for existing matters
UPDATE matters SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(client_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(instructing_attorney, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(instructing_firm, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(matter_type, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(court_case_number, '')), 'D')
WHERE search_vector IS NULL;

-- Create comprehensive matter search function
CREATE OR REPLACE FUNCTION search_matters(
  p_advocate_id UUID,
  p_search_query TEXT DEFAULT NULL,
  p_include_archived BOOLEAN DEFAULT false,
  p_practice_area TEXT DEFAULT NULL,
  p_matter_type TEXT DEFAULT NULL,
  p_status TEXT[] DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_attorney_firm TEXT DEFAULT NULL,
  p_fee_min DECIMAL DEFAULT NULL,
  p_fee_max DECIMAL DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  reference_number TEXT,
  title TEXT,
  client_name TEXT,
  instructing_attorney TEXT,
  instructing_firm TEXT,
  matter_type TEXT,
  status matter_status,
  wip_value DECIMAL,
  estimated_fee DECIMAL,
  expected_completion_date DATE,
  created_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  archived_at TIMESTAMPTZ,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.reference_number,
    m.title,
    m.client_name,
    m.instructing_attorney,
    m.instructing_firm,
    m.matter_type,
    m.status,
    m.wip_value,
    m.estimated_fee,
    m.expected_completion_date,
    m.created_at,
    m.is_archived,
    m.archived_at,
    CASE 
      WHEN p_search_query IS NOT NULL THEN 
        ts_rank(m.search_vector, plainto_tsquery('english', p_search_query))
      ELSE 0
    END as search_rank
  FROM matters m
  WHERE m.advocate_id = p_advocate_id
    AND (p_include_archived OR m.is_archived = false)
    AND (p_search_query IS NULL OR m.search_vector @@ plainto_tsquery('english', p_search_query))
    AND (p_practice_area IS NULL OR m.matter_type = p_practice_area)
    AND (p_matter_type IS NULL OR m.matter_type = p_matter_type)
    AND (p_status IS NULL OR m.status::TEXT = ANY(p_status))
    AND (p_date_from IS NULL OR m.created_at::DATE >= p_date_from)
    AND (p_date_to IS NULL OR m.created_at::DATE <= p_date_to)
    AND (p_attorney_firm IS NULL OR m.instructing_firm ILIKE '%' || p_attorney_firm || '%')
    AND (p_fee_min IS NULL OR m.estimated_fee >= p_fee_min)
    AND (p_fee_max IS NULL OR m.estimated_fee <= p_fee_max)
  ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN m.created_at END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN m.created_at END ASC,
    CASE WHEN p_sort_by = 'deadline' AND p_sort_order = 'desc' THEN m.expected_completion_date END DESC,
    CASE WHEN p_sort_by = 'deadline' AND p_sort_order = 'asc' THEN m.expected_completion_date END ASC,
    CASE WHEN p_sort_by = 'total_fee' AND p_sort_order = 'desc' THEN m.estimated_fee END DESC,
    CASE WHEN p_sort_by = 'total_fee' AND p_sort_order = 'asc' THEN m.estimated_fee END ASC,
    CASE WHEN p_sort_by = 'wip' AND p_sort_order = 'desc' THEN m.wip_value END DESC,
    CASE WHEN p_sort_by = 'wip' AND p_sort_order = 'asc' THEN m.wip_value END ASC,
    CASE WHEN p_search_query IS NOT NULL THEN search_rank END DESC,
    m.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get search result count
CREATE OR REPLACE FUNCTION count_search_matters(
  p_advocate_id UUID,
  p_search_query TEXT DEFAULT NULL,
  p_include_archived BOOLEAN DEFAULT false,
  p_practice_area TEXT DEFAULT NULL,
  p_matter_type TEXT DEFAULT NULL,
  p_status TEXT[] DEFAULT NULL,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_attorney_firm TEXT DEFAULT NULL,
  p_fee_min DECIMAL DEFAULT NULL,
  p_fee_max DECIMAL DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO result_count
  FROM matters m
  WHERE m.advocate_id = p_advocate_id
    AND (p_include_archived OR m.is_archived = false)
    AND (p_search_query IS NULL OR m.search_vector @@ plainto_tsquery('english', p_search_query))
    AND (p_practice_area IS NULL OR m.matter_type = p_practice_area)
    AND (p_matter_type IS NULL OR m.matter_type = p_matter_type)
    AND (p_status IS NULL OR m.status::TEXT = ANY(p_status))
    AND (p_date_from IS NULL OR m.created_at::DATE >= p_date_from)
    AND (p_date_to IS NULL OR m.created_at::DATE <= p_date_to)
    AND (p_attorney_firm IS NULL OR m.instructing_firm ILIKE '%' || p_attorney_firm || '%')
    AND (p_fee_min IS NULL OR m.estimated_fee >= p_fee_min)
    AND (p_fee_max IS NULL OR m.estimated_fee <= p_fee_max);
  
  RETURN result_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to archive a matter
CREATE OR REPLACE FUNCTION archive_matter(
  p_matter_id UUID,
  p_advocate_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE matters
  SET 
    is_archived = true,
    archived_at = NOW(),
    archived_by = p_advocate_id,
    archive_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_matter_id
    AND advocate_id = p_advocate_id
    AND is_archived = false;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to unarchive a matter
CREATE OR REPLACE FUNCTION unarchive_matter(
  p_matter_id UUID,
  p_advocate_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE matters
  SET 
    is_archived = false,
    archived_at = NULL,
    archived_by = NULL,
    archive_reason = NULL,
    updated_at = NOW()
  WHERE id = p_matter_id
    AND advocate_id = p_advocate_id
    AND is_archived = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get archived matters
CREATE OR REPLACE FUNCTION get_archived_matters(
  p_advocate_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  reference_number TEXT,
  title TEXT,
  client_name TEXT,
  instructing_firm TEXT,
  matter_type TEXT,
  status matter_status,
  archived_at TIMESTAMPTZ,
  archive_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.reference_number,
    m.title,
    m.client_name,
    m.instructing_firm,
    m.matter_type,
    m.status,
    m.archived_at,
    m.archive_reason
  FROM matters m
  WHERE m.advocate_id = p_advocate_id
    AND m.is_archived = true
  ORDER BY m.archived_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments for documentation
COMMENT ON COLUMN matters.search_vector IS 'Full-text search vector for matter search';
COMMENT ON COLUMN matters.is_archived IS 'Whether the matter is archived';
COMMENT ON COLUMN matters.archived_at IS 'Timestamp when matter was archived';
COMMENT ON COLUMN matters.archived_by IS 'User who archived the matter';
COMMENT ON COLUMN matters.archive_reason IS 'Reason for archiving the matter';

COMMENT ON FUNCTION search_matters IS 'Comprehensive matter search with full-text search and filtering';
COMMENT ON FUNCTION count_search_matters IS 'Count total results for matter search (for pagination)';
COMMENT ON FUNCTION archive_matter IS 'Archive a matter with audit trail';
COMMENT ON FUNCTION unarchive_matter IS 'Unarchive a matter';
COMMENT ON FUNCTION get_archived_matters IS 'Get all archived matters for an advocate';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
