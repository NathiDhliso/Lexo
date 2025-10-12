import React from 'react';

export { Icon } from './Icon';
export { LoadingSpinner } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { Skeleton, SkeletonCard, SkeletonTable } from './SkeletonLoader';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'legal';
  density?: 'compact' | 'comfortable' | 'spacious';
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable, variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'bg-white dark:bg-metallic-gray-800 shadow dark:shadow-lg border border-transparent dark:border-metallic-gray-700',
    elevated: 'bg-white dark:bg-metallic-gray-800 shadow-lg dark:shadow-xl border border-transparent dark:border-metallic-gray-700',
    outlined: 'bg-white dark:bg-metallic-gray-800 border-2 border-neutral-300 dark:border-metallic-gray-600',
    legal: 'bg-white dark:bg-metallic-gray-800 border border-neutral-400 dark:border-metallic-gray-600 shadow-sm'
  };
  
  const hoverClass = hoverable ? 'hover:shadow-md dark:hover:shadow-xl transition-shadow duration-200 cursor-pointer' : '';
  
  return (
    <div className={`rounded-lg transition-colors duration-300 ${variantClasses[variant]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-6 pb-3 dark:text-neutral-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-6 dark:text-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  [key: string]: any;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = '', variant = 'primary', size = 'md', loading = false, ...props }, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer';
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-mpondo-gold-500 text-white hover:bg-mpondo-gold-600 active:bg-mpondo-gold-700 focus-visible:ring-mpondo-gold-400 dark:bg-mpondo-gold-400 dark:text-neutral-900 dark:hover:bg-mpondo-gold-300',
    secondary: 'bg-judicial-blue-900 text-white hover:bg-judicial-blue-800 active:bg-judicial-blue-700 focus-visible:ring-judicial-blue-400 dark:bg-judicial-blue-700 dark:hover:bg-judicial-blue-600',
    outline: 'border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-neutral-400 dark:border-metallic-gray-600 dark:text-neutral-200 dark:hover:bg-metallic-gray-800',
    ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400 dark:text-neutral-200 dark:hover:bg-metallic-gray-800',
    destructive: 'bg-status-error-600 text-white hover:bg-status-error-700 active:bg-status-error-800 focus-visible:ring-status-error-400 dark:bg-status-error-500 dark:hover:bg-status-error-600'
  };
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };
  
  return (
    <button 
      ref={ref}
      type="button"
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
});

interface InputProps {
  className?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 focus:border-mpondo-gold-500 dark:focus:border-mpondo-gold-400 hover:border-neutral-400 dark:hover:border-metallic-gray-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:disabled:bg-metallic-gray-800 transition-all duration-200 ${className}`} 
    {...props}
  />
);

interface SelectProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => (
  <select 
    className={`w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 focus:border-mpondo-gold-500 dark:focus:border-mpondo-gold-400 hover:border-neutral-400 dark:hover:border-metallic-gray-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:disabled:bg-metallic-gray-800 transition-all duration-200 ${className}`} 
    {...props}
  >
    {children}
  </select>
);

interface TextareaProps {
  className?: string;
  [key: string]: any;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => (
  <textarea 
    className={`w-full px-3 py-2.5 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 focus:border-mpondo-gold-500 dark:focus:border-mpondo-gold-400 hover:border-neutral-400 dark:hover:border-metallic-gray-500 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed dark:disabled:bg-metallic-gray-800 resize-vertical transition-all duration-200 ${className}`} 
    {...props}
  />
);

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  [key: string]: any;
}

export const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, size = 'md', className = '', ...props }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-4xl',
    '2xl': 'max-w-4xl sm:max-w-6xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block w-full ${sizeClasses[size]} p-6 sm:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-metallic-gray-800 theme-shadow-xl rounded-lg border border-neutral-200 dark:border-metallic-gray-700 ${className}`} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`pb-4 border-b border-gray-200 dark:border-metallic-gray-700 dark:text-neutral-100 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalBody: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`py-4 dark:text-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

export const ModalFooter: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`pt-4 border-t border-gray-200 dark:border-metallic-gray-700 flex justify-end space-x-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold dark:text-neutral-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const Label: React.FC<CardProps> = ({ children, className = '', htmlFor, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1 ${className}`} htmlFor={htmlFor} {...props}>
    {children}
  </label>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error' | 'info' | 'legal';
  [key: string]: any;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800 dark:bg-metallic-gray-700 dark:text-neutral-200',
    outline: 'border border-neutral-300 text-neutral-700 dark:border-metallic-gray-600 dark:text-neutral-300',
    success: 'bg-status-success-100 text-status-success-800 dark:bg-status-success-900/30 dark:text-status-success-300',
    warning: 'bg-status-warning-100 text-status-warning-800 dark:bg-status-warning-900/30 dark:text-status-warning-300',
    error: 'bg-status-error-100 text-status-error-800 dark:bg-status-error-900/30 dark:text-status-error-300',
    info: 'bg-status-info-100 text-status-info-800 dark:bg-status-info-900/30 dark:text-status-info-300',
    legal: 'bg-mpondo-gold-100 text-mpondo-gold-800 border border-mpondo-gold-300 dark:bg-mpondo-gold-900/30 dark:text-mpondo-gold-300 dark:border-mpondo-gold-700'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export const Separator: React.FC<CardProps> = ({ className = '', ...props }) => (
  <hr className={`border-t border-gray-200 my-4 ${className}`} {...props} />
);

export const SelectTrigger: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${className}`} {...props}>
    {children}
  </div>
);

export const SelectValue: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <span className={className} {...props}>{children}</span>
);

export const SelectContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg theme-shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

export const SelectItem: React.FC<CardProps> = ({ children, className = '', value, ...props }) => (
  <div className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`} data-value={value} {...props}>
    {children}
  </div>
);

export const Checkbox: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input 
    type="checkbox"
    className={`w-5 h-5 text-mpondo-gold-600 border-neutral-300 rounded focus:ring-2 focus:ring-mpondo-gold-500 dark:border-metallic-gray-600 dark:bg-metallic-gray-900 dark:checked:bg-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 ${className}`} 
    {...props}
  />
);
