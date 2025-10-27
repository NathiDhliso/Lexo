/**
 * useWorkItemModal Hook
 * 
 * Provides consistent state management for WorkItemModal
 * Handles opening/closing and type/mode switching
 */

import { useState, useCallback } from 'react';
import type { WorkItemType, WorkItemMode } from '../WorkItemModal';

export interface UseWorkItemModalReturn {
  isOpen: boolean;
  type: WorkItemType;
  mode: WorkItemMode;
  itemId: string | undefined;
  matterId: string | undefined;
  matterTitle: string | undefined;
  
  // Actions
  openCreateService: (matterId: string, matterTitle?: string) => void;
  openCreateTime: (matterId: string, matterTitle?: string) => void;
  openCreateDisbursement: (matterId: string, matterTitle?: string) => void;
  openQuickService: (matterId: string, matterTitle?: string) => void;
  openQuickTime: (matterId: string, matterTitle?: string) => void;
  openQuickDisbursement: (matterId: string, matterTitle?: string) => void;
  openEdit: (type: WorkItemType, itemId: string, matterId: string, matterTitle?: string) => void;
  close: () => void;
  
  // Handlers
  handleSuccess: () => void;
}

export interface UseWorkItemModalOptions {
  onSuccess?: () => void;
}

/**
 * Hook for managing WorkItemModal state
 */
export const useWorkItemModal = (options?: UseWorkItemModalOptions): UseWorkItemModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<WorkItemType>('service');
  const [mode, setMode] = useState<WorkItemMode>('create');
  const [itemId, setItemId] = useState<string | undefined>();
  const [matterId, setMatterId] = useState<string | undefined>();
  const [matterTitle, setMatterTitle] = useState<string | undefined>();

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear state after animation
    setTimeout(() => {
      setType('service');
      setMode('create');
      setItemId(undefined);
      setMatterId(undefined);
      setMatterTitle(undefined);
    }, 300);
  }, []);

  const openCreateService = useCallback((mId: string, mTitle?: string) => {
    setType('service');
    setMode('create');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openCreateTime = useCallback((mId: string, mTitle?: string) => {
    setType('time');
    setMode('create');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openCreateDisbursement = useCallback((mId: string, mTitle?: string) => {
    setType('disbursement');
    setMode('create');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openQuickService = useCallback((mId: string, mTitle?: string) => {
    setType('service');
    setMode('quick');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openQuickTime = useCallback((mId: string, mTitle?: string) => {
    setType('time');
    setMode('quick');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openQuickDisbursement = useCallback((mId: string, mTitle?: string) => {
    setType('disbursement');
    setMode('quick');
    setMatterId(mId);
    setMatterTitle(mTitle);
    setItemId(undefined);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((
    workItemType: WorkItemType,
    id: string,
    mId: string,
    mTitle?: string
  ) => {
    setType(workItemType);
    setMode('edit');
    setItemId(id);
    setMatterId(mId);
    setMatterTitle(mTitle);
    setIsOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    options?.onSuccess?.();
  }, [options]);

  return {
    isOpen,
    type,
    mode,
    itemId,
    matterId,
    matterTitle,
    openCreateService,
    openCreateTime,
    openCreateDisbursement,
    openQuickService,
    openQuickTime,
    openQuickDisbursement,
    openEdit,
    close,
    handleSuccess,
  };
};

export default useWorkItemModal;
