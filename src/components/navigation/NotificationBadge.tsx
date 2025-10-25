import React from 'react';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const variantStyles = {
    default: 'bg-neutral-500 text-white',
    primary: 'bg-judicial-blue-500 text-white',
    warning: 'bg-status-warning-500 text-white',
    error: 'bg-status-error-500 text-white',
  };

  const sizeStyles = {
    sm: 'h-5 min-w-[20px] text-xs px-1.5',
    md: 'h-6 min-w-[24px] text-sm px-2',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};
