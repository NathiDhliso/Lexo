import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AsyncButton } from '@/components/ui/AsyncButton';
import { LinkDocumentModal } from './LinkDocumentModal';
import { useConfirmation } from '@/hooks/useConfirmation';
import { documentReferencesService } from '@/services/api/document-references.service';
import type { DocumentReference, MatterDocumentSummary } from '@/types/document-references.types';
import { 
  FileText, 
  ExternalLink, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentsTabProps {
  matterId: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ matterId }) => {
  const [documents, setDocuments] = useState<MatterDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { confirm } = useConfirmation();

  useEffect(() => {
    loadDocuments();
  }, [matterId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentReferencesService.getMatterDocuments(matterId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentLinked = () => {
    loadDocuments(); // Reload documents after linking
    toast.success('Document linked successfully');
  };

  const handleOpenDocument = async (doc: MatterDocumentSummary) => {
    try {
      // Get the full document reference to access URLs
      const docRef = await documentReferencesService.getDocumentReference(doc.document_id);
      if (docRef?.provider_web_url) {
        window.open(docRef.provider_web_url, '_blank');
      } else {
        toast.error('No web URL available for this document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    }
  };

  const handleDeleteDocument = async (doc: MatterDocumentSummary) => {
    const confirmed = await confirm({
      title: 'Remove Document Link',
      message: `Are you sure you want to remove the link to "${doc.file_name}"? This will not delete the actual file from your storage.`,
      confirmText: 'Remove Link',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await documentReferencesService.unlinkDocumentFromMatter(matterId, doc.document_id);
      setDocuments(prev => prev.filter(d => d.document_id !== doc.document_id));
      toast.success('Document unlinked successfully');
    } catch (error) {
      console.error('Error unlinking document:', error);
      toast.error('Failed to unlink document');
    }
  };

  const handleVerifyDocuments = async () => {
    try {
      const documentIds = documents.map(d => d.document_id);
      const results = await documentReferencesService.bulkVerifyDocuments(documentIds);
      
      const availableCount = Object.values(results).filter(Boolean).length;
      const totalCount = documentIds.length;
      
      await loadDocuments(); // Reload to get updated statuses
      
      if (availableCount === totalCount) {
        toast.success(`All ${totalCount} documents verified successfully`);
      } else {
        toast.error(`${totalCount - availableCount} of ${totalCount} documents are missing or inaccessible`);
      }
    } catch (error) {
      console.error('Error verifying documents:', error);
      toast.error('Failed to verify documents');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'access_denied':
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'missing':
        return 'Missing';
      case 'access_denied':
        return 'Access Denied';
      default:
        return 'Unknown';
    }
  };

  const getStorageTypeIcon = (storageProvider: string) => {
    switch (storageProvider) {
      case 'google_drive':
        return '📁';
      case 'onedrive':
        return '☁️';
      case 'dropbox':
        return '📦';
      case 'local':
        return '💻';
      default:
        return '📄';
    }
  };

  const getStorageTypeLabel = (storageProvider: string) => {
    switch (storageProvider) {
      case 'google_drive':
        return 'Google Drive';
      case 'onedrive':
        return 'OneDrive';
      case 'dropbox':
        return 'Dropbox';
      case 'local':
        return 'Local File';
      default:
        return storageProvider;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Documents
          </h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Link documents from your storage to this matter
          </p>
        </div>
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <AsyncButton
              variant="secondary"
              size="sm"
              onAsyncClick={handleVerifyDocuments}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verify All
            </AsyncButton>
          )}
          <Button onClick={() => setShowLinkModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Link Document
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 dark:text-blue-400 text-xl">🔒</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Privacy Protected</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your documents stay in your storage (Google Drive, OneDrive, etc.). 
              We only store references to help you organize them by matter.
            </p>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No documents linked yet
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Link documents from Google Drive or local files to organize them by matter
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => setShowLinkModal(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Link from Google Drive
            </Button>
            <Button onClick={() => setShowLinkModal(true)} variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Link Local File
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(doc.verification_status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.file_name}
                      </h4>
                      {doc.document_type && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          {doc.document_type}
                        </span>
                      )}
                      {doc.is_primary && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span>{getStorageTypeIcon(doc.storage_provider)}</span>
                        <span>{getStorageTypeLabel(doc.storage_provider)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {getStatusIcon(doc.verification_status)}
                        <span>{getStatusText(doc.verification_status)}</span>
                      </div>
                      
                      <span className="text-xs">
                        Linked {new Date(doc.linked_at).toLocaleDateString()}
                      </span>
                    </div>

                    {doc.verification_status === 'missing' && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                        File not found at the linked location. It may have been moved or deleted.
                      </div>
                    )}

                    {doc.verification_status === 'access_denied' && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-400">
                        Access denied. You may need to reconnect your storage account.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {doc.verification_status === 'available' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDocument(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  )}
                  
                  <AsyncButton
                    variant="ghost"
                    size="sm"
                    onAsyncClick={() => handleDeleteDocument(doc)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </AsyncButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Document Modal */}
      <LinkDocumentModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        matterId={matterId}
        onDocumentLinked={handleDocumentLinked}
      />
    </div>
  );
};