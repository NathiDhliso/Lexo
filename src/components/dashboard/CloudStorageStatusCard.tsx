import React from 'react';
import { Cloud, CloudOff, AlertCircle, Settings } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../design-system/components';

interface CloudStorageStatusCardProps {
  isConnected: boolean;
  provider?: string;
  lastSync?: Date;
  onConfigure: () => void;
}

export const CloudStorageStatusCard: React.FC<CloudStorageStatusCardProps> = ({
  isConnected,
  provider,
  lastSync,
  onConfigure,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Cloud className="w-5 h-5 text-status-success-600" />
          ) : (
            <CloudOff className="w-5 h-5 text-status-error-600" />
          )}
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Cloud Storage
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Status</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-status-success-500"></span>
                  <span className="text-sm font-medium text-status-success-600 dark:text-status-success-400">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-status-error-500"></span>
                  <span className="text-sm font-medium text-status-error-600 dark:text-status-error-400">
                    Disconnected
                  </span>
                </>
              )}
            </div>
          </div>
          
          {provider && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Provider</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {provider}
              </span>
            </div>
          )}
          
          {lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Last Sync</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {lastSync.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {!isConnected && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-status-warning-50 dark:bg-status-warning-900/20">
              <AlertCircle className="w-4 h-4 text-status-warning-600 mt-0.5" />
              <p className="text-xs text-status-warning-700 dark:text-status-warning-400">
                Connect cloud storage to link documents to matters
              </p>
            </div>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfigure}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isConnected ? 'Manage' : 'Configure'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
