/**
 * Workbench Amendments Tab
 * View scope amendment history and request new amendments (Path A only)
 */
import React, { useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '../../design-system/components';
import { AmendmentHistory } from '../../scope/AmendmentHistory';
import { RequestScopeAmendmentModal } from '../RequestScopeAmendmentModal';
import type { Matter } from '../../../types';

interface WorkbenchAmendmentsTabProps {
  matter: Matter;
}

export const WorkbenchAmendmentsTab: React.FC<WorkbenchAmendmentsTabProps> = ({
  matter,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Scope Amendments
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Request additional scope beyond original estimate
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" />
          <span>Request Amendment</span>
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              When to request a scope amendment
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Attorney requests work outside the original pro forma</li>
              <li>Unexpected complexity requires additional time</li>
              <li>New services needed (e.g., replying affidavit, heads of argument)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Amendment History */}
      <AmendmentHistory matterId={matter.id} />

      {/* Request Scope Amendment Modal */}
      {showRequestModal && (
        <RequestScopeAmendmentModal
          matter={matter}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            // Refresh amendments list handled by AmendmentHistory
          }}
        />
      )}
    </div>
  );
};
