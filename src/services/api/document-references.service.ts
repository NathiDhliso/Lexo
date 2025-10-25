import { supabase } from '../../lib/supabase';
import { DocumentReference, DocumentAccessLog, MatterDocumentLink, DocumentSharing } from '../../types/document-references.types';

export class DocumentReferencesService {
  // ================================================================================
  // DOCUMENT REFERENCES
  // ================================================================================

  /**
   * Create a new document reference (link to file in cloud storage)
   */
  async createDocumentReference(data: {
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
  }): Promise<DocumentReference> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: docRef, error } = await supabase
      .from('document_references')
      .insert({
        user_id: user.user.id,
        matter_id: data.matterId || null,
        file_name: data.fileName,
        file_extension: data.fileExtension,
        file_size_bytes: data.fileSizeBytes,
        mime_type: data.mimeType,
        storage_provider: data.storageProvider,
        provider_file_id: data.providerFileId,
        provider_file_path: data.providerFilePath,
        provider_web_url: data.providerWebUrl,
        provider_download_url: data.providerDownloadUrl,
        local_file_path: data.localFilePath,
        document_type: data.documentType || 'general',
        tags: data.tags || [],
        description: data.description,
        is_confidential: data.isConfidential || false,
        access_level: data.accessLevel || 'private'
      })
      .select()
      .single();

    if (error) throw error;

    // Log the creation
    await this.logDocumentAccess(docRef.id, 'link');

    return docRef;
  }

  /**
   * Get document references for the current user
   */
  async getDocumentReferences(filters?: {
    matterId?: string;
    storageProvider?: string;
    documentType?: string;
    verificationStatus?: string;
    tags?: string[];
  }): Promise<DocumentReference[]> {
    let query = supabase
      .from('document_references')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.matterId) {
      query = query.eq('matter_id', filters.matterId);
    }

    if (filters?.storageProvider) {
      query = query.eq('storage_provider', filters.storageProvider);
    }

    if (filters?.documentType) {
      query = query.eq('document_type', filters.documentType);
    }

    if (filters?.verificationStatus) {
      query = query.eq('verification_status', filters.verificationStatus);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Get a single document reference by ID
   */
  async getDocumentReference(id: string): Promise<DocumentReference | null> {
    const { data, error } = await supabase
      .from('document_references')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Log the access
    await this.logDocumentAccess(id, 'view');

    return data;
  }

  /**
   * Update a document reference
   */
  async updateDocumentReference(id: string, updates: Partial<DocumentReference>): Promise<DocumentReference> {
    const { data, error } = await supabase
      .from('document_references')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a document reference (removes the reference, not the actual file)
   */
  async deleteDocumentReference(id: string): Promise<void> {
    // Log the deletion attempt
    await this.logDocumentAccess(id, 'unlink');

    const { error } = await supabase
      .from('document_references')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Verify document availability
   */
  async verifyDocumentAvailability(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('verify_document_availability', { p_document_id: id });

    if (error) throw error;

    // Log the verification
    await this.logDocumentAccess(id, 'verify', undefined, data);

    return data;
  }

  /**
   * Bulk verify multiple documents
   */
  async bulkVerifyDocuments(ids: string[]): Promise<{ [id: string]: boolean }> {
    const results: { [id: string]: boolean } = {};

    // Verify each document (in production, this could be optimized with batch API calls)
    for (const id of ids) {
      try {
        results[id] = await this.verifyDocumentAvailability(id);
      } catch (error) {
        console.error(`Failed to verify document ${id}:`, error);
        results[id] = false;
      }
    }

    return results;
  }

  // ================================================================================
  // MATTER DOCUMENT LINKS
  // ================================================================================

  /**
   * Link a document to a matter
   */
  async linkDocumentToMatter(data: {
    matterId: string;
    documentReferenceId: string;
    linkReason?: string;
    isPrimary?: boolean;
  }): Promise<MatterDocumentLink> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: link, error } = await supabase
      .from('matter_document_links')
      .insert({
        matter_id: data.matterId,
        document_reference_id: data.documentReferenceId,
        linked_by: user.user.id,
        link_reason: data.linkReason,
        is_primary: data.isPrimary || false
      })
      .select()
      .single();

    if (error) throw error;
    return link;
  }

  /**
   * Get documents linked to a matter
   */
  async getMatterDocuments(matterId: string): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_matter_documents', { p_matter_id: matterId });

    if (error) throw error;
    return data || [];
  }

  /**
   * Unlink a document from a matter
   */
  async unlinkDocumentFromMatter(matterId: string, documentReferenceId: string): Promise<void> {
    const { error } = await supabase
      .from('matter_document_links')
      .delete()
      .eq('matter_id', matterId)
      .eq('document_reference_id', documentReferenceId);

    if (error) throw error;
  }

  // ================================================================================
  // DOCUMENT SHARING
  // ================================================================================

  /**
   * Share a document with another user
   */
  async shareDocument(data: {
    documentReferenceId: string;
    sharedWith: string;
    permissionLevel: 'view' | 'comment' | 'edit';
    canReshare?: boolean;
    expiresAt?: Date;
  }): Promise<DocumentSharing> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: sharing, error } = await supabase
      .from('document_sharing')
      .insert({
        document_reference_id: data.documentReferenceId,
        shared_with: data.sharedWith,
        shared_by: user.user.id,
        permission_level: data.permissionLevel,
        can_reshare: data.canReshare || false,
        expires_at: data.expiresAt?.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return sharing;
  }

  /**
   * Get documents shared with the current user
   */
  async getSharedDocuments(): Promise<DocumentReference[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('document_references')
      .select(`
        *,
        document_sharing!inner(
          permission_level,
          shared_at,
          expires_at
        )
      `)
      .eq('document_sharing.shared_with', user.user.id)
      .eq('document_sharing.is_active', true);

    if (error) throw error;
    return data || [];
  }

  /**
   * Revoke document sharing
   */
  async revokeDocumentSharing(documentReferenceId: string, sharedWith: string): Promise<void> {
    const { error } = await supabase
      .from('document_sharing')
      .update({ is_active: false })
      .eq('document_reference_id', documentReferenceId)
      .eq('shared_with', sharedWith);

    if (error) throw error;
  }

  // ================================================================================
  // ACCESS LOGGING
  // ================================================================================

  /**
   * Log document access
   */
  private async logDocumentAccess(
    documentReferenceId: string,
    accessType: 'view' | 'download' | 'verify' | 'link' | 'unlink',
    matterId?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return; // Don't log if user not authenticated

    try {
      await supabase.rpc('log_document_access', {
        p_document_reference_id: documentReferenceId,
        p_accessed_by: user.user.id,
        p_access_type: accessType,
        p_matter_id: matterId,
        p_success: success,
        p_error_message: errorMessage
      });
    } catch (error) {
      // Don't throw on logging errors, just log to console
      console.error('Failed to log document access:', error);
    }
  }

  /**
   * Get access logs for a document
   */
  async getDocumentAccessLogs(documentReferenceId: string): Promise<DocumentAccessLog[]> {
    const { data, error } = await supabase
      .from('document_access_log')
      .select(`
        *,
        accessed_by_user:user_profiles!accessed_by(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('document_reference_id', documentReferenceId)
      .order('accessed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ================================================================================
  // STATISTICS
  // ================================================================================

  /**
   * Get document statistics for the current user
   */
  async getDocumentStatistics(): Promise<{
    totalDocuments: number;
    availableDocuments: number;
    missingDocuments: number;
    accessDeniedDocuments: number;
    confidentialDocuments: number;
    storageProvidersUsed: number;
    mattersWithDocuments: number;
  }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('document_statistics')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No statistics found, return zeros
        return {
          totalDocuments: 0,
          availableDocuments: 0,
          missingDocuments: 0,
          accessDeniedDocuments: 0,
          confidentialDocuments: 0,
          storageProvidersUsed: 0,
          mattersWithDocuments: 0
        };
      }
      throw error;
    }

    return {
      totalDocuments: data.total_documents || 0,
      availableDocuments: data.available_documents || 0,
      missingDocuments: data.missing_documents || 0,
      accessDeniedDocuments: data.access_denied_documents || 0,
      confidentialDocuments: data.confidential_documents || 0,
      storageProvidersUsed: data.storage_providers_used || 0,
      mattersWithDocuments: data.matters_with_documents || 0
    };
  }
}

export const documentReferencesService = new DocumentReferencesService();