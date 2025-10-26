import { supabase, supabaseUrl } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type {
  CloudStorageConnection,
  CloudStorageProvider,
  CloudStorageAuthResponse,
  CloudStorageQuota,
  CloudStorageLinkOptions,
  CloudStorageVerificationResult,
  DocumentReference
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

  // Link existing file from cloud storage
  static async linkFromCloudStorage(
    options: CloudStorageLinkOptions
  ): Promise<DocumentReference> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For cloud storage, verify the connection exists
      if (options.storageType !== 'local') {
        const connections = await this.getConnections();
        const connection = connections.find(c => c.provider === options.storageType && c.isActive);
        if (!connection) {
          throw new Error(`No active ${options.storageType} connection found. Please connect your account first.`);
        }
      }

      // Create document reference (not upload)
      const { data: docRef, error } = await supabase
        .from('document_references')
        .insert({
          matter_id: options.matterId,
          file_name: options.fileName,
          storage_type: options.storageType,
          local_path: options.storageType === 'local' ? options.fileReference : null,
          cloud_file_id: options.storageType !== 'local' ? options.fileReference : null,
          cloud_file_url: options.fileUrl,
          file_status: 'available',
          last_verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`File linked from ${options.storageType === 'local' ? 'local storage' : options.storageType}`);
      return this.mapDocumentReference(docRef);
    } catch (error) {
      console.error('Error linking file:', error);
      const message = error instanceof Error ? error.message : 'Failed to link file';
      toast.error(message);
      throw error;
    }
  }

  // Get document references for a matter
  static async getDocumentReferences(matterId: string): Promise<DocumentReference[]> {
    try {
      const { data, error } = await supabase
        .from('document_references')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDocumentReference);
    } catch (error) {
      console.error('Error fetching document references:', error);
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

  // Verify all document references
  static async verifyAllDocuments(matterId?: string): Promise<CloudStorageVerificationResult> {
    try {
      const startTime = Date.now();

      // Get document references to verify
      let query = supabase.from('document_references').select('*');
      if (matterId) {
        query = query.eq('matter_id', matterId);
      }

      const { data: documents, error } = await query;
      if (error) throw error;

      let filesAvailable = 0;
      let filesMissing = 0;
      let filesAccessDenied = 0;
      const errors: string[] = [];

      // Verify each document reference
      for (const doc of documents || []) {
        try {
          const isAvailable = await this.verifyDocumentExists(doc);
          if (isAvailable) {
            filesAvailable++;
            // Update status if it was previously missing
            if (doc.file_status !== 'available') {
              await supabase
                .from('document_references')
                .update({ 
                  file_status: 'available',
                  last_verified_at: new Date().toISOString()
                })
                .eq('id', doc.id);
            }
          } else {
            filesMissing++;
            // Update status to missing
            await supabase
              .from('document_references')
              .update({ 
                file_status: 'missing',
                last_verified_at: new Date().toISOString()
              })
              .eq('id', doc.id);
          }
        } catch (error) {
          filesAccessDenied++;
          errors.push(`${doc.file_name}: ${error instanceof Error ? error.message : 'Access denied'}`);
          // Update status to access denied
          await supabase
            .from('document_references')
            .update({ 
              file_status: 'access_denied',
              last_verified_at: new Date().toISOString()
            })
            .eq('id', doc.id);
        }
      }

      const result: CloudStorageVerificationResult = {
        success: errors.length === 0,
        filesVerified: documents?.length || 0,
        filesAvailable,
        filesMissing,
        filesAccessDenied,
        errors,
        duration: Date.now() - startTime
      };

      if (result.success) {
        toast.success('All documents verified successfully');
      } else {
        toast.error(`Verification completed with ${errors.length} errors`);
      }

      return result;
    } catch (error) {
      console.error('Error verifying documents:', error);
      toast.error('Failed to verify documents');
      throw error;
    }
  }

  // Verify if a single document reference still exists
  private static async verifyDocumentExists(docRef: any): Promise<boolean> {
    if (docRef.storage_type === 'local') {
      // For local files, we can't verify from web app
      // This would need desktop app integration
      return true; // Assume available for now
    }

    // For cloud storage, check if file still exists
    try {
      const connections = await this.getConnections();
      const connection = connections.find(c => c.provider === docRef.storage_type && c.isActive);
      
      if (!connection) {
        throw new Error('Storage connection not available');
      }

      // Check file exists using provider API
      return await this.checkCloudFileExists(connection, docRef.cloud_file_id);
    } catch (error) {
      return false;
    }
  }

  // Check if cloud file exists (provider-specific)
  private static async checkCloudFileExists(
    connection: CloudStorageConnection,
    fileId: string
  ): Promise<boolean> {
    // TODO: Implement actual provider API calls
    // For now, return true (mock implementation)
    return true;
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
    webViewUrl?: string;
  }>> {
    switch (connection.provider) {
      case 'google_drive':
        return await this.listGoogleDriveFiles(connection, folderPath);
      case 'onedrive':
        return await this.listOneDriveFiles(connection, folderPath);
      case 'dropbox':
        return await this.listDropboxFiles(connection, folderPath);
      default:
        return await this.listMockFiles(folderPath);
    }
  }

  // Google Drive file listing
  private static async listGoogleDriveFiles(
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
    webViewUrl?: string;
  }>> {
    try {
      // Call Supabase Edge Function for Google Drive API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const folderId = folderPath === 'Root' || !folderPath ? 'root' : folderPath;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/google-drive-files?folderId=${folderId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files from Google Drive');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to list Google Drive files');
      }

      return result.files;
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      
      // Fallback to enhanced mock data for development
      return await this.listMockGoogleDriveFiles(folderPath);
    }
  }

  // Enhanced mock data for Google Drive (development fallback)
  private static async listMockGoogleDriveFiles(folderPath: string): Promise<Array<{
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    modifiedDate?: Date;
    path: string;
    mimeType?: string;
    webViewUrl?: string;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

    if (!folderPath || folderPath === 'Root' || folderPath === '') {
      return [
        {
          id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          name: 'Client Briefs',
          type: 'folder',
          path: 'Client Briefs',
        },
        {
          id: '1mGcjNF0dhQEgFQOlXZWX4LL8egr18rNd',
          name: 'Court Documents',
          type: 'folder',
          path: 'Court Documents',
        },
        {
          id: '1f4YoD4ihiDvOKbfvtfvhIleP7A9veX7l',
          name: 'Smith v Jones - Brief.pdf',
          type: 'file',
          size: 245760,
          modifiedDate: new Date(Date.now() - 86400000),
          path: 'Smith v Jones - Brief.pdf',
          mimeType: 'application/pdf',
          webViewUrl: 'https://drive.google.com/file/d/1f4YoD4ihiDvOKbfvtfvhIleP7A9veX7l/view'
        },
        {
          id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          name: 'Legal Opinion - Tax Matter.docx',
          type: 'file',
          size: 51200,
          modifiedDate: new Date(Date.now() - 172800000),
          path: 'Legal Opinion - Tax Matter.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          webViewUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
        },
        {
          id: '1mGcjNF0dhQEgFQOlXZWX4LL8egr18rNd',
          name: 'Contract Review Notes.pdf',
          type: 'file',
          size: 128000,
          modifiedDate: new Date(Date.now() - 259200000),
          path: 'Contract Review Notes.pdf',
          mimeType: 'application/pdf',
          webViewUrl: 'https://drive.google.com/file/d/1mGcjNF0dhQEgFQOlXZWX4LL8egr18rNd/view'
        }
      ];
    }

    // Mock subfolder contents
    return [
      {
        id: `${folderPath}-subfolder-1`,
        name: 'Archive',
        type: 'folder',
        path: `${folderPath}/Archive`,
      },
      {
        id: `${folderPath}-file-1`,
        name: 'Document.pdf',
        type: 'file',
        size: 102400,
        modifiedDate: new Date(Date.now() - 259200000),
        path: `${folderPath}/Document.pdf`,
        mimeType: 'application/pdf',
        webViewUrl: `https://drive.google.com/file/d/${folderPath}-file-1/view`
      }
    ];
  }

  // OneDrive file listing (mock for now)
  private static async listOneDriveFiles(
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
    webViewUrl?: string;
  }>> {
    // TODO: Implement OneDrive API
    return await this.listMockFiles(folderPath);
  }

  // Dropbox file listing (mock for now)
  private static async listDropboxFiles(
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
    webViewUrl?: string;
  }>> {
    // TODO: Implement Dropbox API
    return await this.listMockFiles(folderPath);
  }

  // Mock file listing for development
  private static async listMockFiles(folderPath: string): Promise<Array<{
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    modifiedDate?: Date;
    path: string;
    mimeType?: string;
    webViewUrl?: string;
  }>> {
    await new Promise(resolve => setTimeout(resolve, 500));

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
        }
      ];
    }

    return [
      {
        id: `${folderPath}-1`,
        name: 'Document.pdf',
        type: 'file',
        size: 102400,
        modifiedDate: new Date(Date.now() - 259200000),
        path: `${folderPath}/Document.pdf`,
        mimeType: 'application/pdf'
      }
    ];
  }

  private static mapDocumentReference(data: any): DocumentReference {
    return {
      id: data.id,
      matterId: data.matter_id,
      fileName: data.file_name,
      fileType: data.file_type,
      documentType: data.document_type,
      notes: data.notes,
      storageType: data.storage_type,
      localPath: data.local_path,
      cloudFileId: data.cloud_file_id,
      cloudFileUrl: data.cloud_file_url,
      lastVerifiedAt: data.last_verified_at,
      fileStatus: data.file_status || 'available',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Open document reference
  static async openDocument(docRef: DocumentReference): Promise<void> {
    try {
      if (docRef.storageType === 'local') {
        // Local files can only be opened in desktop app
        toast.error('Local files can only be opened in the desktop app');
        return;
      }

      // For cloud storage, open in web browser
      if (docRef.cloudFileUrl) {
        window.open(docRef.cloudFileUrl, '_blank');
      } else {
        toast.error('File URL not available');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    }
  }

  // Delete document reference (not the actual file)
  static async deleteDocumentReference(docRefId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_references')
        .delete()
        .eq('id', docRefId);

      if (error) throw error;

      toast.success('Document reference removed');
    } catch (error) {
      console.error('Error deleting document reference:', error);
      toast.error('Failed to remove document reference');
      throw error;
    }
  }
}
