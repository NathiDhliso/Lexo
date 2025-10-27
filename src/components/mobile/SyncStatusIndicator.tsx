/**
 * SyncStatusIndicator Component
 * 
 * Visual indicator for sync status with progress and connection state.
 * Shows sync progress, pending items count, and offline status.
 * 
 * Requirements: 11.5
 */
import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SyncStatusIndicatorProps {
  isOnline: boolean;
  isActive: boolean;
  progress: number;
  pendingCount: number;
  failedCount: number;
  lastSync?: Date;
  currentItem?: string;
  onSync?: () => void;
  onRetryFailed?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * SyncStatusIndicator Component
 * 
 * Features:
 * - Real-time sync progress display
 * - Online/offline status indicator
 * - Pending and failed items count
 * - Manual sync trigger
 * - Retry failed items
 * - Compact mode for mobile headers
 * 
 * @example
 * ```tsx
 * <SyncStatusIndicator
 *   isOnline={isOnline}
 *   isActive={syncStatus.isActive}
 *   progress={syncStatus.progress}
 *   pendingCount={stats?.pendingSyncItems || 0}
 *   failedCount={stats?.failedSyncItems || 0}
 *   onSync={handleSync}
 *   compact={true}
 * />
 * ```
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isOnline,
  isActive,
  progress,
  pendingCount,
  failedCount,
  lastSync,
  currentItem,
  onSync,
  onRetryFailed,
  className,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>('');

  // Update last sync text
  useEffect(() => {
    if (!lastSync) {
      setLastSyncText('Never synced');
      return;
    }

    const updateText = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastSync.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) {
        setLastSyncText('Just now');
      } else if (diffMinutes < 60) {
        setLastSyncText(`${diffMinutes}m ago`);
      } else if (diffHours < 24) {
        setLastSyncText(`${diffHours}h ago`);
      } else {
        setLastSyncText(`${diffDays}d ago`);
      }
    };

    updateText();
    const interval = setInterval(updateText, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSync]);

  // Get status icon and color
  const getStatusIcon = () => {
    if (!isOnline) {
      return { icon: WifiOff, color: 'text-red-500' };
    }
    
    if (isActive) {
      return { icon: RefreshCw, color: 'text-blue-500' };
    }
    
    if (failedCount > 0) {
      return { icon: AlertCircle, color: 'text-red-500' };
    }
    
    if (pendingCount > 0) {
      return { icon: Clock, color: 'text-orange-500' };
    }
    
    return { icon: CheckCircle, color: 'text-green-500' };
  };

  const { icon: StatusIcon, color } = getStatusIcon();

  // Get status text
  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    
    if (isActive) {
      return currentItem || 'Syncing...';
    }
    
    if (failedCount > 0) {
      return `${failedCount} failed`;
    }
    
    if (pendingCount > 0) {
      return `${pendingCount} pending`;
    }
    
    return 'Up to date';
  };

  // Compact mode for mobile headers
  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-metallic-gray-800',
          'mobile-touch-target',
          className
        )}
        aria-label="Sync status"
      >
        <StatusIcon className={cn('w-4 h-4', color, isActive && 'animate-spin')} />
        
        {(pendingCount > 0 || failedCount > 0) && (
          <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {pendingCount + failedCount}
          </span>
        )}

        {/* Details Popup */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-xl shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Sync Status
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(false);
                  }}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-metallic-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn('w-4 h-4', color, isActive && 'animate-spin')} />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {getStatusText()}
                  </span>
                </div>

                {isActive && (
                  <div className="space-y-2">
                    <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {progress}% complete
                    </p>
                  </div>
                )}

                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Last sync: {lastSyncText}
                </div>

                {(onSync || onRetryFailed) && (
                  <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-metallic-gray-700">
                    {onSync && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSync();
                          setShowDetails(false);
                        }}
                        disabled={isActive || !isOnline}
                        className="flex-1"
                      >
                        Sync Now
                      </Button>
                    )}
                    
                    {onRetryFailed && failedCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryFailed();
                          setShowDetails(false);
                        }}
                        disabled={isActive || !isOnline}
                        className="flex-1"
                      >
                        Retry Failed
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </button>
    );
  }

  // Full mode for detailed display
  return (
    <div className={cn('bg-white dark:bg-metallic-gray-800 rounded-xl border border-neutral-200 dark:border-metallic-gray-700 p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
          Sync Status
        </h3>
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('w-5 h-5', color, isActive && 'animate-spin')} />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-3">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {isOnline ? 'Connected' : 'Working offline'}
        </span>
      </div>

      {/* Sync Progress */}
      {isActive && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Progress
            </span>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-metallic-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {currentItem && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              {currentItem}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {pendingCount}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Pending
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {failedCount}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Failed
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Last sync
          </div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {lastSyncText}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(onSync || onRetryFailed) && (
        <div className="flex gap-2">
          {onSync && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSync}
              disabled={isActive || !isOnline}
              className="flex-1"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync Now
            </Button>
          )}
          
          {onRetryFailed && failedCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetryFailed}
              disabled={isActive || !isOnline}
              className="flex-1"
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Retry Failed
            </Button>
          )}
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Working Offline
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                Changes will sync automatically when connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};