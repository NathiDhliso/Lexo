/**
 * WorkItemModal - Consolidated Work Item Management Modal
 * 
 * Consolidates 5 modals into one with type and mode-based rendering:
 * - type: service | time | disbursement
 * - mode: create | edit | quick
 * 
 * Replaces:
 * - LogServiceModal
 * - TimeEntryModal
 * - LogDisbursementModal
 * - EditDisbursementModal
 * - QuickDisbursementModal
 * 
 * @see .kiro/specs/ux-consolidation/design.md
 */

import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { ServiceForm } from './forms/ServiceForm';
import { TimeEntryForm } from './forms/TimeEntryForm';
import { DisbursementForm } from './forms/DisbursementForm';

export type WorkItemType = 'service' | 'time' | 'disbursement';
export type WorkItemMode = 'create' | 'edit' | 'quick';

export interface WorkItemModalProps {
  type: WorkItemType;
  mode: WorkItemMode;
  isOpen: boolean;
  onClose: () => void;
  itemId?: string;
  matterId: string;
  matterTitle?: string;
  onSuccess?: () => void;
  defaultRate?: number;
}

/**
 * Get modal size based on type and mode
 */
const getModalSize = (type: WorkItemType, mode: WorkItemMode): 'sm' | 'md' | 'lg' => {
  if (mode === 'quick') return 'sm';
  if (type === 'disbursement') return 'md';
  return 'md';
};

/**
 * Get modal title based on type and mode
 */
const getModalTitle = (type: WorkItemType, mode: WorkItemMode): string => {
  const action = mode === 'edit' ? 'Edit' : mode === 'quick' ? 'Quick Add' : 'Log';
  
  switch (type) {
    case 'service':
      return `${action} Service`;
    case 'time':
      return `${action} Time Entry`;
    case 'disbursement':
      return `${action} Disbursement`;
    default:
      return 'Work Item';
  }
};

/**
 * WorkItemModal Component
 * 
 * Unified modal for all work item operations
 */
export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  type,
  mode,
  isOpen,
  onClose,
  itemId,
  matterId,
  matterTitle,
  onSuccess,
  defaultRate,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
  };

  /**
   * Render content based on type
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-blue-600 dark:border-mpondo-gold-400" />
        </div>
      );
    }

    const commonProps = {
      mode,
      matterId,
      matterTitle,
      onSuccess: handleSuccess,
      onClose,
    };

    switch (type) {
      case 'service':
        return (
          <ServiceForm
            {...commonProps}
            itemId={itemId}
          />
        );

      case 'time':
        return (
          <TimeEntryForm
            {...commonProps}
            itemId={itemId}
            defaultRate={defaultRate}
          />
        );

      case 'disbursement':
        return (
          <DisbursementForm
            {...commonProps}
            itemId={itemId}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            Invalid work item type: {type}
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={getModalSize(type, mode)}
      title={getModalTitle(type, mode)}
      showCloseButton={true}
      closeOnOverlayClick={false}
      closeOnEscape={true}
    >
      {renderContent()}
    </Modal>
  );
};

export default WorkItemModal;
