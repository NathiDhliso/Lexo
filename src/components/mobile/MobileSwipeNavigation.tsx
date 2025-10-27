/**
 * MobileSwipeNavigation Component
 * 
 * Mobile navigation component with swipe gesture support.
 * Provides swipe-to-go-back and swipe-to-refresh functionality.
 * 
 * Requirements: 11.4
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SwipeGestureProvider } from '../../hooks/useSwipeGestures';
import { OfflineModeIndicator } from './OfflineModeIndicator';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface MobileSwipeNavigationProps {
  children: React.ReactNode;
  className?: string;
  enableGoBack?: boolean;
  enableRefresh?: boolean;
  onRefresh?: () => void;
  showBackButton?: boolean;
  showOfflineIndicator?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * MobileSwipeNavigation Component
 * 
 * Features:
 * - Swipe right to go back (with visual feedback)
 * - Pull down to refresh (with loading indicator)
 * - Touch-friendly animations
 * - Haptic feedback on supported devices
 * - Accessible navigation controls
 * 
 * @example
 * ```tsx
 * <MobileSwipeNavigation
 *   title="Matter Details"
 *   enableGoBack={true}
 *   enableRefresh={true}
 *   onRefresh={() => refetch()}
 * >
 *   <div>Page content</div>
 * </MobileSwipeNavigation>
 * ```
 */
export const MobileSwipeNavigation: React.FC<MobileSwipeNavigationProps> = ({
  children,
  className,
  enableGoBack = true,
  enableRefresh = false,
  onRefresh,
  showBackButton = true,
  showOfflineIndicator = true,
  title,
  subtitle,
}) => {
  const navigate = useNavigate();
  const { isOnline, stats, sync } = useOfflineStorage();

  // Handle swipe-to-go-back
  const handleSwipeToGoBack = () => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    navigate(-1);
  };

  // Handle pull-to-refresh
  const handleSwipeToRefresh = () => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    
    onRefresh?.();
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={cn('min-h-screen bg-neutral-50 dark:bg-metallic-gray-900', className)}>
      {/* Header */}
      {(showBackButton || title || showOfflineIndicator) && (
        <div className="sticky top-0 z-40 bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 safe-top">
          <div className="flex items-center gap-3 p-4">
            {/* Back Button */}
            {showBackButton && enableGoBack && (
              <button
                onClick={handleBackClick}
                className={cn(
                  "p-2 rounded-lg text-neutral-600 dark:text-neutral-400",
                  "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                  "active:bg-neutral-200 dark:active:bg-metallic-gray-700",
                  "transition-colors",
                  "mobile-touch-target"
                )}
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}

            {/* Title */}
            {title && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Offline Mode Indicator */}
            {showOfflineIndicator && (
              <OfflineModeIndicator
                isOnline={isOnline}
                pendingCount={stats?.pendingSyncItems || 0}
                failedCount={stats?.failedSyncItems || 0}
                isSync={false} // TODO: Get actual sync status
                onSync={sync}
              />
            )}

            {/* Refresh Button */}
            {enableRefresh && onRefresh && (
              <button
                onClick={handleSwipeToRefresh}
                className={cn(
                  "p-2 rounded-lg text-neutral-600 dark:text-neutral-400",
                  "hover:bg-neutral-100 dark:hover:bg-metallic-gray-800",
                  "active:bg-neutral-200 dark:active:bg-metallic-gray-700",
                  "transition-colors",
                  "mobile-touch-target"
                )}
                aria-label="Refresh"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Swipe Gesture Area */}
      <SwipeGestureProvider
        enableGoBack={enableGoBack}
        enableRefresh={enableRefresh}
        onSwipeToGoBack={handleSwipeToGoBack}
        onSwipeToRefresh={handleSwipeToRefresh}
        threshold={60}
        velocity={0.3}
        className="flex-1"
      >
        {/* Content */}
        <div className="relative">
          {/* Swipe Indicators */}
          {enableGoBack && (
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <div className="swipe-back-indicator opacity-0 transition-opacity duration-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full text-white text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Swipe to go back</span>
                </div>
              </div>
            </div>
          )}

          {enableRefresh && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
              <div className="swipe-refresh-indicator opacity-0 transition-opacity duration-200">
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-full text-white text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>Pull to refresh</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="min-h-screen">
            {children}
          </div>
        </div>
      </SwipeGestureProvider>


    </div>
  );
};

/**
 * MobilePageWrapper Component
 * 
 * Simplified wrapper for mobile pages with common swipe navigation patterns.
 */
interface MobilePageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  className?: string;
}

export const MobilePageWrapper: React.FC<MobilePageWrapperProps> = ({
  children,
  title,
  subtitle,
  onRefresh,
  className,
}) => {
  return (
    <MobileSwipeNavigation
      title={title}
      subtitle={subtitle}
      enableGoBack={true}
      enableRefresh={!!onRefresh}
      onRefresh={onRefresh}
      className={className}
    >
      <div className="p-4 safe-bottom">
        {children}
      </div>
    </MobileSwipeNavigation>
  );
};