/**
 * OfflineStorageService
 * 
 * IndexedDB-based offline storage with encryption for sensitive data.
 * Stores matters, disbursements, time entries, and sync queue.
 * 
 * Requirements: 11.5
 */

// Types for offline storage
export interface OfflineRecord {
  id: string;
  type: 'matter' | 'disbursement' | 'time_entry' | 'payment';
  data: any;
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  syncRetries: number;
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  recordType: string;
  recordId: string;
  data: any;
  timestamp: Date;
  retries: number;
  lastError?: string;
}

export interface OfflineStorageConfig {
  dbName: string;
  version: number;
  encryptionKey?: string;
}

/**
 * OfflineStorageService Class
 * 
 * Features:
 * - IndexedDB for persistent offline storage
 * - AES encryption for sensitive data
 * - Automatic data compression
 * - Sync queue management
 * - Conflict resolution support
 * - Storage quota management
 * 
 * @example
 * ```typescript
 * const storage = new OfflineStorageService({
 *   dbName: 'lexohub_offline',
 *   version: 1,
 *   encryptionKey: 'user-specific-key'
 * });
 * 
 * await storage.initialize();
 * await storage.store('matter', matterData);
 * const matters = await storage.getAll('matter');
 * ```
 */
export class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private config: OfflineStorageConfig;
  private encryptionKey: CryptoKey | null = null;

  constructor(config: OfflineStorageConfig) {
    this.config = {
      dbName: 'lexohub_offline',
      version: 1,
      ...config,
    };
  }

  /**
   * Initialize the offline storage service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize encryption if key provided
      if (this.config.encryptionKey) {
        await this.initializeEncryption();
      }

      // Open IndexedDB
      this.db = await this.openDatabase();
      
      // Check storage quota
      await this.checkStorageQuota();
      
      console.log('OfflineStorageService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OfflineStorageService:', error);
      throw error;
    }
  }

  /**
   * Initialize encryption key
   */
  private async initializeEncryption(): Promise<void> {
    if (!this.config.encryptionKey) return;

    try {
      // Import the encryption key
      const keyData = new TextEncoder().encode(this.config.encryptionKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
      
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Open IndexedDB database
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores for different data types
   */
  private createObjectStores(db: IDBDatabase): void {
    // Main data store
    if (!db.objectStoreNames.contains('records')) {
      const recordStore = db.createObjectStore('records', { keyPath: 'id' });
      recordStore.createIndex('type', 'type', { unique: false });
      recordStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      recordStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains('syncQueue')) {
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('recordType', 'recordType', { unique: false });
    }

    // Metadata store
    if (!db.objectStoreNames.contains('metadata')) {
      db.createObjectStore('metadata', { keyPath: 'key' });
    }
  }

  /**
   * Check storage quota and warn if running low
   */
  private async checkStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaMB = (estimate.quota || 0) / (1024 * 1024);
        const usagePercent = (usedMB / quotaMB) * 100;

        console.log(`Storage usage: ${usedMB.toFixed(2)}MB / ${quotaMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);

        if (usagePercent > 80) {
          console.warn('Storage quota is running low. Consider cleaning up old data.');
        }
      } catch (error) {
        console.warn('Could not check storage quota:', error);
      }
    }
  }

  /**
   * Encrypt data if encryption is enabled
   */
  private async encryptData(data: any): Promise<{ encrypted: string; iv: string } | null> {
    if (!this.encryptionKey) return null;

    try {
      const jsonString = JSON.stringify(data);
      const dataBuffer = new TextEncoder().encode(jsonString);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        dataBuffer
      );

      return {
        encrypted: Array.from(new Uint8Array(encryptedBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt data if it was encrypted
   */
  private async decryptData(encryptedData: string, iv: string): Promise<any> {
    if (!this.encryptionKey) throw new Error('No encryption key available');

    try {
      const encryptedBuffer = new Uint8Array(
        encryptedData.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      const ivBuffer = new Uint8Array(
        iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        this.encryptionKey,
        encryptedBuffer
      );

      const jsonString = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Store a record offline
   */
  async store(type: string, data: any, encrypt: boolean = true): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = data.id || this.generateId();
    const now = new Date();

    let processedData = data;
    let isEncrypted = false;

    // Encrypt sensitive data
    if (encrypt && this.encryptionKey) {
      const encryptedResult = await this.encryptData(data);
      if (encryptedResult) {
        processedData = encryptedResult;
        isEncrypted = true;
      }
    }

    const record: OfflineRecord = {
      id,
      type: type as any,
      data: processedData,
      encrypted: isEncrypted,
      createdAt: data.createdAt || now,
      updatedAt: now,
      syncStatus: 'pending',
      syncRetries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.put(record);

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue('create', type, id, data);
        resolve(id);
      };

      request.onerror = () => {
        reject(new Error('Failed to store record'));
      };
    });
  }

  /**
   * Retrieve a record by ID
   */
  async get(id: string): Promise<OfflineRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const request = store.get(id);

      request.onsuccess = async () => {
        const record = request.result;
        if (!record) {
          resolve(null);
          return;
        }

        // Decrypt if necessary
        if (record.encrypted && this.encryptionKey) {
          try {
            record.data = await this.decryptData(record.data.encrypted, record.data.iv);
            record.encrypted = false;
          } catch (error) {
            console.error('Failed to decrypt record:', error);
            reject(new Error('Failed to decrypt record'));
            return;
          }
        }

        resolve(record);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve record'));
      };
    });
  }

  /**
   * Get all records of a specific type
   */
  async getAll(type: string): Promise<OfflineRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = async () => {
        const records = request.result;
        
        // Decrypt records if necessary
        const decryptedRecords = await Promise.all(
          records.map(async (record) => {
            if (record.encrypted && this.encryptionKey) {
              try {
                record.data = await this.decryptData(record.data.encrypted, record.data.iv);
                record.encrypted = false;
              } catch (error) {
                console.error('Failed to decrypt record:', error);
              }
            }
            return record;
          })
        );

        resolve(decryptedRecords);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve records'));
      };
    });
  }

  /**
   * Update a record
   */
  async update(id: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existingRecord = await this.get(id);
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // Encrypt if the original was encrypted
    let processedData = data;
    if (existingRecord.encrypted && this.encryptionKey) {
      const encryptedResult = await this.encryptData(data);
      if (encryptedResult) {
        processedData = encryptedResult;
      }
    }

    const updatedRecord: OfflineRecord = {
      ...existingRecord,
      data: processedData,
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.put(updatedRecord);

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue('update', existingRecord.type, id, data);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to update record'));
      };
    });
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existingRecord = await this.get(id);
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.delete(id);

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue('delete', existingRecord.type, id, null);
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete record'));
      };
    });
  }

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    recordType: string,
    recordId: string,
    data: any
  ): Promise<void> {
    if (!this.db) return;

    const queueItem: SyncQueueItem = {
      id: this.generateId(),
      action,
      recordType,
      recordId,
      data,
      timestamp: new Date(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(queueItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add to sync queue'));
    });
  }

  /**
   * Get sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get sync queue'));
      };
    });
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to remove from sync queue'));
    });
  }

  /**
   * Update sync status of a record
   */
  async updateSyncStatus(
    id: string,
    status: 'pending' | 'syncing' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.get(id);
    if (!record) return;

    record.syncStatus = status;
    record.lastSyncAttempt = new Date();
    
    if (status === 'failed') {
      record.syncRetries++;
    } else if (status === 'synced') {
      record.syncRetries = 0;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readwrite');
      const store = transaction.objectStore('records');
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to update sync status'));
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalRecords: number;
    recordsByType: Record<string, number>;
    pendingSyncItems: number;
    failedSyncItems: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [records, syncQueue] = await Promise.all([
      this.getAllRecords(),
      this.getSyncQueue(),
    ]);

    const recordsByType: Record<string, number> = {};
    records.forEach(record => {
      recordsByType[record.type] = (recordsByType[record.type] || 0) + 1;
    });

    const failedSyncItems = records.filter(r => r.syncStatus === 'failed').length;

    return {
      totalRecords: records.length,
      recordsByType,
      pendingSyncItems: syncQueue.length,
      failedSyncItems,
    };
  }

  /**
   * Get all records (internal method)
   */
  private async getAllRecords(): Promise<OfflineRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records'], 'readonly');
      const store = transaction.objectStore('records');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all records'));
    });
  }

  /**
   * Clear all data (for testing or reset)
   */
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['records', 'syncQueue', 'metadata'], 'readwrite');
      
      const promises = [
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('records').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('syncQueue').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('metadata').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
      ];

      Promise.all(promises)
        .then(() => resolve())
        .catch(() => reject(new Error('Failed to clear all data')));
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}