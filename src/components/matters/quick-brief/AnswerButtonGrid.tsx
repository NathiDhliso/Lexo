/**
 * AnswerButtonGrid Component
 * Grid of answer buttons with custom input support for Quick Brief Capture
 */

import React, { useState } from 'react';
import { Check, Plus, Star } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { FormInput } from '../../ui/FormInput';
import type { TemplateItem } from '../../../types/quick-brief.types';

export interface AnswerButtonGridProps {
  options: TemplateItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onAddCustom?: (value: string) => Promise<void>;
  maxColumns?: 2 | 3 | 4;
  showUsageIndicator?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export const AnswerButtonGrid: React.FC<AnswerButtonGridProps> = ({
  options,
  selectedValue,
  onSelect,
  onAddCustom,
  maxColumns = 3,
  showUsageIndicator = true,
  allowCustom = true,
  className
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort options: top 3 by usage get star indicator
  const sortedOptions = [...options].sort((a, b) => {
    if (a.is_custom && b.is_custom) {
      return b.usage_count - a.usage_count;
    }
    if (a.is_custom) return -1;
    if (b.is_custom) return 1;
    return a.value.localeCompare(b.value);
  });

  const topThree = sortedOptions
    .filter(o => o.is_custom)
    .slice(0, 3)
    .map(o => o.id);

  const handleCustomSubmit = async () => {
    if (!customValue.trim() || !onAddCustom) return;

    setIsSubmitting(true);
    try {
      await onAddCustom(customValue.trim());
      onSelect(customValue.trim());
      setCustomValue('');
      setShowCustomInput(false);
    } catch (error) {
      console.error('Failed to add custom template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Answer buttons grid */}
      <div className={cn('grid gap-3', gridCols[maxColumns])}>
        {sortedOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          const isTopUsed = showUsageIndicator && topThree.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.value)}
              className={cn(
                'relative min-h-[44px] px-4 py-3 rounded-lg border-2 transition-all duration-200',
                'flex items-center justify-between gap-2',
                'text-left font-medium text-sm',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-judicial-blue-500',
                isSelected
                  ? 'border-judicial-blue-600 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 text-judicial-blue-900 dark:text-judicial-blue-100'
                  : 'border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 hover:border-judicial-blue-400 hover:bg-neutral-50 dark:hover:bg-metallic-gray-700'
              )}
              aria-pressed={isSelected}
            >
              <span className="flex-1">{option.value}</span>
              
              <div className="flex items-center gap-2">
                {/* Usage indicator */}
                {isTopUsed && (
                  <Star
                    className="w-4 h-4 text-mpondo-gold-500 fill-mpondo-gold-500"
                    aria-label="Frequently used"
                  />
                )}
                
                {/* Selection checkmark */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-judicial-blue-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Add Custom button */}
        {allowCustom && !showCustomInput && (
          <button
            onClick={() => setShowCustomInput(true)}
            className={cn(
              'min-h-[44px] px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200',
              'flex items-center justify-center gap-2',
              'text-sm font-medium',
              'border-neutral-300 dark:border-metallic-gray-600',
              'text-neutral-600 dark:text-neutral-400',
              'hover:border-mpondo-gold-500 hover:text-mpondo-gold-600 dark:hover:text-mpondo-gold-400',
              'hover:bg-mpondo-gold-50 dark:hover:bg-mpondo-gold-900/10',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mpondo-gold-500'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom</span>
          </button>
        )}
      </div>

      {/* Custom input field */}
      {showCustomInput && allowCustom && (
        <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Enter custom value
          </label>
          <div className="flex gap-2">
            <FormInput
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomSubmit();
                } else if (e.key === 'Escape') {
                  setShowCustomInput(false);
                  setCustomValue('');
                }
              }}
              placeholder="Type your custom value..."
              className="flex-1"
              autoFocus
            />
            <Button
              variant="primary"
              onClick={handleCustomSubmit}
              disabled={!customValue.trim() || isSubmitting}
              className="whitespace-nowrap"
            >
              {isSubmitting ? 'Saving...' : 'Add'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCustomInput(false);
                setCustomValue('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            This will be saved to your templates for future use
          </p>
        </div>
      )}
    </div>
  );
};

export default AnswerButtonGrid;
