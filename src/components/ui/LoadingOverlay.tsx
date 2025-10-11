/**
 * LoadingOverlay Component
 * Full-screen or container loading overlay
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  fullScreen = false,
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white/80 dark:bg-metallic-gray-900/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Loading'}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingOverlay;
