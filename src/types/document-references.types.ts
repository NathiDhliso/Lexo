// ============================================================================
// DOCUMENT REFERENCES TYPES
// Privacy-first document linking system types
// ============================================================================

export interface DocumentReference {
  id: string;
  user_id: string;
  matter_id?: string;

  // File identification
  file_name: string;
  file_extension?: string;
  file_size_bytes?: number;
  mime_type?: string;

  // Storage location
  storage_provider: 'google_drive' | 'onedrive' | 'dropbox' | 'icloud' | 'box' | 'local';
  provider_file_id: string;
  provider_file_path: string;
  provider_web_url?: string;
  provider_download_url?: string;

  // Local file path (for local storage)
  local_file_path?: string;

  // File verification
  file_hash?: string;
  last_verified_at?: string;
  verification_status: 'available' | 'missing' | 'access_denied' | 'unknown';
  verification_error?: string;

  // Categorization
  document_type: 'contract' | 'correspondence' | 'evidence' | 'pleading' | 'research' | 'general';
  tags: string[];
  description?: string;

  // Privacy and security
  is_confidential: boolean;
  access_level: 'private' | 'firm' | 'matter_team';

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface DocumentAccessLog {
  id: string;
  document_reference_id: string;

  // Access details
  accessed_by: string;
  access_type: 'view' | 'download' | 'verify' | 'link' | 'unlink';
  access_method: 'web' | 'api' | 'desktop_app';

  // Context
  matter_id?: string;
  user_agent?: string;
  ip_address?: string;

  // Result
  success: boolean;
  error_message?: string;

  // Timestamp
  accessed_at: string;

  // Joined data
  accessed_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface MatterDocumentLink {
  id: string;
  matter_id: string;
  document_reference_id: string;

  // Link metadata
  linked_by: string;
  link_reason?: string;
  is_primary: boolean;

  // Timestamp
  linked_at: string;
}

export interface DocumentSharing {
  id: string;
  document_reference_id: string;

  // Sharing details
  shared_with: string;
  shared_by: string;

  // Permissions
  permission_level: 'view' | 'comment' | 'edit';
  can_reshare: boolean;

  // Expiry
  expires_at?: string;

  // Status
  is_active: boolean;

  // Timestamp
  shared_at: string;
}

// ============================================================================
// EXTENDED TYPES FOR UI COMPONENTS
// ============================================================================

export interface DocumentReferenceWithMatter extends DocumentReference {
  matter?: {
    id: string;
    title: string;
    matter_number: string;
  };
  link_info?: {
    linked_at: string;
    is_primary: boolean;
    link_reason?: string;
  };
}

export interface MatterDocumentSummary {
  document_id: string;
  file_name: string;
  document_type: string;
  storage_provider: string;
  verification_status: string;
  linked_at: string;
  is_primary: boolean;
}

export interface DocumentStatistics {
  totalDocuments: number;
  availableDocuments: number;
  missingDocuments: number;
  accessDeniedDocuments: number;
  confidentialDocuments: number;
  storageProvidersUsed: number;
  mattersWithDocuments: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateDocumentReferenceForm {
  fileName: string;
  fileExtension?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  storageProvider: 'google_drive' | 'onedrive' | 'dropbox' | 'icloud' | 'box' | 'local';
  providerFileId: string;
  providerFilePath: string;
  providerWebUrl?: string;
  providerDownloadUrl?: string;
  localFilePath?: string;
  documentType?: 'contract' | 'correspondence' | 'evidence' | 'pleading' | 'research' | 'general';
  tags?: string[];
  description?: string;
  isConfidential?: boolean;
  accessLevel?: 'private' | 'firm' | 'matter_team';
  matterId?: string;
}

export interface LinkDocumentToMatterForm {
  matterId: string;
  documentReferenceId: string;
  linkReason?: string;
  isPrimary?: boolean;
}

export interface ShareDocumentForm {
  documentReferenceId: string;
  sharedWith: string;
  permissionLevel: 'view' | 'comment' | 'edit';
  canReshare?: boolean;
  expiresAt?: Date;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface DocumentReferenceFilters {
  matterId?: string;
  storageProvider?: string;
  documentType?: string;
  verificationStatus?: string;
  tags?: string[];
  isConfidential?: boolean;
  accessLevel?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// CLOUD STORAGE INTEGRATION TYPES
// ============================================================================

export interface CloudStorageFile {
  id: string;
  name: string;
  path: string;
  size?: number;
  mimeType?: string;
  webUrl?: string;
  downloadUrl?: string;
  modifiedTime?: string;
  isFolder: boolean;
  parentId?: string;
}

export interface CloudStorageProvider {
  id: 'google_drive' | 'onedrive' | 'dropbox' | 'icloud' | 'box' | 'local';
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  connectionStatus?: 'connected' | 'expired' | 'error' | 'disconnected';
}

// ============================================================================
// VERIFICATION TYPES
// ============================================================================

export interface DocumentVerificationResult {
  documentId: string;
  isAvailable: boolean;
  lastChecked: string;
  error?: string;
  fileInfo?: {
    size: number;
    modifiedTime: string;
    hash?: string;
  };
}

export interface BulkVerificationResult {
  [documentId: string]: DocumentVerificationResult;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  DocumentReference,
  DocumentAccessLog,
  MatterDocumentLink,
  DocumentSharing,
  DocumentReferenceWithMatter,
  MatterDocumentSummary,
  DocumentStatistics,
  CreateDocumentReferenceForm,
  LinkDocumentToMatterForm,
  ShareDocumentForm,
  DocumentReferenceFilters,
  CloudStorageFile,
  CloudStorageProvider,
  DocumentVerificationResult,
  BulkVerificationResult
};