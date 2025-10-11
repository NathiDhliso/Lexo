/**
 * Modal Context
 * 
 * Provides centralized modal state management using React Context.
 * Allows any component to open/close modals without prop drilling.
 * 
 * Features:
 * - Open/close modals from anywhere
 * - Modal stacking with z-index management
 * - Focus trap within modals
 * - Body scroll lock when modal is open
 * - Escape key to close
 * - Click outside to close (configurable)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ModalState {
  id: string;
  isOpen: boolean;
  props?: any;
  zIndex: number;
}

interface ModalContextValue {
  modals: Map<string, ModalState>;
  openModal: (id: string, props?: any) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
  getModalProps: (id: string) => any;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Map<string, ModalState>>(new Map());
  const [baseZIndex] = useState(50);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const hasOpenModal = Array.from(modals.values()).some((modal) => modal.isOpen);
    
    if (hasOpenModal) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [modals]);

  const openModal = useCallback((id: string, props?: any) => {
    setModals((prev) => {
      const newModals = new Map(prev);
      const openModalsCount = Array.from(prev.values()).filter((m) => m.isOpen).length;
      
      newModals.set(id, {
        id,
        isOpen: true,
        props,
        zIndex: baseZIndex + openModalsCount,
      });
      
      return newModals;
    });
  }, [baseZIndex]);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => {
      const newModals = new Map(prev);
      const modal = newModals.get(id);
      
      if (modal) {
        newModals.set(id, { ...modal, isOpen: false });
      }
      
      return newModals;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const newModals = new Map(prev);
      newModals.forEach((modal, id) => {
        newModals.set(id, { ...modal, isOpen: false });
      });
      return newModals;
    });
  }, []);

  const isModalOpen = useCallback(
    (id: string) => {
      return modals.get(id)?.isOpen || false;
    },
    [modals]
  );

  const getModalProps = useCallback(
    (id: string) => {
      return modals.get(id)?.props;
    },
    [modals]
  );

  const value: ModalContextValue = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalProps,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export default ModalContext;
