import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BillingModel } from '../../services/billing-strategies';

export interface BillingModelChangeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentModel: BillingModel;
  newModel: BillingModel;
  matterTitle: string;
}

const getModelLabel = (model: BillingModel): string => {
  const labels: Record<BillingModel, string> = {
    [BillingModel.BRIEF_FEE]: 'Brief Fee',
    [BillingModel.TIME_BASED]: 'Time-Based',
    [BillingModel.QUICK_OPINION]: 'Quick Opinion',
  };
  return labels[model];
};

const getDataImplications = (currentModel: BillingModel, newModel: BillingModel): string[] => {
  const implications: string[] = [];

  // From Brief Fee
  if (currentModel === BillingModel.BRIEF_FEE) {
    implications.push('Fee milestones will be cleared');
    if (newModel === BillingModel.TIME_BASED) {
      implications.push('You will need to set an hourly rate');
      implications.push('Time tracking will become visible and required');
    }
  }

  // From Time-Based
  if (currentModel === BillingModel.TIME_BASED) {
    implications.push('Existing time entries will be preserved but may not affect invoicing');
    if (newModel === BillingModel.BRIEF_FEE) {
      implications.push('You will need to set an agreed brief fee');
      implications.push('Time tracking will become optional (for internal analysis only)');
      implications.push('New fee milestones will be created');
    }
    if (newModel === BillingModel.QUICK_OPINION) {
      implications.push('You will need to set a consultation fee');
    }
  }

  // From Quick Opinion
  if (currentModel === BillingModel.QUICK_OPINION) {
    if (newModel === BillingModel.TIME_BASED) {
      implications.push('You will need to set an hourly rate');
      implications.push('Time tracking will become visible and required');
    }
    if (newModel === BillingModel.BRIEF_FEE) {
      implications.push('You will need to set an agreed brief fee');
      implications.push('New fee milestones will be created');
    }
  }

  return implications;
};

/**
 * BillingModelChangeConfirmation Component
 * 
 * Confirmation modal for changing billing models on existing matters.
 * Warns users about data implications and requires explicit confirmation.
 * 
 * Features:
 * - Clear warning about billing model change
 * - List of data implications
 * - Explicit confirmation required
 * - Accessible modal with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <BillingModelChangeConfirmation
 *   isOpen={showConfirmation}
 *   onClose={() => setShowConfirmation(false)}
 *   onConfirm={handleConfirmChange}
 *   currentModel={BillingModel.BRIEF_FEE}
 *   newModel={BillingModel.TIME_BASED}
 *   matterTitle="Smith v. Jones"
 * />
 * ```
 */
export const BillingModelChangeConfirmation: React.FC<BillingModelChangeConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentModel,
  newModel,
  matterTitle,
}) => {
  const implications = getDataImplications(currentModel, newModel);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Billing Model?"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Header */}
        <div className="flex items-start gap-3 p-4 bg-status-warning-50 dark:bg-status-warning-900/20 border border-status-warning-200 dark:border-status-warning-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-status-warning-600 dark:text-status-warning-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-status-warning-900 dark:text-status-warning-100 mb-1">
              Important: Billing Model Change
            </h4>
            <p className="text-sm text-status-warning-700 dark:text-status-warning-300">
              Changing the billing model for an existing matter may affect how fees are calculated and tracked.
            </p>
          </div>
        </div>

        {/* Matter Info */}
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Matter:</span>
            <span className="ml-2 text-neutral-900 dark:text-neutral-100">{matterTitle}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Current Model:</span>
            <span className="ml-2 text-neutral-900 dark:text-neutral-100">{getModelLabel(currentModel)}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">New Model:</span>
            <span className="ml-2 font-semibold text-judicial-blue-600 dark:text-judicial-blue-400">
              {getModelLabel(newModel)}
            </span>
          </div>
        </div>

        {/* Data Implications */}
        {implications.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-neutral-900 dark:text-neutral-100">
              What will happen:
            </h5>
            <ul className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {implications.map((implication, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-judicial-blue-600 dark:text-judicial-blue-400 mt-1">•</span>
                  <span>{implication}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Message */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Are you sure you want to change the billing model for this matter?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
          >
            Confirm Change
          </Button>
        </div>
      </div>
    </Modal>
  );
};
