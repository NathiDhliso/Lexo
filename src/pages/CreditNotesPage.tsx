/**
 * Credit Notes Page
 * Manage credit notes and refunds
 */
import React from 'react';
import { FileText } from 'lucide-react';

export const CreditNotesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Credit Notes
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Issue and manage credit notes
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No credit notes
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Credit note management coming in Iteration 6
        </p>
      </div>
    </div>
  );
};

export default CreditNotesPage;
