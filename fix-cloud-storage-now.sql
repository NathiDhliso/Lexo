-- ============================================================================
-- QUICK FIX: Cloud Storage Tables
-- Run this in your Supabase SQL Editor if tables don't exist
-- ============================================================================

-- Check if tables exist first
DO $$ 
BEGIN
    -- Create cloud_storage_connections if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cloud_storage_connections') THEN
        CREATE TABLE cloud_storage_connections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          advocate_id UUID NOT NULL REFERENCES advocates(id) ON DELETE CASCADE,
          
          -- Provider information
          provider TEXT NOT NULL CHECK (provider IN ('onedrive', 'google_drive', 'dropbox', 'icloud', 'box')),
          provider_account_id TEXT NOT NULL,
          provider_account_email TEXT,
          provider_account_name TEXT,
          
          -- OAuth tokens (encrypted)
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          token_expires_at TIMESTAMPTZ,
          
          -- Storage configuration
          root_folder_id TEXT,
          root_folder_path TEXT DEFAULT '/AdvocateHub',
          
          -- Status
          is_active BOOLEAN DEFAULT true,
          is_primary BOOLEAN DEFAULT false,
          last_sync_at TIMESTAMPTZ,
          sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'disconnected', 'syncing')),
          sync_error TEXT,
          
          -- Metadata
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created cloud_storage_connections table';
    END IF;

    -- Create cloud_storage_sync_log if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cloud_storage_sync_log') THEN
        CREATE TABLE cloud_storage_sync_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          connection_id UUID NOT NULL REFERENCES cloud_storage_connections(id) ON DELETE CASCADE,
          
          sync_type TEXT NOT NULL CHECK (sync_type IN ('upload', 'download', 'delete', 'update', 'full_sync')),
          local_document_id UUID REFERENCES document_uploads(id) ON DELETE SET NULL,
          provider_file_id TEXT,
          provider_file_path TEXT,
          
          status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
          error_message TEXT,
          
          file_size_bytes BIGINT,
          sync_duration_ms INTEGER,
          
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ
        );
        
        RAISE NOTICE 'Created cloud_storage_sync_log table';
    END IF;

    -- Create document_cloud_storage if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_cloud_storage') THEN
        CREATE TABLE document_cloud_storage (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          document_upload_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
          connection_id UUID NOT NULL REFERENCES cloud_storage_connections(id) ON DELETE CASCADE,
          
          provider_file_id TEXT NOT NULL,
          provider_file_path TEXT NOT NULL,
          provider_web_url TEXT,
          provider_download_url TEXT,
          
          is_synced BOOLEAN DEFAULT true,
          last_synced_at TIMESTAMPTZ DEFAULT NOW(),
          local_hash TEXT,
          provider_hash TEXT,
          
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          UNIQUE(document_upload_id, connection_id)
        );
        
        RAISE NOTICE 'Created document_cloud_storage table';
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cloud_storage_connections_advocate_id ON cloud_storage_connections(advocate_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_connections_provider ON cloud_storage_connections(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_connections_is_active ON cloud_storage_connections(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cloud_storage_connections_unique_primary ON cloud_storage_connections(advocate_id) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_cloud_storage_sync_log_connection_id ON cloud_storage_sync_log(connection_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_sync_log_status ON cloud_storage_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_sync_log_started_at ON cloud_storage_sync_log(started_at);

CREATE INDEX IF NOT EXISTS idx_document_cloud_storage_document_id ON document_cloud_storage(document_upload_id);
CREATE INDEX IF NOT EXISTS idx_document_cloud_storage_connection_id ON document_cloud_storage(connection_id);
CREATE INDEX IF NOT EXISTS idx_document_cloud_storage_provider_file_id ON document_cloud_storage(provider_file_id);

-- Enable RLS
ALTER TABLE cloud_storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_cloud_storage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can delete their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can view their own sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "System can insert sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "Users can view their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can insert document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can update their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can delete their document cloud storage mappings" ON document_cloud_storage;

-- Create policies
CREATE POLICY "Users can view their own cloud storage connections" ON cloud_storage_connections
  FOR SELECT USING (advocate_id = auth.uid());

CREATE POLICY "Users can insert their own cloud storage connections" ON cloud_storage_connections
  FOR INSERT WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own cloud storage connections" ON cloud_storage_connections
  FOR UPDATE USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own cloud storage connections" ON cloud_storage_connections
  FOR DELETE USING (advocate_id = auth.uid());

CREATE POLICY "Users can view their own sync logs" ON cloud_storage_sync_log
  FOR SELECT USING (
    connection_id IN (
      SELECT id FROM cloud_storage_connections WHERE advocate_id = auth.uid()
    )
  );

CREATE POLICY "System can insert sync logs" ON cloud_storage_sync_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their document cloud storage mappings" ON document_cloud_storage
  FOR SELECT USING (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert document cloud storage mappings" ON document_cloud_storage
  FOR INSERT WITH CHECK (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their document cloud storage mappings" ON document_cloud_storage
  FOR UPDATE USING (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their document cloud storage mappings" ON document_cloud_storage
  FOR DELETE USING (
    document_upload_id IN (
      SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION update_cloud_storage_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_document_cloud_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_single_primary_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE cloud_storage_connections
    SET is_primary = false
    WHERE advocate_id = NEW.advocate_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_cloud_storage_connections_updated_at ON cloud_storage_connections;
DROP TRIGGER IF EXISTS trigger_update_document_cloud_storage_updated_at ON document_cloud_storage;
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_provider ON cloud_storage_connections;

-- Create triggers
CREATE TRIGGER trigger_update_cloud_storage_connections_updated_at
  BEFORE UPDATE ON cloud_storage_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_cloud_storage_connections_updated_at();

CREATE TRIGGER trigger_update_document_cloud_storage_updated_at
  BEFORE UPDATE ON document_cloud_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_document_cloud_storage_updated_at();

CREATE TRIGGER trigger_ensure_single_primary_provider
  BEFORE INSERT OR UPDATE ON cloud_storage_connections
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_provider();

-- Verify tables were created
SELECT 
    'cloud_storage_connections' as table_name,
    COUNT(*) as row_count
FROM cloud_storage_connections
UNION ALL
SELECT 
    'cloud_storage_sync_log' as table_name,
    COUNT(*) as row_count
FROM cloud_storage_sync_log
UNION ALL
SELECT 
    'document_cloud_storage' as table_name,
    COUNT(*) as row_count
FROM document_cloud_storage;
