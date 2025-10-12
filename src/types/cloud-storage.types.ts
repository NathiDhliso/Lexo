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

export interface DocumentCloudStorage {
  id: string;
  documentUploadId: string;
  connectionId: string;
  providerFileId: string;
  providerFilePath: string;
  providerWebUrl?: string;
  providerDownloadUrl?: string;
  isSynced: boolean;
  lastSyncedAt: string;
  localHash?: string;
  providerHash?: string;
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

export interface CloudStorageUploadOptions {
  file: File;
  matterId?: string;
  folderId?: string;
  onProgress?: (progress: number) => void;
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

export interface CloudStorageSyncResult {
  success: boolean;
  filesUploaded: number;
  filesDownloaded: number;
  filesFailed: number;
  errors: string[];
  duration: number; // in ms
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authority?: string; // For Microsoft/Azure AD
  scopes: string[];
  authEndpoint: string;
  tokenEndpoint: string;
}
