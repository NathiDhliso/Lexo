import { useState, useEffect } from 'react';
import { CloudStorageService } from '@/services/api/cloud-storage.service';
import type { CloudStorageConnection, CloudStorageUploadOptions } from '@/types/cloud-storage.types';

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

  const uploadFile = async (options: CloudStorageUploadOptions) => {
    try {
      const result = await CloudStorageService.uploadToCloud(options);
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

  const syncDocuments = async (connectionId: string) => {
    try {
      const result = await CloudStorageService.syncAllDocuments(connectionId);
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    connections,
    primaryConnection,
    loading,
    error,
    uploadFile,
    setPrimary,
    disconnect,
    deleteConnection,
    syncDocuments,
    refresh: loadConnections
  };
};
