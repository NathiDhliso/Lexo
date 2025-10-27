/**
 * MatterModal - Consolidated Matter Management Modal
 * 
 * Consolidates 6 modals into one with mode-based rendering:
 * - create: Full matter creation wizard
 * - edit: Edit existing matter
 * - view: View matter details (read-only)
 * - quick-add: Quick matter creation (simplified)
 * - accept-brief: Accept brief without pro forma
 * - detail: Full matter detail view with tabs
 * 
 * @see .kiro/specs/ux-consolidation/design.md
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { CreateMatterForm } from './forms/CreateMatterForm';
import { EditMatterForm } from './forms/EditMatterForm';
import { QuickAddMatterForm } from './forms/QuickAddMatterForm';
import { AcceptBriefForm } from './forms/AcceptBriefForm';
import { MatterDetailView } from './views/MatterDetailView';
import { ViewMatterDetails } from './views/ViewMatterDetails';
import type { Matter } from '../../../types';

export type MatterMode = 'create' | 'edit' | 'view' | 'quick-add' | 'accept-brief' | 'detail';

export interface MatterModalProps {
  mode: MatterMode;
  isOpen: boolean;
  onClose: () => void;
  matterId?: string;
  matter?: Matter | null;
  firmId?: string;
  onSuccess?: (matter: Matter) => void;
  onEdit?: (matter: Matter) => void;
  prefillData?: Partial<Matter>;
}

/**
 * Get modal size based on mode
 */
const getModalSize = (mode: MatterMode): 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' => {
  switch (mode) {
    case 'quick-add':
      return 'md';
    case 'create':
    case 'edit':
      return 'lg';
    case 'accept-brief':
      return 'md';
    case 'detail':
    case 'view':
      return 'xl';
    default:
      return 'lg';
  }
};

/**
 * Get modal title based on mode
 */
const getModalTitle = (mode: MatterMode, matter?: Matter | null): string => {
  switch (mode) {
    case 'create':
      return 'Create New Matter';
    case 'edit':
      return 'Edit Matter';
    case 'view':
      return 'Matter Details';
    case 'quick-add':
      return 'Quick Add Matter';
    case 'accept-brief':
      return 'Accept Brief';
    case 'detail':
      return matter?.title || 'Matter Information';
    default:
      return 'Matter';
  }
};

/**
 * MatterModal Component
 * 
 * Unified modal for all matter-related operations
 */
export const MatterModal: React.FC<MatterModalProps> = ({
  mode,
  isOpen,
  onClose,
  matterId,
  matter: initialMatter,
  firmId,
  onSuccess,
  onEdit,
  prefillData,
}) => {
  const [matter, setMatter] = useState<Matter | null>(initialMatter || null);
  const [loading, setLoading] = useState(false);

  // Load matter data if matterId provided but no matter object
  useEffect(() => {
    if (isOpen && matterId && !initialMatter) {
      loadMatter(matterId);
    } else if (initialMatter) {
      setMatter(initialMatter);
    }
  }, [isOpen, matterId, initialMatter]);

  const loadMatter = async (id: string) => {
    setLoading(true);
    try {
      // Import dynamically to avoid circular dependencies
      const { matterApiService } = await import('../../../services/api/matter-api.service');
      const result = await matterApiService.getById(id);
      
      if (result.error) {
        console.error('Error loading matter:', result.error);
        return;
      }
      
      setMatter(result.data);
    } catch (error) {
      console.error('Error loading matter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (updatedMatter: Matter) => {
    setMatter(updatedMatter);
    onSuccess?.(updatedMatter);
  };

  const handleEdit = (matterToEdit: Matter) => {
    onEdit?.(matterToEdit);
  };

  /**
   * Render content based on mode
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-blue-600 dark:border-mpondo-gold-400" />
        </div>
      );
    }

    switch (mode) {
      case 'create':
        return (
          <CreateMatterForm
            onSuccess={handleSuccess}
            onClose={onClose}
            firmId={firmId}
            prefillData={prefillData}
          />
        );

      case 'edit':
        if (!matter) {
          return (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              Matter not found
            </div>
          );
        }
        return (
          <EditMatterForm
            matter={matter}
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        );

      case 'view':
        if (!matter) {
          return (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              Matter not found
            </div>
          );
        }
        return (
          <ViewMatterDetails
            matter={matter}
            onEdit={handleEdit}
            onClose={onClose}
          />
        );

      case 'quick-add':
        return (
          <QuickAddMatterForm
            onSuccess={handleSuccess}
            onClose={onClose}
            prefillData={prefillData}
          />
        );

      case 'accept-brief':
        if (!matter) {
          return (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              Matter not found
            </div>
          );
        }
        return (
          <AcceptBriefForm
            matter={matter}
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        );

      case 'detail':
        if (!matter) {
          return (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              Matter not found
            </div>
          );
        }
        return (
          <MatterDetailView
            matter={matter}
            onEdit={handleEdit}
            onClose={onClose}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            Invalid mode: {mode}
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={getModalSize(mode)}
      title={getModalTitle(mode, matter)}
      showCloseButton={true}
      closeOnOverlayClick={mode === 'view' || mode === 'detail'}
      closeOnEscape={true}
    >
      {renderContent()}
    </Modal>
  );
};

export default MatterModal;
