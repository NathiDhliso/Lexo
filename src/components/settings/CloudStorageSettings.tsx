import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AsyncButton } from '@/components/ui/AsyncButton';
import { Modal } from '@/components/ui/Modal';
import { CloudStorageService } from '@/services/api/cloud-storage.service';
import { CLOUD_STORAGE_PROVIDERS } from '@/config/cloud-storage-providers.config';
import type { CloudStorageConnection, CloudStorageProvider } from '@/types/cloud-storage.types';
import { toast } from 'react-hot-toast';

export const CloudStorageSettings: React.FC = () => {
  const [connections, setConnections] = useState<CloudStorageConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await CloudStorageService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error('Error loading connections:', error);
      // Don't show error toast - user might not have permissions set up yet
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider: CloudStorageProvider) => {
    CloudStorageService.initiateOAuth(provider);
  };

  const handleSetPrimary = async (connectionId: string) => {
    try {
      await CloudStorageService.setPrimaryConnection(connectionId);
      await loadConnections();
    } catch (error) {
      console.error('Error setting primary:', error);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await CloudStorageService.disconnect(connectionId);
      await loadConnections();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection? This will not delete your files.')) {
      return;
    }

    try {
      await CloudStorageService.deleteConnection(connectionId);
      await loadConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      await CloudStorageService.syncAllDocuments(connectionId);
      toast.success('Sync completed');
    } catch (error) {
      console.error('Error syncing:', error);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Storage</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Connect your cloud storage accounts to store documents
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add Storage Provider
        </Button>
      </div>

      {/* Connected Providers */}
      {connections.length > 0 ? (
        <div className="space-y-4">
          {connections.map((connection) => {
            const provider = CLOUD_STORAGE_PROVIDERS[connection.provider];
            
            return (
              <div
                key={connection.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{provider.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        {connection.isPrimary && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 rounded">
                            Primary
                          </span>
                        )}
                        {!connection.isActive && (
                          <span className="px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded">
                            Disconnected
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {connection.providerAccountEmail || connection.providerAccountName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Connected {new Date(connection.createdAt).toLocaleDateString()}
                      </p>
                      {connection.lastSyncAt && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          Last synced {new Date(connection.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {connection.isActive && !connection.isPrimary && (
                      <AsyncButton
                        variant="secondary"
                        size="sm"
                        onAsyncClick={() => handleSetPrimary(connection.id)}
                      >
                        Set as Primary
                      </AsyncButton>
                    )}
                    {connection.isActive && (
                      <AsyncButton
                        variant="secondary"
                        size="sm"
                        onAsyncClick={() => handleSync(connection.id)}
                      >
                        Sync Now
                      </AsyncButton>
                    )}
                    {connection.isActive ? (
                      <AsyncButton
                        variant="secondary"
                        size="sm"
                        onAsyncClick={() => handleDisconnect(connection.id)}
                      >
                        Disconnect
                      </AsyncButton>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConnect(connection.provider)}
                      >
                        Reconnect
                      </Button>
                    )}
                    <AsyncButton
                      variant="danger"
                      size="sm"
                      onAsyncClick={() => handleDelete(connection.id)}
                    >
                      Delete
                    </AsyncButton>
                  </div>
                </div>

                {connection.syncError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                    {connection.syncError}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-4">☁️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No cloud storage connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect a cloud storage provider to store your documents
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Connect Storage Provider
          </Button>
        </div>
      )}

      {/* Add Provider Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Connect Cloud Storage"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a cloud storage provider to connect your account
          </p>

          <div className="space-y-3">
            {Object.values(CLOUD_STORAGE_PROVIDERS).map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  if (provider.isAvailable) {
                    handleConnect(provider.id);
                  } else {
                    toast.error(`${provider.name} is not available yet`);
                  }
                }}
                disabled={!provider.isAvailable}
                className={`w-full flex items-start p-4 border rounded-lg text-left transition-colors ${
                  provider.isAvailable
                    ? 'border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl mr-4">{provider.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h4>
                    {!provider.isAvailable && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">Coming Soon</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {provider.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
