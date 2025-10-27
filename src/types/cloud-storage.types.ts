// Cloud Storage Provider Types

export type CloudStorageProvider = 'onedrive' | 'google_drive' | 'dropbox' | 'icloud' | 'box';

export type SyncStatus = 'active' | 'error' | 'disconnected' | 'syncing';

export type SyncType = 'upload' | 'download' | 'delete' | 'update' | 'full_sync';

export interface CloudStorageConnection {
  id: string;
  advocateId: string;
  provider: CloudStorageProvider;
  providerAccountId: string;
  providerAccountEmail?: string;
  providerAccountName?: string;
  rootFolderId?: string;
  rootFolderPath: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isActive: boolean;
  isPrimary: boolean;
  lastSyncAt?: string;
  syncStatus: SyncStatus;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudStorageSyncLog {
  id: string;
  connectionId: string;
  syncType: SyncType;
  localDocumentId?: string;
  providerFileId?: string;
  providerFilePath?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  fileSizeBytes?: number;
  syncDurationMs?: number;
  startedAt: string;
  completedAt?: string;
}

export interface DocumentReference {
  id: string;
  matterId: string;
  
  // File metadata (not the file itself)
  fileName: string;
  fileType?: string;
  documentType?: 'brief' | 'motion' | 'affidavit' | 'correspondence' | 'contract' | 'other';
  notes?: string;
  
  // Storage location (advocate's choice)
  storageType: 'local' | CloudStorageProvider;
  
  // Reference to file (NOT the file contents)
  localPath?: string;              // For desktop app: "C:/Documents/Briefs/Smith.pdf"
  cloudFileId?: string;            // For cloud: Google Drive file ID
  cloudFileUrl?: string;           // For cloud: Shareable link
  
  // Verification status
  lastVerifiedAt?: string;
  fileStatus: 'available' | 'missing' | 'access_denied';
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CloudStorageProviderInfo {
  id: CloudStorageProvider;
  name: string;
  icon: string;
  description: string;
  features: string[];
  maxFileSize: number; // in MB
  supportedFileTypes: string[];
  authUrl: string;
  isAvailable: boolean;
}

export interface CloudStorageLinkOptions {
  matterId: string;
  fileName: string;
  storageType: 'local' | CloudStorageProvider;
  fileReference: string; // Drive file ID, OneDrive item ID, or local file path
  fileUrl?: string; // Shareable link for cloud files
}

export interface CloudStorageDownloadOptions {
  documentId: string;
  providerFileId: string;
}

export interface CloudStorageAuthResponse {
  provider: CloudStorageProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  accountId: string;
  accountEmail?: string;
  accountName?: string;
}

export interface CloudStorageQuota {
  used: number; // in bytes
  total: number; // in bytes
  percentage: number;
}

export interface CloudStorageVerificationResult {
  success: boolean;
  filesVerified: number;
  filesAvailable: number;
  filesMissing: number;
  filesAccessDenied: number;
  errors: string[];
  duration: number; // in ms
}

export interface CloudStorageFileInfo {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedDate?: Date;
  path: string;
  mimeType?: string;
  webViewUrl?: string;
  downloadUrl?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authority?: string; // For Microsoft/Azure AD
  scopes: string[];
  authEndpoint: string;
  tokenEndpoint: string;
}
