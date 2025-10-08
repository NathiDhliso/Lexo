import React from 'react';

export { Icon } from './Icon';
export { LoadingSpinner } from './LoadingSpinner';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: string;
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable, variant, ...props }) => (
  <div className={`bg-white dark:bg-metallic-gray-800 rounded-lg shadow dark:shadow-lg border border-transparent dark:border-metallic-gray-700 transition-colors duration-300 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-4 pb-2 dark:text-neutral-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`p-4 dark:text-neutral-200 ${className}`} {...props}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  [key: string]: any;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = '', variant = 'primary', ...props }, ref) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-metallic-gray-700 dark:text-neutral-200 dark:hover:bg-metallic-gray-600',
    outline: 'border border-gray-300 hover:bg-gray-50 dark:border-metallic-gray-600 dark:hover:bg-metallic-gray-800 dark:text-neutral-200',
    ghost: 'hover:bg-gray-100 dark:hover:bg-metallic-gray-800 dark:text-neutral-200'
  };
  
  return (
    <button 
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
});

interface InputProps {
  className?: string;
  [key: string]: any;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-mpondo-gold-500 focus:border-blue-500 dark:focus:border-mpondo-gold-500 transition-colors duration-200 ${className}`} 
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
    className={`w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-mpondo-gold-500 focus:border-blue-500 dark:focus:border-mpondo-gold-500 transition-colors duration-200 ${className}`} 
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
    className={`w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-mpondo-gold-500 focus:border-blue-500 dark:focus:border-mpondo-gold-500 resize-vertical transition-colors duration-200 ${className}`} 
    {...props}
  />
);

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  [key: string]: any;
}

export const Modal: React.FC<ModalProps> = ({ children, isOpen, onClose, size = 'md', className = '', ...props }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-black bg-opacity-75 dark:bg-opacity-80" onClick={onClose}></div>
        <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-metallic-gray-800 shadow-xl rounded-lg border border-transparent dark:border-metallic-gray-700 ${className}`} {...props}>
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

export const Badge: React.FC<CardProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`} {...props}>
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
  <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg ${className}`} {...props}>
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
    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`} 
    {...props}
  />
);
