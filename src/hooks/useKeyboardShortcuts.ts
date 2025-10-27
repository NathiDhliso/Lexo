/**
 * useKeyboardShortcuts Hook
 * 
 * Provides keyboard shortcut functionality for common actions
 * Supports Ctrl/Cmd + key combinations
 */

import { useEffect, useCallback } from 'react';
import * as React from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlKey = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return { shortcuts };
};

/**
 * Format keyboard shortcut for display
 */
export const getKeyboardShortcutLabel = (shortcut: KeyboardShortcut): string => {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  // Format the key
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts.join(isMac ? '' : '+');
};

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  NEW: { key: 'n', ctrl: true, description: 'Create new item' },
  SAVE: { key: 's', ctrl: true, description: 'Save current item' },
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  CLOSE: { key: 'Escape', description: 'Close modal/dialog' },
  REFRESH: { key: 'r', ctrl: true, description: 'Refresh data' },
  HELP: { key: '?', shift: true, description: 'Show keyboard shortcuts' },
};

/**
 * useEscapeKey Hook
 * 
 * Simplified hook for handling Escape key press
 * Commonly used for closing modals and dropdowns
 */
export const useEscapeKey = (handler: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handler, enabled]);
};

/**
 * useFocusTrap Hook
 * 
 * Traps focus within a container (useful for modals)
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, enabled = true) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab as any);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTab as any);
    };
  }, [containerRef, enabled]);
};

/**
 * useArrowNavigation Hook
 * 
 * Handles arrow key navigation for lists
 */
export const useArrowNavigation = (
  itemCount: number,
  onSelect: (index: number) => void,
  enabled = true
) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % itemCount);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + itemCount) % itemCount);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleArrow);
    return () => window.removeEventListener('keydown', handleArrow);
  }, [itemCount, selectedIndex, onSelect, enabled]);

  return { selectedIndex, setSelectedIndex };
};
