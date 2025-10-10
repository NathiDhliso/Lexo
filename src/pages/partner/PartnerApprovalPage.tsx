import React from 'react';
import { PendingApprovalQueue } from '../../components/partner/PendingApprovalQueue';
import { CheckSquare } from 'lucide-react';

export const PartnerApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-8 h-8 text-blue-600 dark:text-mpondo-gold-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
              Partner Approval
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Review and approve matters for billing readiness
          </p>
        </div>

        <PendingApprovalQueue />
      </div>
    </div>
  );
};
