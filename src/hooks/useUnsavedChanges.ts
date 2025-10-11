import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfirmation } from './useConfirmation';

export interface UseUnsavedChangesOptions {
  when: boolean;
  message?: string;
  onNavigate?: () => void;
  onStay?: () => void;
}

/**
 * Hook to warn users about unsaved changes before navigation or page close
 * 
 * @example
 * ```tsx
 * const { isDirty, setDirty, resetDirty } = useUnsavedChanges({
 *   when: formHasChanges,
 *   message: 'You have unsaved changes. Are you sure you want to leave?',
 *   onNavigate: () => console.log('User chose to navigate away'),
 * });
 * ```
 */
export const useUnsavedChanges = ({
  when,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onNavigate,
  onStay,
}: UseUnsavedChangesOptions) => {
  const { confirm } = useConfirmation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = useRef(location.pathname);
  const isNavigatingRef = useRef(false);

  // Handle browser beforeunload event (page refresh, close, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (when && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = message; // Standard way to show browser dialog
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [when, message]);

  // Handle React Router navigation
  useEffect(() => {
    if (location.pathname !== currentPath.current) {
      currentPath.current = location.pathname;
    }
  }, [location.pathname]);

  /**
   * Check if navigation should be blocked and show confirmation
   */
  const checkUnsavedChanges = useCallback(async (): Promise<boolean> => {
    if (!when) {
      return true; // Allow navigation
    }

    const confirmed = await confirm({
      title: 'Unsaved Changes',
      message,
      variant: 'warning',
      confirmText: 'Leave Page',
      cancelText: 'Stay',
    });

    if (confirmed) {
      isNavigatingRef.current = true;
      onNavigate?.();
      return true;
    } else {
      onStay?.();
      return false;
    }
  }, [when, message, confirm, onNavigate, onStay]);

  /**
   * Navigate with unsaved changes check
   */
  const navigateWithCheck = useCallback(
    async (to: string) => {
      const canNavigate = await checkUnsavedChanges();
      if (canNavigate) {
        navigate(to);
      }
    },
    [checkUnsavedChanges, navigate]
  );

  /**
   * Reset the navigation flag (call after successful save)
   */
  const resetNavigationFlag = useCallback(() => {
    isNavigatingRef.current = false;
  }, []);

  return {
    checkUnsavedChanges,
    navigateWithCheck,
    resetNavigationFlag,
    isDirty: when,
  };
};

/**
 * Hook specifically for form dirty state tracking
 * Integrates with useForm hook
 */
export const useFormUnsavedChanges = (isDirty: boolean, message?: string) => {
  return useUnsavedChanges({
    when: isDirty,
    message: message || 'You have unsaved form changes. Are you sure you want to leave?',
  });
};

/**
 * Hook for modal close with unsaved changes check
 */
export const useModalUnsavedChanges = (
  isDirty: boolean,
  onClose: () => void,
  message?: string
) => {
  const { confirm } = useConfirmation();

  const handleClose = useCallback(async () => {
    if (!isDirty) {
      onClose();
      return;
    }

    const confirmed = await confirm({
      title: 'Unsaved Changes',
      message: message || 'You have unsaved changes. Are you sure you want to close?',
      variant: 'warning',
      confirmText: 'Close Anyway',
      cancelText: 'Keep Editing',
    });

    if (confirmed) {
      onClose();
    }
  }, [isDirty, onClose, confirm, message]);

  return { handleClose, isDirty };
};
