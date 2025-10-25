/**
 * ConnectionVerificationStep Component
 * Step 2 of cloud storage setup - Verify connection
 * Tests connection and displays success/error messages
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import { Button } from '../design-system/components';
import { CLOUD_STORAGE_PROVIDERS } from '../../config/cloud-storage-providers.config';
import { CloudStorageService } from '../../services/api/cloud-storage.service';
import type { CloudStorageProvider } from '../../types/cloud-storage.types';

interface ConnectionVerificationStepProps {
  provider?: CloudStorageProvider;
  isConnecting?: boolean;
  isSuccess?: boolean;
  error?: string;
  onRetry: () => void;
}

export const ConnectionVerificationStep: React.FC<ConnectionVerificationStepProps> = ({
  provider,
  isConnecting,
  isSuccess,
  error,
  onRetry
}) => {
  const [connectionState, setConnectionState] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    if (provider && !isConnecting) {
      verifyConnection();
    }
  }, [provider, isConnecting]);

  const verifyConnection = async () => {
    if (!provider) return;

    setConnectionState('checking');
    setConnectionError('');

    try {
      // Check if connection was successfully established
      const connections = await CloudStorageService.getConnections();
      const recentConnection = connections.find(c => 
        c.provider === provider && 
        c.isActive &&
        new Date(c.createdAt).getTime() > Date.now() - 60000 // Created in last minute
      );

      if (recentConnection) {
        setConnectionState('success');
      } else {
        setConnectionState('error');
        setConnectionError('Connection not established. Please try again.');
      }
    } catch (err) {
      setConnectionState('error');
      setConnectionError(err instanceof Error ? err.message : 'Failed to verify connection');
    }
  };

  if (!provider) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">No provider selected</p>
      </div>
    );
  }

  const providerInfo = CLOUD_STORAGE_PROVIDERS[provider];
  const currentError = error || connectionError;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{providerInfo.icon}</div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {providerInfo.name}
        </h3>
      </div>

      {/* Connecting State */}
      {(isConnecting || connectionState === 'checking') && (
        <div className="text-center py-8">
          <Loader className="w-12 h-12 text-judicial-blue-500 animate-spin mx-auto mb-4" />
          <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Connecting to {providerInfo.name}
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Please complete the authentication in the popup window...
          </p>
        </div>
      )}

      {/* Success State */}
      {connectionState === 'success' && !isConnecting && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-status-success-100 dark:bg-status-success-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-status-success-600 dark:text-status-success-400" />
          </div>
          <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Connection Successful!
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Your {providerInfo.name} account has been connected successfully.
          </p>
          
          <div className="bg-status-success-50 dark:bg-status-success-950/20 border border-status-success-200 dark:border-status-success-800 rounded-lg p-4 max-w-md mx-auto">
            <h5 className="text-sm font-medium text-status-success-900 dark:text-status-success-100 mb-2">
              What's next?
            </h5>
            <ul className="space-y-1 text-xs text-status-success-800 dark:text-status-success-200 text-left">
              <li>• Link documents to matters</li>
              <li>• Access files directly from cloud storage</li>
              <li>• Keep files synced across devices</li>
            </ul>
          </div>
        </div>
      )}

      {/* Error State */}
      {connectionState === 'error' && !isConnecting && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-status-error-100 dark:bg-status-error-900/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-status-error-600 dark:text-status-error-400" />
          </div>
          <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Connection Failed
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            {currentError || 'Unable to connect to your cloud storage account.'}
          </p>
          
          <div className="bg-status-error-50 dark:bg-status-error-950/20 border border-status-error-200 dark:border-status-error-800 rounded-lg p-4 max-w-md mx-auto mb-6">
            <h5 className="text-sm font-medium text-status-error-900 dark:text-status-error-100 mb-2">
              Troubleshooting Tips:
            </h5>
            <ul className="space-y-1 text-xs text-status-error-800 dark:text-status-error-200 text-left">
              <li>• Make sure you completed the authentication</li>
              <li>• Check if you granted the required permissions</li>
              <li>• Disable popup blockers and try again</li>
              <li>• Clear your browser cache and cookies</li>
            </ul>
          </div>

          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}

      {/* Idle State */}
      {connectionState === 'idle' && !isConnecting && (
        <div className="text-center py-8">
          <p className="text-neutral-600 dark:text-neutral-400">
            Click the button below to start the connection process
          </p>
        </div>
      )}
    </div>
  );
};
