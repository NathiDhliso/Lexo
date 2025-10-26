import { useState, useEffect } from 'react';
import { CloudStorageService } from '@/services/api/cloud-storage.service';
import type { 
  CloudStorageConnection, 
  CloudStorageLinkOptions, 
  DocumentReference,
  CloudStorageFileInfo
} from '@/types/cloud-storage.types';

export const useCloudStorage = () => {
  const [connections, setConnections] = useState<CloudStorageConnection[]>([]);
  const [primaryConnection, setPrimaryConnection] = useState<CloudStorageConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allConnections, primary] = await Promise.all([
        CloudStorageService.getConnections(),
        CloudStorageService.getPrimaryConnection()
      ]);
      setConnections(allConnections);
      setPrimaryConnection(primary);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load connections';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const linkFile = async (options: CloudStorageLinkOptions) => {
    return await CloudStorageService.linkFromCloudStorage(options);
  };

  const getDocumentReferences = async (matterId: string) => {
    return await CloudStorageService.getDocumentReferences(matterId);
  };

  const listFiles = async (connectionId: string, folderPath?: string) => {
    return await CloudStorageService.listFiles(connectionId, folderPath);
  };

  const openDocument = async (docRef: DocumentReference) => {
    await CloudStorageService.openDocument(docRef);
  };

  const deleteDocumentReference = async (docRefId: string) => {
    await CloudStorageService.deleteDocumentReference(docRefId);
  };

  const verifyDocuments = async (matterId?: string) => {
    return await CloudStorageService.verifyAllDocuments(matterId);
  };

  const setPrimary = async (connectionId: string) => {
    await CloudStorageService.setPrimaryConnection(connectionId);
    await loadConnections();
  };

  const disconnect = async (connectionId: string) => {
    await CloudStorageService.disconnect(connectionId);
    await loadConnections();
  };

  const deleteConnection = async (connectionId: string) => {
    await CloudStorageService.deleteConnection(connectionId);
    await loadConnections();
  };

  return {
    connections,
    primaryConnection,
    loading,
    error,
    // File operations (new approach)
    linkFile,
    getDocumentReferences,
    listFiles,
    openDocument,
    deleteDocumentReference,
    verifyDocuments,
    // Connection management
    setPrimary,
    disconnect,
    deleteConnection,
    refresh: loadConnections
  };
};
