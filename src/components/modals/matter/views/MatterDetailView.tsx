/**
 * MatterDetailView - Full matter detail view with tabs
 * Extracted from MatterDetailModal
 * Includes: Details, Time Entries, Scope Amendments, Documents
 */

import React, { useState } from 'react';
import { Edit, FileText, Clock, TrendingUp, FolderOpen } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { ViewMatterDetails } from './ViewMatterDetails';
import type { Matter } from '../../../../types';

// Lazy load heavy components
const TimeEntryList = React.lazy(() => import('../../../time-entries/TimeEntryList').then(m => ({ default: m.TimeEntryList })));
const AmendmentHistory = React.lazy(() => import('../../../scope/AmendmentHistory').then(m => ({ default: m.AmendmentHistory })));
const DocumentsTab = React.lazy(() => import('../../../documents/DocumentsTab').then(m => ({ default: m.DocumentsTab })));

type TabType = 'details' | 'time' | 'scope' | 'documents';

export interface MatterDetailViewProps {
  matter: Matter;
  onEdit: (matter: Matter) => void;
  onClose: () => void;
}

export const MatterDetailView: React.FC<MatterDetailViewProps> = ({
  matter,
  onEdit,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'time'
                ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Time Entries
          </button>
          <button
            onClick={() => setActiveTab('scope')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'scope'
                ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Scope & Amendments
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-600 dark:border-mpondo-gold-400 text-blue-600 dark:text-mpondo-gold-400'
                : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            Documents
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-blue-600 dark:border-mpondo-gold-400" />
          </div>
        }>
          {activeTab === 'details' && (
            <ViewMatterDetails
              matter={matter}
              onEdit={onEdit}
              onClose={onClose}
            />
          )}
          
          {activeTab === 'time' && (
            <TimeEntryList
              matterId={matter.id}
              matterTitle={matter.title}
              defaultRate={2000}
            />
          )}
          
          {activeTab === 'scope' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                  Scope Amendments
                </h3>
              </div>
              <AmendmentHistory matterId={matter.id} />
            </div>
          )}
          
          {activeTab === 'documents' && (
            <DocumentsTab matterId={matter.id} />
          )}
        </React.Suspense>
      </div>

      {/* Footer Actions */}
      {activeTab === 'details' && (
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(matter)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit Matter
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatterDetailView;
