/**
 * ContextualTooltip Component
 * Provides contextual help overlays on UI elements
 */

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ContextualTooltipProps {
  id: string;
  content: React.ReactNode | string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  showOnce?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  id,
  content,
  title,
  placement = 'top',
  trigger = 'hover',
  showOnce = false,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tooltip was already shown
  useEffect(() => {
    if (showOnce) {
      const shown = localStorage.getItem(`lexohub_tooltip_shown_${id}`);
      if (shown === 'true') {
        return;
      }
    }
  }, [id, showOnce]);

  // Calculate tooltip position
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 8;
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));

      setPosition({ top, left });
    }
  }, [isVisible, placement]);

  const handleShow = () => {
    setIsVisible(true);
  };

  const handleHide = () => {
    setIsVisible(false);
    if (showOnce) {
      localStorage.setItem(`lexohub_tooltip_shown_${id}`, 'true');
    }
  };

  const handleToggle = () => {
    if (isVisible) {
      handleHide();
    } else {
      handleShow();
    }
  };

  const triggerProps = trigger === 'hover'
    ? {
        onMouseEnter: handleShow,
        onMouseLeave: handleHide,
      }
    : {
        onClick: handleToggle,
      };

  const tooltip = isVisible ? (
    <div
      ref={tooltipRef}
      className="fixed z-[100] max-w-xs bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="tooltip"
      aria-live="polite"
    >
      {/* Close button for click trigger */}
      {trigger === 'click' && (
        <button
          onClick={handleHide}
          className="absolute top-2 right-2 p-1 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded transition-colors"
          aria-label="Close tooltip"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      )}

      {/* Title */}
      {title && (
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2 pr-6">
          {title}
        </h4>
      )}

      {/* Content */}
      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        {content}
      </div>

      {/* Arrow */}
      <div
        className={`absolute w-2 h-2 bg-white dark:bg-metallic-gray-800 border-neutral-200 dark:border-metallic-gray-700 transform rotate-45 ${
          placement === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
          placement === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
          placement === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' :
          'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b'
        }`}
      />
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-flex items-center gap-1 ${className}`}
        {...triggerProps}
      >
        {children}
        <HelpCircle className="w-4 h-4 text-judicial-blue-500 hover:text-judicial-blue-600 cursor-help flex-shrink-0" />
      </div>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};

/**
 * FeatureSpotlight Component
 * Highlights a new feature with an animated spotlight effect
 */

export interface FeatureSpotlightProps {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  onDismiss?: () => void;
}

export const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  id,
  targetSelector,
  title,
  description,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(`lexohub_spotlight_dismissed_${id}`);
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    // Find target element
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      setIsVisible(false);
      return;
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [id, targetSelector]);

  const handleDismiss = () => {
    localStorage.setItem(`lexohub_spotlight_dismissed_${id}`, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[90] animate-in fade-in duration-300" />

      {/* Spotlight cutout */}
      <div
        className="fixed z-[91] pointer-events-none"
        style={{
          top: `${position.top - 8}px`,
          left: `${position.left - 8}px`,
          width: `${position.width + 16}px`,
          height: `${position.height + 16}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
        }}
      />

      {/* Popover */}
      <div
        className="fixed z-[92] bg-white dark:bg-metallic-gray-800 rounded-lg shadow-2xl p-6 max-w-sm animate-in slide-in-from-bottom-4 duration-300"
        style={{
          top: `${position.top + position.height + 16}px`,
          left: `${Math.max(16, position.left)}px`,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 rounded-full">
              <span className="text-lg">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded transition-colors"
            aria-label="Dismiss spotlight"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
          {description}
        </p>

        <button
          onClick={handleDismiss}
          className="w-full px-4 py-2 bg-judicial-blue-600 hover:bg-judicial-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Got it!
        </button>
      </div>
    </>,
    document.body
  );
};
