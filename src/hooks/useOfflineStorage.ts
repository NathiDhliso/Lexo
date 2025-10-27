/**
 * useOfflineStorage Hook
 * 
 * React hook for managing offline storage with automatic initialization
 * and connection status monitoring.
 * 
 * Requirements: 11.5
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { OfflineStorageService, type OfflineRecord, type SyncQueueItem } from '../services/offline/OfflineStorageService';

interface OfflineStorageState {
  isInitialized: boolean;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalRecords: number;
    recordsByType: Record<string, number>;
    pendingSyncItems: number;
    failedSyncItems: number;
  } | null;
}

interface UseOfflineStorageOptions {
  encryptionKey?: string;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

/**
 * useOfflineStorage Hook
 * 
 * Features:
 * - Automatic storage initialization
 * - Online/offline status monitoring
 * - Automatic sync when connection restored
 * - Storage statistics tracking
 * - Error handling and recovery
 * 
 * @example
 * ```tsx
 * const {
 *   storage,
 *   isOnline,
 *   isInitialized,
 *   stats,
 *   store,
 *   get,
 *   getAll,
 *   sync
 * } = useOfflineStorage({
 *   encryptionKey: 'user-key',
 *   autoSync: true
 * });
 * ```
 */
export const useOfflineStorage = (options: UseOfflineStorageOptions = {}) => {
  const {
    encryptionKey,
    autoSync = true,
    syncInterval = 30000, // 30 seconds
  } = options;

  const [state, setState] = useState<OfflineStorageState>({
    isInitialized: false,
    isOnline: navigator.onLine,
    isLoading: true,
    error: null,
    stats: null,
  });

  const storageRef = useRef<OfflineStorageService | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncCallbacksRef = useRef<Array<(success: boolean) => void>>([]);

  // Initialize storage service
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const storage = new OfflineStorageService({
          dbName: 'lexohub_offline',
          version: 1,
          encryptionKey,
        });

        await storage.initialize();
        storageRef.current = storage;

        // Get initial stats
        const stats = await storage.getStorageStats();

        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          stats,
        }));

        console.log('Offline storage initialized successfully');
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize storage',
        }));
      }
    };

    initializeStorage();

    // Cleanup on unmount
    return () => {
      if (storageRef.current) {
        storageRef.current.close();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [encryptionKey]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      
      // Trigger sync when coming back online
      if (autoSync && storageRef.current) {
        setTimeout(() => {
          syncPendingItems();
        }, 1000); // Small delay to ensure connection is stable
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSync && state.isInitialized && state.isOnline) {
      syncIntervalRef.current = setInterval(() => {
        syncPendingItems();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [autoSync, state.isInitialized, state.isOnline, syncInterval]);

  // Store data offline
  const store = useCallback(async (
    type: string,
    data: any,
    encrypt: boolean = true
  ): Promise<string> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    const id = await storageRef.current.store(type, data, encrypt);
    
    // Update stats
    updateStats();
    
    return id;
  }, []);

  // Get data by ID
  const get = useCallback(async (id: string): Promise<OfflineRecord | null> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    return storageRef.current.get(id);
  }, []);

  // Get all data of a type
  const getAll = useCallback(async (type: string): Promise<OfflineRecord[]> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    return storageRef.current.getAll(type);
  }, []);

  // Update data
  const update = useCallback(async (id: string, data: any): Promise<void> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    await storageRef.current.update(id, data);
    updateStats();
  }, []);

  // Delete data
  const remove = useCallback(async (id: string): Promise<void> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    await storageRef.current.delete(id);
    updateStats();
  }, []);

  // Update storage statistics
  const updateStats = useCallback(async () => {
    if (!storageRef.current) return;

    try {
      const stats = await storageRef.current.getStorageStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Failed to update storage stats:', error);
    }
  }, []);

  // Sync pending items
  const syncPendingItems = useCallback(async (): Promise<boolean> => {
    if (!storageRef.current || !state.isOnline) {
      return false;
    }

    try {
      const syncQueue = await storageRef.current.getSyncQueue();
      
      if (syncQueue.length === 0) {
        return true;
      }

      console.log(`Syncing ${syncQueue.length} pending items...`);

      let successCount = 0;
      let failureCount = 0;

      // Process sync queue items
      for (const item of syncQueue) {
        try {
          // Update sync status to 'syncing'
          await storageRef.current.updateSyncStatus(item.recordId, 'syncing');

          // TODO: Implement actual API sync calls here
          // This would call the appropriate API endpoints based on item.action and item.recordType
          const success = await syncItem(item);

          if (success) {
            // Mark as synced and remove from queue
            await storageRef.current.updateSyncStatus(item.recordId, 'synced');
            await storageRef.current.removeFromSyncQueue(item.id);
            successCount++;
          } else {
            // Mark as failed
            await storageRef.current.updateSyncStatus(item.recordId, 'failed');
            failureCount++;
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await storageRef.current.updateSyncStatus(item.recordId, 'failed');
          failureCount++;
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failed`);

      // Update stats
      await updateStats();

      // Notify callbacks
      const success = failureCount === 0;
      syncCallbacksRef.current.forEach(callback => callback(success));

      return success;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }, [state.isOnline]);

  // Mock sync function - replace with actual API calls
  const syncItem = async (item: SyncQueueItem): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock success rate (90% success for demo)
    return Math.random() > 0.1;
  };

  // Add sync callback
  const onSync = useCallback((callback: (success: boolean) => void) => {
    syncCallbacksRef.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = syncCallbacksRef.current.indexOf(callback);
      if (index > -1) {
        syncCallbacksRef.current.splice(index, 1);
      }
    };
  }, []);

  // Manual sync trigger
  const sync = useCallback(async (): Promise<boolean> => {
    return syncPendingItems();
  }, [syncPendingItems]);

  // Clear all data
  const clearAll = useCallback(async (): Promise<void> => {
    if (!storageRef.current) {
      throw new Error('Storage not initialized');
    }

    await storageRef.current.clearAll();
    await updateStats();
  }, [updateStats]);

  return {
    // State
    isInitialized: state.isInitialized,
    isOnline: state.isOnline,
    isLoading: state.isLoading,
    error: state.error,
    stats: state.stats,
    
    // Storage instance (for advanced usage)
    storage: storageRef.current,
    
    // Data operations
    store,
    get,
    getAll,
    update,
    remove,
    
    // Sync operations
    sync,
    onSync,
    
    // Utilities
    updateStats,
    clearAll,
  };
};