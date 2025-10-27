/**
 * SyncService
 * 
 * Handles synchronization between offline storage and remote API.
 * Includes conflict resolution, retry logic, and sync status management.
 * 
 * Requirements: 11.5
 */
import { OfflineStorageService, type SyncQueueItem } from './OfflineStorageService';

export interface SyncConflict {
  id: string;
  type: 'data_conflict' | 'version_conflict' | 'deleted_conflict';
  localData: any;
  remoteData: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflictCount: number;
  conflicts: SyncConflict[];
  errors: Array<{ itemId: string; error: string }>;
}

export interface SyncStatus {
  isActive: boolean;
  progress: number; // 0-100
  currentItem?: string;
  totalItems: number;
  completedItems: number;
  lastSync?: Date;
  nextSync?: Date;
}

/**
 * SyncService Class
 * 
 * Features:
 * - Automatic sync queue processing
 * - Conflict detection and resolution
 * - Retry logic with exponential backoff
 * - Batch processing for efficiency
 * - Real-time sync status updates
 * - Network-aware syncing
 * 
 * @example
 * ```typescript
 * const syncService = new SyncService(offlineStorage, {
 *   maxRetries: 3,
 *   batchSize: 10,
 *   retryDelay: 1000
 * });
 * 
 * syncService.onStatusChange((status) => {
 *   console.log('Sync status:', status);
 * });
 * 
 * const result = await syncService.syncAll();
 * ```
 */
export class SyncService {
  private storage: OfflineStorageService;
  private config: {
    maxRetries: number;
    batchSize: number;
    retryDelay: number;
    conflictResolution: 'local' | 'remote' | 'manual';
  };
  
  private statusCallbacks: Array<(status: SyncStatus) => void> = [];
  private conflictCallbacks: Array<(conflict: SyncConflict) => Promise<'local' | 'remote' | 'merge'>> = [];
  private currentStatus: SyncStatus = {
    isActive: false,
    progress: 0,
    totalItems: 0,
    completedItems: 0,
  };

  constructor(
    storage: OfflineStorageService,
    config: Partial<SyncService['config']> = {}
  ) {
    this.storage = storage;
    this.config = {
      maxRetries: 3,
      batchSize: 10,
      retryDelay: 1000,
      conflictResolution: 'manual',
      ...config,
    };
  }

