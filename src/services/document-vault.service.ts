/**
 * Document Vault Service — Section 9.4
 * Per-matter document storage with versioning and tagging.
 */
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type DocumentType = 'brief' | 'pleading' | 'correspondence' | 'court_order' | 'invoice' | 'fee_agreement' | 'receipt' | 'other';

export interface MatterDocument {
  id: string;
  matter_id: string;
  advocate_id: string;
  filename: string;
  original_filename: string;
  document_type: DocumentType;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  version: number;
  parent_document_id?: string;
  tags: string[];
  is_shared: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

class DocumentVaultService {
  async getByMatter(matterId: string): Promise<MatterDocument[]> {
    const { data, error } = await supabase
      .from('matter_documents').select('*')
      .eq('matter_id', matterId).is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data ?? [];
  }

  async upload(matterId: string, file: File, documentType: DocumentType, description?: string, tags?: string[]): Promise<MatterDocument | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const ext = file.name.split('.').pop();
    const storagePath = `documents/${user.id}/${matterId}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('matter-documents')
      .upload(storagePath, file, { contentType: file.type });

    if (uploadError) {
      toast.error('File upload failed');
      console.error(uploadError);
      return null;
    }

    // Create database record
    const { data, error } = await supabase
      .from('matter_documents')
      .insert({
        matter_id: matterId,
        advocate_id: user.id,
        filename: storagePath,
        original_filename: file.name,
        document_type: documentType,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        version: 1,
        tags: tags ?? [],
        is_shared: false,
        description,
      })
      .select().single();

    if (error) { toast.error('Failed to save document record'); return null; }
    toast.success(`"${file.name}" uploaded`);
    return data;
  }

  async uploadNewVersion(parentDocId: string, file: File): Promise<MatterDocument | null> {
    const { data: parent } = await supabase.from('matter_documents').select('*').eq('id', parentDocId).single();
    if (!parent) return null;

    const doc = await this.upload(parent.matter_id, file, parent.document_type, parent.description, parent.tags);
    if (doc) {
      await supabase.from('matter_documents')
        .update({ parent_document_id: parentDocId, version: parent.version + 1 })
        .eq('id', doc.id);
    }
    return doc;
  }

  async getDownloadUrl(storagePath: string): Promise<string | null> {
    const { data } = await supabase.storage.from('matter-documents').createSignedUrl(storagePath, 3600);
    return data?.signedUrl ?? null;
  }

  async toggleShared(docId: string, isShared: boolean): Promise<void> {
    const { error } = await supabase.from('matter_documents')
      .update({ is_shared: isShared }).eq('id', docId);
    if (error) toast.error('Failed to update sharing');
    else toast.success(isShared ? 'Document shared with attorney' : 'Document unshared');
  }

  async softDelete(docId: string): Promise<void> {
    const { error } = await supabase.from('matter_documents')
      .update({ deleted_at: new Date().toISOString() }).eq('id', docId);
    if (error) toast.error('Failed to delete document');
    else toast.success('Document deleted');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
}

export const documentVaultService = new DocumentVaultService();
