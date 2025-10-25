/**
 * MatterStatusBadge Component
 * Reusable status badge for matter status display
 * Shows status with appropriate colors and accessibility labels
 */
import React from 'react';
import { Badge } from '../design-system/components';
import { MatterStatus } from '../../types';
import {
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface MatterStatusBadgeProps {
  status: MatterStatus;
  className?: string;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  icon: React.ElementType;
  ariaLabel: string;
}

const getStatusConfig = (status: MatterStatus): StatusConfig => {
  const configs: Record<MatterStatus, StatusConfig> = {
    [MatterStatus.ACTIVE]: {
      label: 'Active',
      variant: 'success',
      icon: CheckCircle,
      ariaLabel: 'Matter is currently active'
    },
    [MatterStatus.PENDING]: {
      label: 'Pending',
      variant: 'warning',
      icon: Clock,
      ariaLabel: 'Matter is pending'
    },
    [MatterStatus.NEW_REQUEST]: {
      label: 'New Request',
      variant: 'info',
      icon: Sparkles,
      ariaLabel: 'New matter request'
    },
    [MatterStatus.ON_HOLD]: {
      label: 'On Hold',
      variant: 'warning',
      icon: Pause,
      ariaLabel: 'Matter is on hold'
    },
    [MatterStatus.SETTLED]: {
      label: 'Settled',
      variant: 'success',
      icon: CheckCircle,
      ariaLabel: 'Matter has been settled'
    },
    [MatterStatus.CLOSED]: {
      label: 'Closed',
      variant: 'default',
      icon: XCircle,
      ariaLabel: 'Matter is closed'
    }
  };

  return configs[status] || {
    label: status,
    variant: 'default',
    icon: AlertTriangle,
    ariaLabel: `Matter status: ${status}`
  };
};

export const MatterStatusBadge: React.FC<MatterStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true
}) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label={config.ariaLabel}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{config.label}</span>
    </Badge>
  );
};
