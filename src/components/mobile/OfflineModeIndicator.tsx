/**
 * OfflineModeIndicator Component
 * 
 * Header indicator showing connection status and pending sync count.
 * Provides quick access to sync status and manual sync trigger.
 * 
 * Requirements: 11.5
 */
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface OfflineModeIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  isSync: boolean;
  lastSync?: Date;
  onSync?: () => void;
  onRetryFailed?: () => void;
  className?: string;
}

/**
 * OfflineModeIndicator Component
 * 
 * Features:
 * - Connection status display
 * - Pending sync items count
 * - Failed sync items count
 * - Expandable details panel
 * - Manual sync trigger
 * - Last sync timestamp
 * 
 * @example
 * ```tsx
 * <OfflineModeIndicator
 *   isOnline={isOnline}
 *   pendingCount={stats?.pendingSyncItems || 0}
 *   failedCount={stats?.failedSyncItems || 0}
 *   isSync={syncStatus.isActive}
 *   onSync={handleSync}
 * />
 * ```
 */
export const OfflineModeIndicator: React.FC<OfflineModeIndicatorProps> = ({
  isOnline,
  pendingCount,
  failedCount,
  isSync,
  lastSync,
  onSync,
  onRetryFailed,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Get status info
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
      };
    }

    if (isSync) {
      return {
        icon: RefreshCw,
        text: 'Syncing',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
      };
    }

    if (failedCount > 0) {
      return {
        icon: AlertTriangle,
        text: `${failedCount} failed`,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
      };
    }

    if (pendingCount > 0) {
      return {
        icon: Clock,
        text: `${pendingCount} pending`,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
      };
    }

    return {
      icon: CheckCircle,
      text: 'Up to date',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const totalItems = pendingCount + failedCount;

  // Format last sync time
  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
          'hover:shadow-sm active:scale-95',
          'mobile-touch-target',
          statusInfo.bgColor,
          statusInfo.borderColor
        )}
        aria-label="Connection status"
      >
        <StatusIcon 
          className={cn('w-4 h-4', statusInfo.color, isSync && 'animate-spin')} 
        />
        
        <span className={cn('text-sm font-medium', statusInfo.color)}>
          {statusInfo.text}
        </span>

        {totalItems > 0 && (
          <span className="bg-white dark:bg-metallic-gray-800 text-xs px-1.5 py-0.5 rounded-full border">
            {totalItems}
          </span>
        )}

        <ChevronDown 
          className={cn(
            'w-3 h-3 transition-transform',
            statusInfo.color,
            showDetails && 'rotate-180'
          )} 
        />
      </button>

      {/* Details Panel */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetails(false)}
          />
          
          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-xl shadow-lg z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Connection Status
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Details */}
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center gap-3">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {isOnline ? 'Connected' : 'Offline'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {isOnline 
                        ? 'All changes will sync immediately' 
                        : 'Changes saved locally for later sync'
                      }
                    </p>
                  </div>
                </div>

                {/* Sync Stats */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 dark:bg-metallic-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
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
                </div>

                {/* Last Sync */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Last sync:
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatLastSync(lastSync)}
                  </span>
                </div>

                {/* Sync Status */}
                {isSync && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Syncing changes...
                    </span>
                  </div>
                )}

                {/* Offline Message */}
                {!isOnline && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Working Offline
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                          Your changes are being saved locally and will sync automatically when you're back online.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(onSync || onRetryFailed) && isOnline && (
                  <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-metallic-gray-700">
                    {onSync && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onSync();
                          setShowDetails(false);
                        }}
                        disabled={isSync}
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
                        onClick={() => {
                          onRetryFailed();
                          setShowDetails(false);
                        }}
                        disabled={isSync}
                        className="flex-1"
                        icon={<AlertTriangle className="w-4 h-4" />}
                      >
                        Retry Failed
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};