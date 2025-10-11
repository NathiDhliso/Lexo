import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

export interface AsyncButtonProps extends Omit<ButtonProps, 'onClick'> {
  onAsyncClick: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Button Component
 * 
 * A comprehensive button component that follows the LexoHub design system
 * with Mpondo Gold and Judicial Blue theme colors.
 * 
 * Features:
 * - Multiple variants (primary, secondary, ghost, danger, success)
 * - Three sizes (sm, md, lg) with proper touch targets
 * - Loading states with spinner
 * - Icon support with positioning
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Responsive design with mobile-first approach
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * 
 * <Button variant="secondary" icon={<PlusIcon />} iconPosition="left">
 *   Add Item
 * </Button>
 * 
 * <Button variant="danger" loading={isDeleting}>
 *   Delete
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      ariaLabel,
      ariaExpanded,
      ariaHasPopup,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons
    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'rounded-lg font-medium',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'cursor-pointer',
      'select-none'
    );

    // Variant-specific classes with theme colors
    const variantClasses = {
      primary: cn(
        'bg-judicial-blue-900 text-white',
        'hover:bg-judicial-blue-800 active:bg-judicial-blue-700',
        'focus-visible:ring-judicial-blue-400',
        'dark:bg-judicial-blue-700 dark:hover:bg-judicial-blue-600',
        loading && 'bg-judicial-blue-800 cursor-wait'
      ),
      secondary: cn(
        'bg-mpondo-gold-500 text-white',
        'hover:bg-mpondo-gold-600 active:bg-mpondo-gold-700',
        'focus-visible:ring-mpondo-gold-400',
        'dark:bg-mpondo-gold-400 dark:text-neutral-900 dark:hover:bg-mpondo-gold-300',
        loading && 'bg-mpondo-gold-600 cursor-wait'
      ),
      ghost: cn(
        'bg-transparent text-judicial-blue-900',
        'border border-judicial-blue-900',
        'hover:bg-judicial-blue-900 hover:text-white',
        'active:bg-judicial-blue-800',
        'focus-visible:ring-judicial-blue-400',
        'dark:text-judicial-blue-400 dark:border-judicial-blue-400',
        'dark:hover:bg-judicial-blue-400 dark:hover:text-neutral-900',
        loading && 'bg-judicial-blue-100 cursor-wait dark:bg-judicial-blue-900/20'
      ),
      danger: cn(
        'bg-status-error-600 text-white',
        'hover:bg-status-error-700 active:bg-status-error-800',
        'focus-visible:ring-status-error-400',
        'dark:bg-status-error-500 dark:hover:bg-status-error-600',
        loading && 'bg-status-error-700 cursor-wait'
      ),
      success: cn(
        'bg-status-success-600 text-white',
        'hover:bg-status-success-700 active:bg-status-success-800',
        'focus-visible:ring-status-success-400',
        'dark:bg-status-success-500 dark:hover:bg-status-success-600',
        loading && 'bg-status-success-700 cursor-wait'
      ),
    };

    // Size classes with proper touch targets (minimum 44x44px for accessibility)
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px] gap-1.5',
      md: 'px-4 py-2 text-base min-h-[44px] gap-2',
      lg: 'px-6 py-3 text-lg min-h-[48px] gap-2.5',
    };

    // Icon size based on button size
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    // Full width class
    const widthClass = fullWidth ? 'w-full' : '';

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className={cn('animate-spin', iconSizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Render icon with proper sizing
    const renderIcon = (iconNode: React.ReactNode) => {
      if (!iconNode) return null;
      return (
        <span className={cn(iconSizeClasses[size], 'flex-shrink-0')} aria-hidden="true">
          {iconNode}
        </span>
      );
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClass,
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        aria-busy={loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && icon && iconPosition === 'left' && renderIcon(icon)}
        {children}
        {!loading && icon && iconPosition === 'right' && renderIcon(icon)}
      </button>
    );
  }
);

Button.displayName = 'Button';
