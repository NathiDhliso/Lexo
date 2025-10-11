/**
 * useModalState Hook
 * 
 * A simple hook for managing modal open/close state.
 * Provides a clean API for modal state management.
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useModalState();
 * 
 * <Button onClick={open}>Open Modal</Button>
 * <Modal isOpen={isOpen} onClose={close}>
 *   Content
 * </Modal>
 * ```
 */

import { useState, useCallback } from 'react';

export interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setIsOpen: (value: boolean) => void;
}

/**
 * Hook for managing modal state
 * 
 * @param initialState - Initial open state (default: false)
 * @returns Object with isOpen state and control functions
 */
export const useModalState = (initialState = false): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
};

export default useModalState;
