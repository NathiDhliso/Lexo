/**
 * Collapsible Component
 * 
 * A reusable collapsible/expandable section component with smooth animations.
 * Used for progressive disclosure of advanced features.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CollapsibleProps {
  /** The title/header text for the collapsible section */
  title: string;
  
  /** Optional subtitle or description */
  subtitle?: string;
  
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
  
  /** Whether the section is disabled */
  disabled?: boolean;
  
  /** Custom icon to show instead of chevron */
  icon?: React.ReactNode;
  
  /** Additional CSS classes for the container */
  className?: string;
  
  /** Additional CSS classes for the header */
  headerClassName?: string;
  
  /** Additional CSS classes for the content */
  contentClassName?: string;
  
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  
  /** The content to show/hide */
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  subtitle,
  defaultExpanded = false,
  disabled = false,
  icon,
  className,
  headerClassName,
  contentClassName,
  onExpandedChange,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | undefined>(defaultExpanded ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update height when expanded state changes
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isExpanded, children]);

  // Handle expand/collapse
  const handleToggle = () => {
    if (disabled) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  return (
    <div className={cn('border border-neutral-200 dark:border-neutral-700 rounded-lg', className)}>
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 focus:ring-inset',
          disabled && 'opacity-50 cursor-not-allowed',
          headerClassName
        )}
        aria-expanded={isExpanded}
        aria-controls="collapsible-content"
      >
        <div className="flex items-center gap-3">
          {/* Custom icon or chevron */}
          <div className="flex-shrink-0">
            {icon || (
              isExpanded ? (
                <ChevronDown className="w-5 h-5 text-neutral-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-neutral-500" />
              )
            )}
          </div>
          
          {/* Title and subtitle */}
          <div>
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        id="collapsible-content"
        ref={contentRef}
        style={{ height }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className={cn('p-4 pt-0 border-t border-neutral-200 dark:border-neutral-700', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple collapsible variant with minimal styling
 */
export const SimpleCollapsible: React.FC<Omit<CollapsibleProps, 'className' | 'headerClassName' | 'contentClassName'>> = (props) => {
  return (
    <Collapsible
      {...props}
      className="border-0 bg-transparent"
      headerClassName="p-0 hover:bg-transparent"
      contentClassName="p-0 border-0"
    />
  );
};