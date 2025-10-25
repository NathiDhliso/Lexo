import React from 'react';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';

interface CloudStorageIndicatorProps {
  status: 'connected' | 'disconnected' | 'warning';
  provider?: string;
  lastSync?: Date;
  onClick?: () => void;
  className?: string;
}

export const CloudStorageIndicator: React.FC<CloudStorageIndicatorProps> = ({
  status,
  provider,
  lastSync,
  onClick,
  className = '',
}) => {
  const statusConfig = {
    connected: {
      icon: Cloud,
      color: 'text-status-success-600 dark:text-status-success-400',
      bgHover: 'hover:bg-status-success-50 dark:hover:bg-status-success-900/20',
      label: 'Connected',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-status-warning-600 dark:text-status-warning-400',
      bgHover: 'hover:bg-status-warning-50 dark:hover:bg-status-warning-900/20',
      label: 'Needs attention',
    },
    disconnected: {
      icon: CloudOff,
      color: 'text-status-error-600 dark:text-status-error-400',
      bgHover: 'hover:bg-status-error-50 dark:hover:bg-status-error-900/20',
      label: 'Disconnected',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const tooltipText = provider
    ? `${provider} - ${config.label}${lastSync ? ` (Last sync: ${lastSync.toLocaleTimeString()})` : ''}`
    : config.label;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${config.color} ${config.bgHover} ${className}`}
      aria-label={`Cloud storage ${status}`}
      title={tooltipText}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
