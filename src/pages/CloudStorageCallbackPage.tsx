import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CloudStorageService } from '@/services/api/cloud-storage.service';
import type { CloudStorageProvider } from '@/types/cloud-storage.types';
import { toast } from 'react-hot-toast';

export const CloudStorageCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(error);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }

      // Decode state to get provider and redirect URL
      const stateData = JSON.parse(atob(state));
      const provider: CloudStorageProvider = stateData.provider;
      const redirectUrl = stateData.redirectUrl || '/settings';

      // Handle OAuth callback
      await CloudStorageService.handleOAuthCallback(provider, code, state);

      setStatus('success');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate(redirectUrl);
      }, 2000);
    } catch (err) {
      console.error('OAuth callback error:', err);
      const message = err instanceof Error ? err.message : 'Failed to connect cloud storage';
      setError(message);
      setStatus('error');
      toast.error(message);

      // Redirect to settings after delay
      setTimeout(() => {
        navigate('/settings');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connecting Cloud Storage
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we complete the connection...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 dark:text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Successfully Connected!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your cloud storage has been connected. Redirecting...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 dark:text-red-400 text-6xl mb-4">✕</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to settings...
            </p>
          </>
        )}
      </div>
    </div>
  );
};
