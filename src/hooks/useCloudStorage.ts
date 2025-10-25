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
    try {
      const result = await CloudStorageService.linkFromCloudStorage(options);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const getDocumentReferences = async (matterId: string) => {
    try {
      const result = await CloudStorageService.getDocumentReferences(matterId);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const listFiles = async (connectionId: string, folderPath?: string) => {
    try {
      const result = await CloudStorageService.listFiles(connectionId, folderPath);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const openDocument = async (docRef: DocumentReference) => {
    try {
      await CloudStorageService.openDocument(docRef);
    } catch (err) {
      throw err;
    }
  };

  const deleteDocumentReference = async (docRefId: string) => {
    try {
      await CloudStorageService.deleteDocumentReference(docRefId);
    } catch (err) {
      throw err;
    }
  };

  const verifyDocuments = async (matterId?: string) => {
    try {
      const result = await CloudStorageService.verifyAllDocuments(matterId);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const setPrimary = async (connectionId: string) => {
    try {
      await CloudStorageService.setPrimaryConnection(connectionId);
      await loadConnections();
    } catch (err) {
      throw err;
    }
  };

  const disconnect = async (connectionId: string) => {
    try {
      await CloudStorageService.disconnect(connectionId);
      await loadConnections();
    } catch (err) {
      throw err;
    }
  };

  const deleteConnection = async (connectionId: string) => {
    try {
      await CloudStorageService.deleteConnection(connectionId);
      await loadConnections();
    } catch (err) {
      throw err;
    }
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
