import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AsyncButton } from '@/components/ui/AsyncButton';
import { Modal } from '@/components/ui/Modal';
import { useCloudStorage } from '@/hooks/useCloudStorage';
import { documentReferencesService } from '@/services/api/document-references.service';
import { CLOUD_STORAGE_PROVIDERS } from '@/config/cloud-storage-providers.config';
import type { 
  CloudStorageConnection, 
  CloudStorageProvider, 
  CloudStorageFileInfo
} from '@/types/cloud-storage.types';
import { toast } from 'react-hot-toast';

interface LinkDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  matterId: string;
  onDocumentLinked: () => void;
}

export const LinkDocumentModal: React.FC<LinkDocumentModalProps> = ({
  isOpen,
  onClose,
  matterId,
  onDocumentLinked
}) => {
  const { connections, linkFile, listFiles } = useCloudStorage();
  const [step, setStep] = useState<'provider' | 'browse' | 'local'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<CloudStorageProvider | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<CloudStorageConnection | null>(null);
  const [files, setFiles] = useState<CloudStorageFileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [localFilePath, setLocalFilePath] = useState('');

  const activeConnections = connections.filter(c => c.isActive);

  useEffect(() => {
    if (!isOpen) {
      setStep('provider');
      setSelectedProvider(null);
      setSelectedConnection(null);
      setFiles([]);
      setCurrentPath('');
      setLocalFilePath('');
    }
  }, [isOpen]);

  const handleProviderSelect = async (provider: CloudStorageProvider) => {
    // Show "coming soon" message for Google Drive
    toast('Google Drive integration coming soon! 🚧', { icon: '🔜' });
    
    /* Original implementation commented out for now
    const connection = activeConnections.find(c => c.provider === provider);
    if (!connection) {
      toast.error(`No active ${provider} connection found`);
      return;
    }

    setSelectedProvider(provider);
    setSelectedConnection(connection);
    setStep('browse');
    await loadFiles(connection.id, '');
    */
  };

  const handleLocalFileSelect = () => {
    // Show message about desktop app requirement
    toast('Local file linking only available in desktop app...', { 
      icon: '💻',
      duration: 4000
    });
    
    /* Original implementation commented out for now
    setStep('local');
    */
  };

  const loadFiles = async (connectionId: string, folderPath: string) => {
    try {
      setLoading(true);
      const fileList = await listFiles(connectionId, folderPath);
      setFiles(fileList);
      setCurrentPath(folderPath);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: CloudStorageFileInfo) => {
    if (file.type === 'folder') {
      await loadFiles(selectedConnection!.id, file.path);
      return;
    }

    try {
      // Create document reference using the new service
      await documentReferencesService.createDocumentReference({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.mimeType,
        storageProvider: selectedProvider! as any,
        providerFileId: file.id,
        providerFilePath: file.path,
        providerWebUrl: file.webViewUrl,
        providerDownloadUrl: file.downloadUrl,
        matterId: matterId
      });

      // Also link to matter if not already linked
      // (The createDocumentReference already handles this via matterId)

      toast.success('Document linked successfully');
      onDocumentLinked();
      onClose();
    } catch (error) {
      console.error('Error linking file:', error);
      toast.error('Failed to link document');
    }
  };

  const handleLocalFileLink = async () => {
    if (!localFilePath.trim()) {
      toast.error('Please enter a file path');
      return;
    }

    try {
      const fileName = localFilePath.split(/[/\\]/).pop() || 'Unknown File';
      
      // Create document reference for local file
      await documentReferencesService.createDocumentReference({
        fileName,
        storageProvider: 'local',
        providerFileId: localFilePath, // Use path as ID for local files
        providerFilePath: localFilePath,
        localFilePath: localFilePath,
        matterId: matterId
      });

      toast.success('Local file linked successfully');
      onDocumentLinked();
      onClose();
    } catch (error) {
      console.error('Error linking local file:', error);
      toast.error('Failed to link local file');
    }
  };

  const goBack = () => {
    if (step === 'browse' || step === 'local') {
      setStep('provider');
    } else if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      loadFiles(selectedConnection!.id, parentPath);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link Document to Matter"
      size="lg"
    >
      <div className="space-y-4">
        {step === 'provider' && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Link existing files</strong> from your storage to this matter. 
                Your files stay in your storage - we only create a reference.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Choose Storage Location:</h4>
              
              {/* Cloud Storage Options */}
              {activeConnections.length > 0 ? (
                <div className="space-y-2">
                  {activeConnections.map((connection) => {
                    const provider = CLOUD_STORAGE_PROVIDERS[connection.provider];
                    return (
                      <button
                        key={connection.id}
                        onClick={() => handleProviderSelect(connection.provider)}
                        className="w-full flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                      >
                        <div className="text-2xl mr-3">{provider.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {provider.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {connection.providerAccountEmail || connection.providerAccountName}
                          </div>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">→</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">No cloud storage connected</p>
                  <p className="text-sm">Connect a provider in Settings to link cloud files</p>
                </div>
              )}

              {/* Local File Option */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <button
                  onClick={handleLocalFileSelect}
                  className="w-full flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <div className="text-2xl mr-3">💻</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Local File
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Link a file from your computer (desktop app only)
                    </div>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">→</div>
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'browse' && selectedConnection && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Browse {CLOUD_STORAGE_PROVIDERS[selectedProvider!].name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPath || 'Root folder'}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={goBack}>
                ← Back
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No files found in this folder
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {files.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <div className="text-xl mr-3">
                          {file.type === 'folder' ? '📁' : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </div>
                          {file.size && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </div>
                          )}
                        </div>
                        {file.type === 'folder' && (
                          <div className="text-gray-400 dark:text-gray-500">→</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === 'local' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Link Local File
              </h4>
              <Button variant="secondary" size="sm" onClick={goBack}>
                ← Back
              </Button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Local file linking works best with the desktop app. 
                In the web version, you'll need to manually enter the file path.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Path
                </label>
                <input
                  type="text"
                  value={localFilePath}
                  onChange={(e) => setLocalFilePath(e.target.value)}
                  placeholder="C:\Documents\Briefs\Smith-Brief.pdf"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <AsyncButton
                variant="primary"
                onAsyncClick={handleLocalFileLink}
                disabled={!localFilePath.trim()}
                className="w-full"
              >
                Link Local File
              </AsyncButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};