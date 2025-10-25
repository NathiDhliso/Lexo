/**
 * CloudStorageEmptyState Component
 * Display when cloud storage is not configured
 * Shows setup guidance and benefits
 */
import React from 'react';
import { Cloud, CheckCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../design-system/components';

interface CloudStorageEmptyStateProps {
  onSetup: () => void;
}

export const CloudStorageEmptyState: React.FC<CloudStorageEmptyStateProps> = ({ onSetup }) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/20 flex items-center justify-center mx-auto mb-6">
          <Cloud className="w-10 h-10 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>

        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Connect Your Cloud Storage
        </h3>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
          Link your OneDrive, Google Drive, or Dropbox account to access and manage
          legal documents directly from LexoHub.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-status-success-600 dark:text-status-success-400 mb-2" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Seamless Access
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Access your documents without leaving LexoHub
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-status-success-600 dark:text-status-success-400 mb-2" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Keep Files Synced
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Changes sync automatically across all devices
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-status-success-600 dark:text-status-success-400 mb-2" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Your Files, Your Control
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Files stay in your cloud storage account
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={onSetup}>
            <Cloud className="w-5 h-5 mr-2" />
            Setup Cloud Storage
          </Button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-6">
          Secure connection • Your credentials are never stored • Easy to disconnect
        </p>
      </CardContent>
    </Card>
  );
};
