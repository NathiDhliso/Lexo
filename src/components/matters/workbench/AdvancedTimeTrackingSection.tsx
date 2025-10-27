/**
 * AdvancedTimeTrackingSection Component
 * 
 * Collapsible time tracking section for brief fee matters.
 * Allows optional time tracking for internal analysis without affecting invoices.
 */

import React, { useState } from 'react';
import { Clock, Info, AlertTriangle } from 'lucide-react';
import { Collapsible } from '../../ui/Collapsible';
import { Button } from '../../design-system/components';
import { WorkbenchTimeTab } from './WorkbenchTimeTab';
import { TimeEntryModal } from '../../time-entries/TimeEntryModal';
import { cn } from '../../../lib/utils';
import type { Matter } from '../../../types';

export interface AdvancedTimeTrackingSectionProps {
  /** The matter to track time for */
  matter: Matter;
  
  /** Whether the section is expanded by default */
  defaultExpanded?: boolean;
  
  /** Callback when time entry is added */
  onTimeEntryAdded?: () => void;
}

export const AdvancedTimeTrackingSection: React.FC<AdvancedTimeTrackingSectionProps> = ({
  matter,
  defaultExpanded = false,
  onTimeEntryAdded,
}) => {
  const [showTimeModal, setShowTimeModal] = useState(false);

  const handleTimeEntrySuccess = () => {
    setShowTimeModal(false);
    onTimeEntryAdded?.();
  };

  return (
    <>
      <Collapsible
        title="Track time for internal analysis"
        subtitle="Optional time tracking that won't affect your invoices"
        defaultExpanded={defaultExpanded}
        icon={<Clock className="w-5 h-5 text-judicial-blue-500" />}
        className="bg-neutral-50 dark:bg-neutral-800/50 border-dashed"
      >
        {/* Info Banner */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Internal Use Only
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Time entries in this section are for your internal analysis and productivity tracking. 
                They will not be included in invoices or client billing by default.
              </p>
            </div>
          </div>
        </div>

        {/* Warning for Brief Fee Matters */}
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Brief Fee Matter
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                This matter uses a fixed brief fee. Time tracking here is optional and for internal 
                productivity analysis only. Your agreed fee of{' '}
                <span className="font-medium">
                  R{((matter as any).agreed_fee || 0).toLocaleString()}
                </span>{' '}
                remains unchanged.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => setShowTimeModal(true)}
            variant="outline"
            size="sm"
            className="border-dashed"
          >
            <Clock className="w-4 h-4 mr-2" />
            Log Time Entry
          </Button>
        </div>

        {/* Time Entries Table */}
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Internal Time Entries
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Time entries for productivity analysis and internal reporting
            </p>
          </div>
          
          <div className="p-4">
            <WorkbenchTimeTab 
              matterId={matter.id} 
              matterTitle={matter.title}
              isInternalOnly={true}
            />
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <h5 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            When to use internal time tracking:
          </h5>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>• Analyze your productivity on different matter types</li>
            <li>• Track actual time vs. estimated time for future pricing</li>
            <li>• Monitor time spent on research vs. drafting vs. court work</li>
            <li>• Generate internal reports for practice management</li>
            <li>• Prepare for potential scope amendments or future similar matters</li>
          </ul>
        </div>
      </Collapsible>

      {/* Time Entry Modal */}
      {showTimeModal && (
        <TimeEntryModal
          isOpen={showTimeModal}
          onClose={() => setShowTimeModal(false)}
          matterId={matter.id}
          matterTitle={matter.title}
          onSave={handleTimeEntrySuccess}
          isInternalOnly={true}
        />
      )}
    </>
  );
};