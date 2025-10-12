import React from 'react';
import { X, Trash2, Archive, Download } from 'lucide-react';
import { Button } from './';
import { cn } from '../../lib/utils';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  onClick: () => void | Promise<void>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkActionToolbarProps {
  selectedCount: number;
  totalCount: number;
  actions?: BulkAction[];
  onClearSelection: () => void;
  className?: string;
  position?: 'top' | 'bottom' | 'fixed';
}

/**
 * Bulk Action Toolbar Component
 * 
 * Displays a toolbar with bulk actions when items are selected
 * 
 * @example
 * ```tsx
 * <BulkActionToolbar
 *   selectedCount={selectedIds.size}
 *   totalCount={items.length}
 *   actions={[
 *     {
 *       id: 'delete',
 *       label: 'Delete',
 *       icon: <Trash2 />,
 *       variant: 'danger',
 *       onClick: handleBulkDelete,
 *       requiresConfirmation: true,
 *     },
 *   ]}
 *   onClearSelection={clearSelection}
 * />
 * ```
 */
export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  totalCount,
  actions = [],
  onClearSelection,
  className,
  position = 'top',
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const positionClasses = {
    top: 'relative',
    bottom: 'relative',
    fixed: 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl',
  };

  const defaultActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => console.log('Delete action'),
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${selectedCount} item(s)?`,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      variant: 'secondary',
      onClick: () => console.log('Archive action'),
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      variant: 'ghost',
      onClick: () => console.log('Export action'),
    },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div
      className={cn(
        'bg-judicial-blue-900 dark:bg-judicial-blue-800 text-white rounded-lg p-4',
        'flex items-center justify-between gap-4',
        'animate-in slide-in-from-bottom-4 duration-300',
        positionClasses[position],
        className
      )}
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-mpondo-gold-500 rounded-full flex items-center justify-center text-sm font-bold text-neutral-900">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {displayActions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'ghost'}
            size="sm"
            icon={action.icon}
            onClick={action.onClick}
            className="text-white border-white/20 hover:bg-white dark:bg-metallic-gray-800/10"
            aria-label={action.label}
          >
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        ))}

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          icon={<X className="w-4 h-4" />}
          onClick={onClearSelection}
          className="text-white border-white/20 hover:bg-white dark:bg-metallic-gray-800/10 ml-2"
          aria-label="Clear selection"
        >
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  );
};

/**
 * Checkbox component for bulk selection
 */
export interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  label,
  className,
}) => {
  return (
    <label
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none',
        'min-h-[44px] min-w-[44px] justify-center',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) {
            el.indeterminate = indeterminate;
          }
        }}
        onChange={onChange}
        className={cn(
          'w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600',
          'text-judicial-blue-600 focus:ring-2 focus:ring-judicial-blue-500 focus:ring-offset-2',
          'cursor-pointer transition-colors',
          'checked:bg-judicial-blue-600 checked:border-judicial-blue-600',
          'dark:checked:bg-judicial-blue-500 dark:checked:border-judicial-blue-500'
        )}
        aria-label={label || 'Select item'}
      />
      {label && (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
      )}
    </label>
  );
};
