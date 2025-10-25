import React from 'react';

interface AttorneyAvatarProps {
  initials: string;
  name: string;
  role?: string;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AttorneyAvatar: React.FC<AttorneyAvatarProps> = ({
  initials,
  name,
  role,
  isActive,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const statusDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Avatar Circle */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          bg-firm-primary-100 dark:bg-firm-primary-900/30
          text-firm-primary-700 dark:text-firm-primary-300
          flex items-center justify-center
          font-semibold
          border-2 border-firm-primary-200 dark:border-firm-primary-800
          transition-transform group-hover:scale-110
        `}
      >
        {initials}
      </div>

      {/* Status Indicator */}
      <div
        className={`
          absolute -bottom-0.5 -right-0.5
          ${statusDotSizes[size]}
          rounded-full
          border-2 border-white dark:border-metallic-gray-900
          ${isActive ? 'bg-green-500' : 'bg-neutral-400 dark:bg-neutral-600'}
        `}
        aria-label={isActive ? 'Active' : 'Inactive'}
      />

      {/* Tooltip */}
      <div
        className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          px-3 py-2 bg-neutral-900 dark:bg-neutral-800 text-white text-sm rounded-lg
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-200 whitespace-nowrap z-10
          shadow-lg
        "
      >
        <div className="font-medium">{name}</div>
        {role && <div className="text-xs text-neutral-300">{role}</div>}
        <div className="text-xs text-neutral-400 mt-1">
          {isActive ? 'Active' : 'Inactive'}
        </div>
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
