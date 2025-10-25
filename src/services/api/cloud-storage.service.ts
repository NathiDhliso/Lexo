import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type {
  CloudStorageConnection,
  CloudStorageProvider,
  CloudStorageAuthResponse,
  CloudStorageUploadOptions,
  CloudStorageSyncResult,
  CloudStorageQuota,
  DocumentCloudStorage
} from '@/types/cloud-storage.types';
import { OAUTH_CONFIG, OAUTH_REDIRECT_URI } from '@/config/cloud-storage-providers.config';

export class CloudStorageService {
  // Get all cloud storage connections for current user
  static async getConnections(): Promise<CloudStorageConnection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('advocate_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapConnection);
    } catch (error) {
      console.error('Error fetching cloud storage connections:', error);
      // Don't show toast error - permissions might not be set up yet
      throw error;
    }
  }

  // Get primary cloud storage connection
  static async getPrimaryConnection(): Promise<CloudStorageConnection | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cloud_storage_connections')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No primary connection
        throw error;
      }

      return this.mapConnection(data);
    } catch (error) {
      console.error('Error fetching primary connection:', error);
      return null;
    }
  }

  // Initiate OAuth flow for a provider
  static initiateOAuth(provider: CloudStorageProvider): void {
    const config = OAUTH_CONFIG[provider];
    if (!config.clientId) {
      toast.error(`${provider} is not configured. Please contact support.`);
      return;
    }

    const state = btoa(JSON.stringify({
      provider,
      timestamp: Date.now(),
      redirectUrl: window.location.pathname
    }));

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline', // For refresh tokens
      prompt: 'consent'
    });

    window.location.href = `${config.authEndpoint}?${params.toString()}`;
  }

  // Handle OAuth callback
  static async handleOAuthCallback(
    provider: CloudStorageProvider,
    code: string,
    state: string
  ): Promise<CloudStorageConnection> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Exchange code for tokens
      const authResponse = await this.exchangeCodeForTokens(provider, code);

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('cloud_storage_connections')
        .select('id')
        .eq('advocate_id', user.id)
        .eq('provider', provider)
        .eq('provider_account_id', authResponse.accountId)
        .single();

      let connection;

      if (existing) {
        // Update existing connection
        const { data, error } = await supabase
          .from('cloud_storage_connections')
          .update({
            access_token: authResponse.accessToken,
            refresh_token: authResponse.refreshToken,
            token_expires_at: authResponse.expiresAt,
            provider_account_email: authResponse.accountEmail,
            provider_account_name: authResponse.accountName,
            is_active: true,
            sync_status: 'active',
            sync_error: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        connection = data;
        toast.success(`${provider} connection updated successfully`);
      } else {
        // Create new connection
        const { data, error } = await supabase
          .from('cloud_storage_connections')
          .insert({
            advocate_id: user.id,
            provider,
            provider_account_id: authResponse.accountId,
            provider_account_email: authResponse.accountEmail,
            provider_account_name: authResponse.accountName,
            access_token: authResponse.accessToken,
            refresh_token: authResponse.refreshToken,
            token_expires_at: authResponse.expiresAt,
            is_active: true,
            is_primary: false, // User can set primary later
            sync_status: 'active'
          })
          .select()
          .single();

        if (error) throw error;
        connection = data;
        toast.success(`${provider} connected successfully`);
      }

      return this.mapConnection(connection);
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      const message = error instanceof Error ? error.message : 'Failed to connect cloud storage';
      toast.error(message);
      throw error;
    }
  }

  // Exchange authorization code for access tokens
  private static async exchangeCodeForTokens(
    provider: CloudStorageProvider,
    code: string
  ): Promise<CloudStorageAuthResponse> {
    const config = OAUTH_CONFIG[provider];

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const data = await response.json();

    // Get account info based on provider
    const accountInfo = await this.getAccountInfo(provider, data.access_token);

    return {
      provider,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in 
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
      accountId: accountInfo.id,
      accountEmail: accountInfo.email,
      accountName: accountInfo.name
    };
  }

  // Get account information from provider
  private static async getAccountInfo(
    provider: CloudStorageProvider,
    accessToken: string
  ): Promise<{ id: string; email?: string; name?: string }> {
    let endpoint = '';
    
    switch (provider) {
      case 'google_drive':
        endpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
        break;
      case 'onedrive':
        endpoint = 'https://graph.microsoft.com/v1.0/me';
        break;
      case 'dropbox':
        endpoint = 'https://api.dropboxapi.com/2/users/get_current_account';
        break;
      case 'box':
        endpoint = 'https://api.box.com/2.0/users/me';
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get account info');
    }

    const data = await response.json();

    // Map response based on provider
    switch (provider) {
      case 'google_drive':
        return { id: data.id, email: data.email, name: data.name };
      case 'onedrive':
        return { id: data.id, email: data.userPrincipalName, name: data.displayName };
      case 'dropbox':
        return { id: data.account_id, email: data.email, name: data.name.display_name };
      case 'box':
        return { id: data.id, email: data.login, name: data.name };
      default:
        return { id: data.id };
    }
  }

  // Set primary connection
  static async setPrimaryConnection(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cloud_storage_connections')
        .update({ is_primary: true })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Primary storage provider updated');
    } catch (error) {
      console.error('Error setting primary connection:', error);
      toast.error('Failed to update primary storage provider');
      throw error;
    }
  }

  // Disconnect cloud storage
  static async disconnect(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cloud_storage_connections')
        .update({
          is_active: false,
          sync_status: 'disconnected'
        })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Cloud storage disconnected');
    } catch (error) {
      console.error('Error disconnecting cloud storage:', error);
      toast.error('Failed to disconnect cloud storage');
      throw error;
    }
  }

  // Delete connection
  static async deleteConnection(connectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cloud_storage_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Cloud storage connection deleted');
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
      throw error;
    }
  }

  // Upload file to cloud storage
  static async uploadToCloud(
    options: CloudStorageUploadOptions
  ): Promise<DocumentCloudStorage> {
    try {
      const connection = await this.getPrimaryConnection();
      if (!connection) {
        throw new Error('No cloud storage connected. Please connect a storage provider first.');
      }

      // Upload to provider
      const providerFile = await this.uploadToProvider(
        connection,
        options.file,
        options.folderId,
        options.onProgress
      );

      // Create document upload record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: document, error: docError } = await supabase
        .from('document_uploads')
        .insert({
          matter_id: options.matterId,
          original_filename: options.file.name,
          file_url: providerFile.webUrl,
          file_size_bytes: options.file.size,
          file_type: options.file.type,
          mime_type: options.file.type,
          processing_status: 'completed',
          uploaded_by: user.id
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create cloud storage mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('document_cloud_storage')
        .insert({
          document_upload_id: document.id,
          connection_id: connection.id,
          provider_file_id: providerFile.id,
          provider_file_path: providerFile.path,
          provider_web_url: providerFile.webUrl,
          provider_download_url: providerFile.downloadUrl,
          is_synced: true,
          last_synced_at: new Date().toISOString()
        })
        .select()
        .single();

      if (mappingError) throw mappingError;

      toast.success('File uploaded to cloud storage');
      return this.mapDocumentCloudStorage(mapping);
    } catch (error) {
      console.error('Error uploading to cloud:', error);
      const message = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(message);
      throw error;
    }
  }

  // Upload file to specific provider
  private static async uploadToProvider(
    connection: CloudStorageConnection,
    file: File,
    folderId?: string,
    onProgress?: (progress: number) => void
  ): Promise<{ id: string; path: string; webUrl: string; downloadUrl: string }> {
    // This is a placeholder - actual implementation would use provider-specific APIs
    // For now, return mock data
    onProgress?.(100);
    
    return {
      id: `${connection.provider}_${Date.now()}`,
      path: `${connection.rootFolderPath}/${file.name}`,
      webUrl: `https://${connection.provider}.com/view/${file.name}`,
      downloadUrl: `https://${connection.provider}.com/download/${file.name}`
    };
  }

  // Get storage quota
  static async getStorageQuota(connectionId: string): Promise<CloudStorageQuota> {
    try {
      // This would call the provider's API to get quota info
      // For now, return mock data
      return {
        used: 5000000000, // 5 GB
        total: 15000000000, // 15 GB
        percentage: 33.33
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
      throw error;
    }
  }

  // Sync all documents
  static async syncAllDocuments(connectionId: string): Promise<CloudStorageSyncResult> {
    try {
      const startTime = Date.now();

      // This would implement full sync logic
      // For now, return mock result
      const result: CloudStorageSyncResult = {
        success: true,
        filesUploaded: 0,
        filesDownloaded: 0,
        filesFailed: 0,
        errors: [],
        duration: Date.now() - startTime
      };

      toast.success('Documents synced successfully');
      return result;
    } catch (error) {
      console.error('Error syncing documents:', error);
      toast.error('Failed to sync documents');
      throw error;
    }
  }

  // Mapping functions
  private static mapConnection(data: any): CloudStorageConnection {
    return {
      id: data.id,
      advocateId: data.advocate_id,
      provider: data.provider,
      providerAccountId: data.provider_account_id,
      providerAccountEmail: data.provider_account_email,
      providerAccountName: data.provider_account_name,
      rootFolderId: data.root_folder_id,
      rootFolderPath: data.root_folder_path,
      isActive: data.is_active,
      isPrimary: data.is_primary,
      lastSyncAt: data.last_sync_at,
      syncStatus: data.sync_status,
      syncError: data.sync_error,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // List files and folders from cloud storage
  static async listFiles(
    connectionId: string,
    folderPath: string = ''
  ): Promise<Array<{
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    modifiedDate?: Date;
    path: string;
    mimeType?: string;
  }>> {
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Call provider-specific API
      return await this.listFilesFromProvider(connection, folderPath);
    } catch (error) {
      console.error('Error listing files:', error);
      toast.error('Failed to load files');
      throw error;
    }
  }

  // List files from specific provider
  private static async listFilesFromProvider(
    connection: CloudStorageConnection,
    folderPath: string
  ): Promise<Array<{
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    modifiedDate?: Date;
    path: string;
    mimeType?: string;
  }>> {
    // TODO: Implement actual provider API calls
    // For now, return mock data for development
    
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data based on folder path
    if (!folderPath || folderPath === 'Root') {
      return [
        {
          id: '1',
          name: 'Legal Documents',
          type: 'folder',
          path: 'Legal Documents',
        },
        {
          id: '2',
          name: 'Contracts',
          type: 'folder',
          path: 'Contracts',
        },
        {
          id: '3',
          name: 'Case Brief - Smith v Jones.pdf',
          type: 'file',
          size: 245760,
          modifiedDate: new Date(Date.now() - 86400000),
          path: 'Case Brief - Smith v Jones.pdf',
          mimeType: 'application/pdf'
        },
        {
          id: '4',
          name: 'Client Meeting Notes.docx',
          type: 'file',
          size: 51200,
          modifiedDate: new Date(Date.now() - 172800000),
          path: 'Client Meeting Notes.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      ];
    }

    // Mock subfolder contents
    return [
      {
        id: `${folderPath}-1`,
        name: 'Subfolder',
        type: 'folder',
        path: `${folderPath}/Subfolder`,
      },
      {
        id: `${folderPath}-2`,
        name: 'Document.pdf',
        type: 'file',
        size: 102400,
        modifiedDate: new Date(Date.now() - 259200000),
        path: `${folderPath}/Document.pdf`,
        mimeType: 'application/pdf'
      }
    ];
  }

  private static mapDocumentCloudStorage(data: any): DocumentCloudStorage {
    return {
      id: data.id,
      documentUploadId: data.document_upload_id,
      connectionId: data.connection_id,
      providerFileId: data.provider_file_id,
      providerFilePath: data.provider_file_path,
      providerWebUrl: data.provider_web_url,
      providerDownloadUrl: data.provider_download_url,
      isSynced: data.is_synced,
      lastSyncedAt: data.last_synced_at,
      localHash: data.local_hash,
      providerHash: data.provider_hash,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}
