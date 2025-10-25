import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action?: () => void; // Legacy support
  handler?: () => void; // New naming
  description?: string;
  preventDefault?: boolean;
}

/**
 * useKeyboardShortcuts - Hook for managing keyboard shortcuts
 * 
 * Provides accessible keyboard navigation throughout the application.
 * Follows WCAG guidelines for keyboard accessibility.
 * 
 * Features:
 * - Global keyboard shortcuts
 * - Modifier key support (Ctrl, Shift, Alt, Meta/Cmd)
 * - Automatic event cleanup
 * - Input element handling (doesn't trigger shortcuts while typing)
 * 
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled (default: true)
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'n',
 *     ctrlKey: true,
 *     description: 'Create new matter',
 *     handler: () => handleNewMatter(),
 *   },
 *   {
 *     key: 's',
 *     ctrlKey: true,
 *     description: 'Save changes',
 *     handler: () => handleSave(),
 *     preventDefault: true,
 *   },
 * ]);
 * ```
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      const target = event.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow Ctrl/Meta shortcuts even in input fields (like Ctrl+S to save)
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      
      if (isTyping && !hasModifier) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        if (!shortcut || !shortcut.key || typeof shortcut.key !== 'string') {
          return false;
        }

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault) {
          event.preventDefault();
        }
        // Support both old 'action' and new 'handler' naming
        const callback = matchingShortcut.handler || matchingShortcut.action;
        if (callback) {
          callback();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
};

/**
 * useEscapeKey - Hook for handling Escape key press
 * 
 * Common pattern for closing modals, dialogs, and panels.
 * 
 * @param handler - Function to call when Escape is pressed
 * @param enabled - Whether the handler is enabled (default: true)
 * 
 * @example
 * ```tsx
 * useEscapeKey(() => setShowModal(false));
 * ```
 */
export const useEscapeKey = (handler: () => void, enabled = true) => {
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Close modal or panel',
      handler,
    },
  ], enabled);
};

/**
 * useFocusTrap - Hook for trapping focus within a container
 * 
 * Ensures keyboard navigation stays within a modal or dialog.
 * Essential for accessibility compliance.
 * 
 * @param containerRef - Ref to the container element
 * @param enabled - Whether focus trap is enabled (default: true)
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isModalOpen);
 * ```
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element when trap is enabled
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, enabled]);
};

/**
 * useArrowNavigation - Hook for arrow key navigation in lists
 * 
 * Enables keyboard navigation through lists, menus, and grids.
 * 
 * @param itemsRef - Ref to array of item elements
 * @param enabled - Whether navigation is enabled (default: true)
 * 
 * @example
 * ```tsx
 * const itemRefs = useRef<HTMLElement[]>([]);
 * useArrowNavigation(itemRefs);
 * ```
 */
export const useArrowNavigation = (
  itemsRef: React.RefObject<HTMLElement[]>,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled || !itemsRef.current) return;

    const items = itemsRef.current;
    let currentIndex = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;

      event.preventDefault();

      switch (event.key) {
        case 'ArrowDown':
          currentIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowUp':
          currentIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          currentIndex = 0;
          break;
        case 'End':
          currentIndex = items.length - 1;
          break;
      }

      items[currentIndex]?.focus();
    };

    items.forEach((item, index) => {
      item.addEventListener('keydown', handleKeyDown);
      item.addEventListener('focus', () => {
        currentIndex = index;
      });
    });

    return () => {
      items.forEach((item) => {
        item.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [itemsRef, enabled]);
};

/**
 * getKeyboardShortcutLabel - Formats keyboard shortcut for display
 * 
 * @param shortcut - Keyboard shortcut configuration
 * @returns Formatted string (e.g., "Ctrl+N" or "Cmd+N" on Mac)
 * 
 * @example
 * ```tsx
 * const label = getKeyboardShortcutLabel({ key: 'n', ctrlKey: true });
 * // Returns: "Ctrl+N" (Windows/Linux) or "⌘N" (Mac)
 * ```
 */
export const getKeyboardShortcutLabel = (shortcut: Omit<KeyboardShortcut, 'description' | 'handler' | 'action'>): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
};

export default useKeyboardShortcuts;
