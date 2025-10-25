/**
 * Tooltip Component
 * Contextual help tooltip for form fields and UI elements
 */

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  className,
  children,
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Check if tooltip would overflow and adjust position
      let adjustedPosition = position;

      if (position === 'top' && trigger.top - tooltip.height < 0) {
        adjustedPosition = 'bottom';
      } else if (position === 'bottom' && trigger.bottom + tooltip.height > viewport.height) {
        adjustedPosition = 'top';
      } else if (position === 'left' && trigger.left - tooltip.width < 0) {
        adjustedPosition = 'right';
      } else if (position === 'right' && trigger.right + tooltip.width > viewport.width) {
        adjustedPosition = 'left';
      }

      setTooltipPosition(adjustedPosition);
    }
  }, [isVisible, position]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        showIcon && (
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 rounded"
            aria-label="Help"
            tabIndex={0}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )
      )}

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 rounded-lg shadow-lg max-w-xs',
            'animate-in fade-in-0 zoom-in-95',
            positionClasses[tooltipPosition]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-neutral-900 dark:bg-neutral-700 rotate-45',
              arrowClasses[tooltipPosition]
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
