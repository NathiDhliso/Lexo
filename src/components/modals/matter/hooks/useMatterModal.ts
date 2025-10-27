/**
 * useMatterModal Hook
 * 
 * Provides consistent state management for MatterModal
 * Handles opening/closing and mode switching
 */

import { useState, useCallback } from 'react';
import type { Matter } from '../../../../types';
import type { MatterMode } from '../MatterModal';

export interface UseMatterModalReturn {
  isOpen: boolean;
  mode: MatterMode;
  matterId: string | undefined;
  matter: Matter | null;
  prefillData: Partial<Matter> | undefined;
  
  // Actions
  openCreate: (prefillData?: Partial<Matter>) => void;
  openEdit: (matter: Matter) => void;
  openView: (matter: Matter) => void;
  openQuickAdd: (prefillData?: Partial<Matter>) => void;
  openAcceptBrief: (matter: Matter) => void;
  openDetail: (matter: Matter) => void;
  close: () => void;
  
  // Handlers
  handleSuccess: (matter: Matter) => void;
  handleEdit: (matter: Matter) => void;
}

export interface UseMatterModalOptions {
  onSuccess?: (matter: Matter) => void;
  onEdit?: (matter: Matter) => void;
}

/**
 * Hook for managing MatterModal state
 */
export const useMatterModal = (options?: UseMatterModalOptions): UseMatterModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<MatterMode>('create');
  const [matterId, setMatterId] = useState<string | undefined>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<Matter> | undefined>();

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear state after animation
    setTimeout(() => {
      setMode('create');
      setMatterId(undefined);
      setMatter(null);
      setPrefillData(undefined);
    }, 300);
  }, []);

  const openCreate = useCallback((data?: Partial<Matter>) => {
    setMode('create');
    setMatter(null);
    setMatterId(undefined);
    setPrefillData(data);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((matterToEdit: Matter) => {
    setMode('edit');
    setMatter(matterToEdit);
    setMatterId(matterToEdit.id);
    setPrefillData(undefined);
    setIsOpen(true);
  }, []);

  const openView = useCallback((matterToView: Matter) => {
    setMode('view');
    setMatter(matterToView);
    setMatterId(matterToView.id);
    setPrefillData(undefined);
    setIsOpen(true);
  }, []);

  const openQuickAdd = useCallback((data?: Partial<Matter>) => {
    setMode('quick-add');
    setMatter(null);
    setMatterId(undefined);
    setPrefillData(data);
    setIsOpen(true);
  }, []);

  const openAcceptBrief = useCallback((matterToAccept: Matter) => {
    setMode('accept-brief');
    setMatter(matterToAccept);
    setMatterId(matterToAccept.id);
    setPrefillData(undefined);
    setIsOpen(true);
  }, []);

  const openDetail = useCallback((matterToShow: Matter) => {
    setMode('detail');
    setMatter(matterToShow);
    setMatterId(matterToShow.id);
    setPrefillData(undefined);
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback((updatedMatter: Matter) => {
    setMatter(updatedMatter);
    options?.onSuccess?.(updatedMatter);
  }, [options]);

  const handleEdit = useCallback((matterToEdit: Matter) => {
    // Switch to edit mode
    setMode('edit');
    setMatter(matterToEdit);
    setMatterId(matterToEdit.id);
    options?.onEdit?.(matterToEdit);
  }, [options]);

  return {
    isOpen,
    mode,
    matterId,
    matter,
    prefillData,
    openCreate,
    openEdit,
    openView,
    openQuickAdd,
    openAcceptBrief,
    openDetail,
    close,
    handleSuccess,
    handleEdit,
  };
};

export default useMatterModal;
