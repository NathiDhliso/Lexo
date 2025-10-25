/**
 * InvitationStatusBadge Component
 * Displays invitation status with appropriate colors and icons
 */
import React from 'react';
import { Badge } from '../design-system/components';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail
} from 'lucide-react';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'declined' | 'sent';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  className?: string;
  showIcon?: boolean;
  expiresAt?: string;
}

interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  icon: React.ElementType;
  ariaLabel: string;
}

const getStatusConfig = (status: InvitationStatus): StatusConfig => {
  const configs: Record<InvitationStatus, StatusConfig> = {
    pending: {
      label: 'Pending',
      variant: 'warning',
      icon: Clock,
      ariaLabel: 'Invitation is pending acceptance'
    },
    sent: {
      label: 'Sent',
      variant: 'info',
      icon: Mail,
      ariaLabel: 'Invitation has been sent'
    },
    accepted: {
      label: 'Accepted',
      variant: 'success',
      icon: CheckCircle,
      ariaLabel: 'Invitation has been accepted'
    },
    expired: {
      label: 'Expired',
      variant: 'error',
      icon: AlertCircle,
      ariaLabel: 'Invitation has expired'
    },
    declined: {
      label: 'Declined',
      variant: 'default',
      icon: XCircle,
      ariaLabel: 'Invitation was declined'
    }
  };

  return configs[status];
};

const getTooltipText = (status: InvitationStatus, expiresAt?: string): string => {
  if (status === 'pending' && expiresAt) {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      return `Expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`;
    }
  }
  
  const tooltips: Record<InvitationStatus, string> = {
    pending: 'Waiting for attorney to accept invitation',
    sent: 'Invitation link has been generated and sent',
    accepted: 'Attorney has registered and accepted the invitation',
    expired: 'Invitation link has expired and can no longer be used',
    declined: 'Attorney declined the invitation'
  };
  
  return tooltips[status];
};

export const InvitationStatusBadge: React.FC<InvitationStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
  expiresAt
}) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const tooltipText = getTooltipText(status, expiresAt);

  return (
    <div className="relative group inline-block">
      <Badge
        variant={config.variant}
        className={`inline-flex items-center gap-1.5 ${className}`}
        aria-label={config.ariaLabel}
      >
        {showIcon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
        <span>{config.label}</span>
      </Badge>
      
      {/* Tooltip */}
      <div
        className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-3 py-2 bg-neutral-900 dark:bg-neutral-800 text-white text-xs rounded-lg
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-200 whitespace-nowrap z-10
          shadow-lg
        "
        role="tooltip"
      >
        {tooltipText}
        {/* Tooltip Arrow */}
        <div
          className="
            absolute top-full left-1/2 transform -translate-x-1/2
            w-0 h-0 border-l-4 border-r-4 border-t-4
            border-l-transparent border-r-transparent border-t-neutral-900 dark:border-t-neutral-800
          "
        />
      </div>
    </div>
  );
};
