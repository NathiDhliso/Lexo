/**
 * ViewMatterDetails - Simple read-only matter view
 * For quick viewing without full detail tabs
 */

import React from 'react';
import { Edit, User, Building2, Phone, Mail, Calendar, DollarSign, FileText, Briefcase } from 'lucide-react';
import { Button } from '../../../ui/Button';
import type { Matter } from '../../../../types';

export interface ViewMatterDetailsProps {
  matter: Matter;
  onEdit: (matter: Matter) => void;
  onClose: () => void;
}

export const ViewMatterDetails: React.FC<ViewMatterDetailsProps> = ({
  matter,
  onEdit,
  onClose,
}) => {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{matter.title}</h3>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            matter.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            matter.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
            matter.status === 'settled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
          }`}>
            {matter.status}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Ref: {matter.reference_number}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Info */}
        <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Client Information</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-neutral-600 dark:text-neutral-400">Name</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.client_name}</dd>
            </div>
            {matter.client_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_email}</dd>
              </div>
            )}
            {matter.client_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_phone}</dd>
              </div>
            )}
            {matter.client_address && (
              <div>
                <dt className="text-neutral-600 dark:text-neutral-400">Address</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.client_address}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Attorney Info */}
        <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Instructing Attorney</h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-neutral-600 dark:text-neutral-400">Attorney</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_attorney}</dd>
            </div>
            {matter.instructing_firm && (
              <div>
                <dt className="text-neutral-600 dark:text-neutral-400">Firm</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_firm}</dd>
              </div>
            )}
            {matter.instructing_attorney_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" />
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_attorney_email}</dd>
              </div>
            )}
            {matter.instructing_attorney_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                <dd className="text-neutral-700 dark:text-neutral-300">{matter.instructing_attorney_phone}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Description */}
      {matter.description && (
        <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Description</h4>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{matter.description}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Matter Type</span>
          </div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{matter.matter_type}</p>
        </div>

        {matter.estimated_fee && (
          <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Estimated Fee</span>
            </div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(matter.estimated_fee)}</p>
          </div>
        )}

        <div className="bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Created</span>
          </div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{formatDate(matter.created_at)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
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
    </div>
  );
};

export default ViewMatterDetails;
