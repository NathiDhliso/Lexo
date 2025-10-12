import type { CloudStorageProviderInfo, CloudStorageProvider, OAuthConfig } from '@/types/cloud-storage.types';

export const CLOUD_STORAGE_PROVIDERS: Record<CloudStorageProvider, CloudStorageProviderInfo> = {
  onedrive: {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    icon: '☁️',
    description: 'Store documents in your Microsoft OneDrive account',
    features: [
      'Office 365 integration',
      'Real-time collaboration',
      'Version history',
      '5GB free storage'
    ],
    maxFileSize: 250000, // 250 GB
    supportedFileTypes: ['*'],
    authUrl: '/api/auth/onedrive',
    isAvailable: true
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📁',
    description: 'Store documents in your Google Drive account',
    features: [
      'Google Workspace integration',
      'Powerful search',
      'Shared drives support',
      '15GB free storage'
    ],
    maxFileSize: 5000000, // 5 TB
    supportedFileTypes: ['*'],
    authUrl: '/api/auth/google-drive',
    isAvailable: true
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    description: 'Store documents in your Dropbox account',
    features: [
      'Smart sync',
      'File recovery',
      'Paper integration',
      '2GB free storage'
    ],
    maxFileSize: 50000, // 50 GB for free, 2TB for paid
    supportedFileTypes: ['*'],
    authUrl: '/api/auth/dropbox',
    isAvailable: true
  },
  icloud: {
    id: 'icloud',
    name: 'iCloud Drive',
    icon: '☁️',
    description: 'Store documents in your iCloud Drive',
    features: [
      'Apple ecosystem integration',
      'Automatic backup',
      'Cross-device sync',
      '5GB free storage'
    ],
    maxFileSize: 50000, // 50 GB
    supportedFileTypes: ['*'],
    authUrl: '/api/auth/icloud',
    isAvailable: false // iCloud has limited API access
  },
  box: {
    id: 'box',
    name: 'Box',
    icon: '📦',
    description: 'Store documents in your Box account',
    features: [
      'Enterprise security',
      'Advanced permissions',
      'Workflow automation',
      '10GB free storage'
    ],
    maxFileSize: 250000, // 250 GB for enterprise
    supportedFileTypes: ['*'],
    authUrl: '/api/auth/box',
    isAvailable: true
  }
};

export const DEFAULT_PROVIDER: CloudStorageProvider = 'google_drive';

export const OAUTH_REDIRECT_URI = `${window.location.origin}/settings/cloud-storage/callback`;

// OAuth configuration (these should be in environment variables)
export const OAUTH_CONFIG: Record<CloudStorageProvider, OAuthConfig> = {
  onedrive: {
    clientId: import.meta.env.VITE_ONEDRIVE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_ONEDRIVE_CLIENT_SECRET || '',
    authority: import.meta.env.VITE_ONEDRIVE_AUTHORITY || 'https://login.microsoftonline.com/common',
    scopes: ['Files.ReadWrite', 'Files.ReadWrite.All', 'User.Read', 'offline_access'],
    authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  google_drive: {
    clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_SECRET || '',
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'],
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
  },
  dropbox: {
    clientId: import.meta.env.VITE_DROPBOX_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_DROPBOX_CLIENT_SECRET || '',
    scopes: ['files.content.write', 'files.content.read', 'account_info.read'],
    authEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token'
  },
  icloud: {
    clientId: import.meta.env.VITE_ICLOUD_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_ICLOUD_CLIENT_SECRET || '',
    scopes: ['cloudkit'],
    authEndpoint: '',
    tokenEndpoint: ''
  },
  box: {
    clientId: import.meta.env.VITE_BOX_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_BOX_CLIENT_SECRET || '',
    scopes: ['root_readwrite'],
    authEndpoint: 'https://account.box.com/api/oauth2/authorize',
    tokenEndpoint: 'https://api.box.com/oauth2/token'
  }
};