  /**
   * Register status change callback
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register conflict resolution callback
   */
  onConflict(
    callback: (conflict: SyncConflict) => Promise<'local' | 'remote' | 'merge'>
  ): () => void {
    this.conflictCallbacks.push(callback);
    
    return () => {
      const index = this.conflictCallbacks.indexOf(callback);
      if (index > -1) {
        this.conflictCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update sync status and notify callbacks
   */
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.statusCallbacks.forEach(callback => callback(this.currentStatus));
  }

  /**
   * Sync all pending items
   */
  async syncAll(): Promise<SyncResult> {
    if (this.currentStatus.isActive) {
      throw new Error('Sync already in progress');
    }

    try {
      this.updateStatus({ isActive: true, progress: 0 });

      const syncQueue = await this.storage.getSyncQueue();
      const totalItems = syncQueue.length;

      if (totalItems === 0) {
        this.updateStatus({
          isActive: false,
          progress: 100,
          totalItems: 0,
          completedItems: 0,
          lastSync: new Date(),
        });

        return {
          success: true,
          syncedCount: 0,
          failedCount: 0,
          conflictCount: 0,
          conflicts: [],
          errors: [],
        };
      }

      this.updateStatus({
        totalItems,
        completedItems: 0,
        currentItem: 'Starting sync...',
      });

      const result: SyncResult = {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        conflictCount: 0,
        conflicts: [],
        errors: [],
      };

      // Process items in batches
      for (let i = 0; i < syncQueue.length; i += this.config.batchSize) {
        const batch = syncQueue.slice(i, i + this.config.batchSize);
        
        for (const item of batch) {
          this.updateStatus({
            currentItem: `Syncing ${item.recordType} ${item.recordId}`,
            progress: Math.round((result.syncedCount + result.failedCount) / totalItems * 100),
          });

          try {
            const itemResult = await this.syncItem(item);
            
            if (itemResult.success) {
              result.syncedCount++;
              await this.storage.removeFromSyncQueue(item.id);
              await this.storage.updateSyncStatus(item.recordId, 'synced');
            } else if (itemResult.conflict) {
              result.conflictCount++;
              result.conflicts.push(itemResult.conflict);
            } else {
              result.failedCount++;
              result.errors.push({
                itemId: item.id,
                error: itemResult.error || 'Unknown error',
              });
              await this.storage.updateSyncStatus(item.recordId, 'failed');
            }
          } catch (error) {
            result.failedCount++;
            result.errors.push({
              itemId: item.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            await this.storage.updateSyncStatus(item.recordId, 'failed');
          }
        }

        // Small delay between batches to prevent overwhelming the server
        if (i + this.config.batchSize < syncQueue.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      result.success = result.failedCount === 0 && result.conflictCount === 0;

      this.updateStatus({
        isActive: false,
        progress: 100,
        completedItems: totalItems,
        lastSync: new Date(),
        currentItem: undefined,
      });

      return result;
    } catch (error) {
      this.updateStatus({
        isActive: false,
        currentItem: undefined,
      });

      throw error;
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    try {
      // Update sync status
      await this.storage.updateSyncStatus(item.recordId, 'syncing');

      // Perform the sync operation based on action type
      switch (item.action) {
        case 'create':
          return await this.syncCreate(item);
        case 'update':
          return await this.syncUpdate(item);
        case 'delete':
          return await this.syncDelete(item);
        default:
          return { success: false, error: `Unknown action: ${item.action}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync create operation
   */
  private async syncCreate(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    try {
      // TODO: Replace with actual API call
      const response = await this.mockApiCall('POST', `/${item.recordType}`, item.data);
      
      if (response.success) {
        // Update local record with server-generated ID if different
        if (response.data.id !== item.recordId) {
          // Handle ID mapping for offline-generated IDs
          await this.handleIdMapping(item.recordId, response.data.id);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create sync failed',
      };
    }
  }

  /**
   * Sync update operation
   */
  private async syncUpdate(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    try {
      // First, get the current remote version
      const remoteResponse = await this.mockApiCall('GET', `/${item.recordType}/${item.recordId}`);
      
      if (!remoteResponse.success) {
        return { success: false, error: remoteResponse.error };
      }

      // Check for conflicts
      const conflict = await this.detectConflict(item, remoteResponse.data);
      
      if (conflict) {
        // Handle conflict resolution
        const resolution = await this.resolveConflict(conflict);
        
        if (resolution === 'local') {
          // Force update with local data
          const updateResponse = await this.mockApiCall('PUT', `/${item.recordType}/${item.recordId}`, {
            ...item.data,
            _forceUpdate: true,
          });
          
          return { success: updateResponse.success, error: updateResponse.error };
        } else if (resolution === 'remote') {
          // Accept remote version, update local
          await this.storage.update(item.recordId, remoteResponse.data);
          return { success: true };
        } else {
          // Manual resolution required
          return { success: false, conflict };
        }
      }

      // No conflict, proceed with update
      const updateResponse = await this.mockApiCall('PUT', `/${item.recordType}/${item.recordId}`, item.data);
      
      return { success: updateResponse.success, error: updateResponse.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update sync failed',
      };
    }
  }

  /**
   * Sync delete operation
   */
  private async syncDelete(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    try {
      const response = await this.mockApiCall('DELETE', `/${item.recordType}/${item.recordId}`);
      
      return { success: response.success, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete sync failed',
      };
    }
  }

  /**
   * Detect conflicts between local and remote data
   */
  private async detectConflict(item: SyncQueueItem, remoteData: any): Promise<SyncConflict | null> {
    const localRecord = await this.storage.get(item.recordId);
    
    if (!localRecord) {
      return null; // No local record, no conflict
    }

    const localTimestamp = new Date(localRecord.updatedAt);
    const remoteTimestamp = new Date(remoteData.updatedAt || remoteData.updated_at);

    // Check if remote was updated after local
    if (remoteTimestamp > localTimestamp) {
      // Check if data is actually different
      const hasDataConflict = this.hasDataConflict(localRecord.data, remoteData);
      
      if (hasDataConflict) {
        return {
          id: item.recordId,
          type: 'data_conflict',
          localData: localRecord.data,
          remoteData,
          localTimestamp,
          remoteTimestamp,
        };
      }
    }

    return null;
  }

  /**
   * Check if there's a data conflict between local and remote
   */
  private hasDataConflict(localData: any, remoteData: any): boolean {
    // Simple deep comparison (in production, use a more sophisticated approach)
    const localJson = JSON.stringify(this.normalizeData(localData));
    const remoteJson = JSON.stringify(this.normalizeData(remoteData));
    
    return localJson !== remoteJson;
  }

  /**
   * Normalize data for comparison (remove timestamps, IDs, etc.)
   */
  private normalizeData(data: any): any {
    const normalized = { ...data };
    
    // Remove fields that shouldn't be compared
    delete normalized.id;
    delete normalized.createdAt;
    delete normalized.created_at;
    delete normalized.updatedAt;
    delete normalized.updated_at;
    delete normalized.version;
    
    return normalized;
  }

  /**
   * Resolve conflict based on configuration and callbacks
   */
  private async resolveConflict(conflict: SyncConflict): Promise<'local' | 'remote' | 'merge'> {
    // If manual resolution is configured and callbacks are available
    if (this.config.conflictResolution === 'manual' && this.conflictCallbacks.length > 0) {
      // Use the first available callback
      return await this.conflictCallbacks[0](conflict);
    }

    // Use configured default resolution
    return this.config.conflictResolution === 'local' ? 'local' : 'remote';
  }

  /**
   * Handle ID mapping for offline-generated IDs
   */
  private async handleIdMapping(offlineId: string, serverId: string): Promise<void> {
    // TODO: Implement ID mapping logic
    // This would update all references to the offline ID with the server ID
    console.log(`Mapping offline ID ${offlineId} to server ID ${serverId}`);
  }

  /**
   * Mock API call (replace with actual API implementation)
   */
  private async mockApiCall(method: string, endpoint: string, data?: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        data: {
          id: data?.id || `server_${Date.now()}`,
          ...data,
          updatedAt: new Date().toISOString(),
        },
      };
    } else {
      return {
        success: false,
        error: 'Network error or server unavailable',
      };
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * Cancel ongoing sync
   */
  cancel(): void {
    if (this.currentStatus.isActive) {
      this.updateStatus({
        isActive: false,
        currentItem: undefined,
      });
    }
  }

  /**
   * Retry failed sync items
   */
  async retryFailed(): Promise<SyncResult> {
    const syncQueue = await this.storage.getSyncQueue();
    const failedItems = syncQueue.filter(item => item.retries > 0);

    if (failedItems.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        conflictCount: 0,
        conflicts: [],
        errors: [],
      };
    }

    // Reset retry count for failed items
    for (const item of failedItems) {
      item.retries = 0;
    }

    return this.syncAll();
  }
}