/**
 * AcceptBriefForm - Accept brief without pro forma
 * Extracted from AcceptBriefModal
 */

import React from 'react';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { AsyncButton } from '../../../ui/AsyncButton';
import { matterApiService } from '../../../../services/api/matter-api.service';
import { toastService } from '../../../../services/toast.service';
import { type Matter, MatterStatus } from '../../../../types';

export interface AcceptBriefFormProps {
  matter: Matter;
  onSuccess: (matter: Matter) => void;
  onClose: () => void;
}

export const AcceptBriefForm: React.FC<AcceptBriefFormProps> = ({
  matter,
  onSuccess,
  onClose,
}) => {
  const handleAccept = async () => {
    try {
      const result = await matterApiService.update(matter.id, {
        status: MatterStatus.ACTIVE,
        date_accepted: new Date().toISOString(),
      });
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to accept brief');
      }

      toastService.success('Brief accepted successfully');
      if (result.data) {
        onSuccess(result.data);
      }
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to accept brief');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Matter Details */}
      <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {matter.title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          From: {matter.instructing_firm} • {matter.instructing_attorney}
        </p>
      </div>

      {/* Explanation */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 rounded-lg border border-mpondo-gold-200 dark:border-mpondo-gold-800">
          <CheckCircle className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-mpondo-gold-900 dark:text-mpondo-gold-100 mb-1">
              What happens next:
            </p>
            <ul className="text-sm text-mpondo-gold-800 dark:text-mpondo-gold-200 space-y-1">
              <li>• Matter status → <strong>Active</strong> (immediately)</li>
              <li>• No pro forma required</li>
              <li>• You can start work right away</li>
              <li>• Use "Simple Fee Entry" when done</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg border border-judicial-blue-200 dark:border-judicial-blue-800">
          <AlertCircle className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-judicial-blue-900 dark:text-judicial-blue-100 mb-1">
              Best for:
            </p>
            <ul className="text-sm text-judicial-blue-800 dark:text-judicial-blue-200 space-y-1">
              <li>• Court appearances</li>
              <li>• Consultations</li>
              <li>• Legal opinions</li>
              <li>• Fixed-fee brief work</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <AsyncButton
          variant="primary"
          onAsyncClick={handleAccept}
          className="flex-1 bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
          icon={<Zap className="w-4 h-4" />}
          successMessage="Brief accepted"
          errorMessage="Failed to accept brief"
        >
          Accept Brief & Start
        </AsyncButton>
      </div>

      {/* Alternative Option */}
      <div className="pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          Need detailed tracking? Use <strong>"Send Pro Forma"</strong> instead
        </p>
      </div>
    </div>
  );
};

export default AcceptBriefForm;
