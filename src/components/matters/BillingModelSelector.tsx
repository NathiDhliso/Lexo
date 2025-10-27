import React from 'react';
import { cn } from '../../lib/utils';
import { BillingModel } from '../../types/billing.types';

export interface BillingModelSelectorProps {
  value: BillingModel;
  onChange: (model: BillingModel) => void;
  disabled?: boolean;
  className?: string;
  defaultModel?: BillingModel;
  showDefaultIndicator?: boolean;
}

interface BillingModelOption {
  value: BillingModel;
  label: string;
  description: string;
  icon: string;
}

const billingModelOptions: BillingModelOption[] = [
  {
    value: 'brief-fee',
    label: 'Brief Fee',
    description: 'Fixed fee agreed upfront for the entire matter. Traditional advocate billing.',
    icon: '📋',
  },
  {
    value: 'time-based',
    label: 'Time-Based',
    description: 'Hourly rate billing with detailed time tracking. Suitable for complex matters.',
    icon: '⏱️',
  },
  {
    value: 'quick-opinion',
    label: 'Quick Opinion',
    description: 'Flat-rate consultation for quick legal opinions and advice.',
    icon: '💡',
  },
];

/**
 * BillingModelSelector Component
 * 
 * A radio button group for selecting billing models with descriptive text
 * and judicial color palette styling.
 * 
 * Features:
 * - Three billing model options with icons and descriptions
 * - Controlled component pattern
 * - Accessible radio button group
 * - Judicial blue and gold theme colors
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <BillingModelSelector
 *   value={billingModel}
 *   onChange={setBillingModel}
 * />
 * ```
 */
export const BillingModelSelector: React.FC<BillingModelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  defaultModel,
  showDefaultIndicator = true,
}) => {
  return (
    <div className={cn('space-y-3', className)} role="radiogroup" aria-label="Billing model selection">
      {billingModelOptions.map((option) => {
        const isSelected = value === option.value;
        const isDefault = defaultModel === option.value;
        
        return (
          <label
            key={option.value}
            className={cn(
              'flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
              'hover:shadow-md',
              isSelected
                ? 'border-judicial-blue-600 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 dark:border-judicial-blue-400'
                : 'border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-600',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && !isSelected && 'hover:border-judicial-blue-400'
            )}
          >
            <input
              type="radio"
              name="billing-model"
              value={option.value}
              checked={isSelected}
              onChange={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className="sr-only"
              aria-describedby={`${option.value}-description`}
            />
            
            <div className="flex-shrink-0 text-2xl mr-3" aria-hidden="true">
              {option.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'font-semibold text-base',
                    isSelected
                      ? 'text-judicial-blue-900 dark:text-judicial-blue-100'
                      : 'text-neutral-900 dark:text-neutral-100'
                  )}
                >
                  {option.label}
                </span>
                
                {isDefault && showDefaultIndicator && (
                  <span className="px-2 py-1 text-xs bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-700 dark:text-mpondo-gold-300 rounded-full">
                    Default
                  </span>
                )}
                
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Selected"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              
              <p
                id={`${option.value}-description`}
                className={cn(
                  'text-sm',
                  isSelected
                    ? 'text-judicial-blue-700 dark:text-judicial-blue-300'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                {option.description}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
};
