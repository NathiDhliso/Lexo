/**
 * Payment Disputes Page
 * Manage payment disputes and resolutions
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisputesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Payment Disputes
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage and resolve payment disputes
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No disputes
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Payment dispute management coming in Iteration 6
        </p>
      </div>
    </div>
  );
};

export default DisputesPage;
