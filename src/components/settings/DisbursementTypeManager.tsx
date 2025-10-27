/**
 * Disbursement Type Manager Component
 * Manage custom disbursement types with VAT rules
 * Requirements: 6.4
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle, Save, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { DisbursementVATService, DisbursementType, VATTreatment, DisbursementCategory } from '../../services/api/disbursement-vat.service';
import { toast } from 'react-hot-toast';

interface EditingType {
  id?: string;
  typeName: string;
  description: string;
  vatTreatment: VATTreatment;
  vatRate: number;
  category: DisbursementCategory;
  sarsCode: string;
}

export const DisbursementTypeManager: React.FC = () => {
  const [types, setTypes] = useState<DisbursementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState<EditingType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setIsLoading(true);
    try {
      const data = await DisbursementVATService.getDisbursementTypes();
      setTypes(data);
    } catch (_error) {
      toast.error('Failed to load disbursement types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingType({
      typeName: '',
      description: '',
      vatTreatment: 'suggest_vat',
      vatRate: 0.15,
      category: 'other',
      sarsCode: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (type: DisbursementType) => {
    setEditingType({
      id: type.id,
      typeName: type.type_name,
      description: type.description || '',
      vatTreatment: type.vat_treatment,
      vatRate: type.vat_rate,
      category: type.category,
      sarsCode: type.sars_code || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingType) return;

    if (!editingType.typeName.trim()) {
      toast.error('Type name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingType.id) {
        // Update existing
        await DisbursementVATService.updateDisbursementType(editingType.id, {
          typeName: editingType.typeName,
          description: editingType.description,
          vatTreatment: editingType.vatTreatment,
          vatRate: editingType.vatRate,
          category: editingType.category,
          sarsCode: editingType.sarsCode
        });
        toast.success('Disbursement type updated');
      } else {
        // Create new
        await DisbursementVATService.createDisbursementType({
          typeName: editingType.typeName,
          description: editingType.description,
          vatTreatment: editingType.vatTreatment,
          vatRate: editingType.vatRate,
          category: editingType.category,
          sarsCode: editingType.sarsCode
        });
        toast.success('Disbursement type created');
      }

      setIsEditing(false);
      setEditingType(null);
      loadTypes();
    } catch (_error) {
      // Error handled by service
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, typeName: string) => {
    if (!window.confirm(`Delete "${typeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await DisbursementVATService.deleteDisbursementType(id);
      toast.success('Disbursement type deleted');
      loadTypes();
    } catch (_error) {
      // Error handled by service
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingType(null);
  };

  const getVATTreatmentLabel = (treatment: VATTreatment): string => {
    const labels: Record<VATTreatment, string> = {
      always_vat: 'Always VAT',
      never_vat: 'Never VAT',
      suggest_vat: 'Suggest VAT',
      suggest_no_vat: 'Suggest No VAT'
    };
    return labels[treatment];
  };

  const getVATTreatmentBadge = (treatment: VATTreatment) => {
    const styles: Record<VATTreatment, string> = {
      always_vat: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      never_vat: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      suggest_vat: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      suggest_no_vat: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[treatment]}`}>
        {getVATTreatmentLabel(treatment)}
      </span>
    );
  };

  const getCategoryLabel = (category: DisbursementCategory): string => {
    const labels: Record<DisbursementCategory, string> = {
      court_fees: 'Court Fees',
      travel: 'Travel',
      accommodation: 'Accommodation',
      document_fees: 'Document Fees',
      expert_fees: 'Expert Fees',
      other: 'Other'
    };
    return labels[category];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Disbursement Types
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Manage custom disbursement types and VAT rules for SARS compliance
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={isEditing}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Type
        </Button>
      </div>

      {/* Edit Form */}
      {isEditing && editingType && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {editingType.id ? 'Edit Disbursement Type' : 'Create Disbursement Type'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Type Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Type Name *
              </label>
              <input
                type="text"
                value={editingType.typeName}
                onChange={(e) => setEditingType({ ...editingType, typeName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., Expert Witness Fees"
                disabled={isSaving}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={editingType.description}
                onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                rows={2}
                placeholder="Optional description"
                disabled={isSaving}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Category *
              </label>
              <select
                value={editingType.category}
                onChange={(e) => setEditingType({ ...editingType, category: e.target.value as DisbursementCategory })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                disabled={isSaving}
              >
                <option value="court_fees">Court Fees</option>
                <option value="travel">Travel</option>
                <option value="accommodation">Accommodation</option>
                <option value="document_fees">Document Fees</option>
                <option value="expert_fees">Expert Fees</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* VAT Treatment */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                VAT Treatment *
              </label>
              <select
                value={editingType.vatTreatment}
                onChange={(e) => setEditingType({ ...editingType, vatTreatment: e.target.value as VATTreatment })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                disabled={isSaving}
              >
                <option value="always_vat">Always VAT</option>
                <option value="never_vat">Never VAT</option>
                <option value="suggest_vat">Suggest VAT</option>
                <option value="suggest_no_vat">Suggest No VAT</option>
              </select>
            </div>

            {/* VAT Rate */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={editingType.vatRate * 100}
                onChange={(e) => setEditingType({ ...editingType, vatRate: parseFloat(e.target.value) / 100 })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                disabled={isSaving}
              />
            </div>

            {/* SARS Code */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                SARS Code
              </label>
              <input
                type="text"
                value={editingType.sarsCode}
                onChange={(e) => setEditingType({ ...editingType, sarsCode: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100"
                placeholder="e.g., 3701"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* System Defaults Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
              System Default Types
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              System default types cannot be deleted but can be edited. Changes will only apply to your practice.
            </p>
          </div>
        </div>
      </div>

      {/* Types Table */}
      <div className="bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  VAT Treatment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-metallic-gray-700">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-neutral-50 dark:hover:bg-metallic-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {type.type_name}
                      </div>
                      {type.description && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {type.description}
                        </div>
                      )}
                      {type.sars_code && (
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                          SARS Code: {type.sars_code}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                    {getCategoryLabel(type.category)}
                  </td>
                  <td className="px-6 py-4">
                    {getVATTreatmentBadge(type.vat_treatment)}
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {(type.vat_rate * 100).toFixed(0)}% VAT
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-900 dark:text-neutral-100">
                      <TrendingUp className="w-4 h-4 text-neutral-400" />
                      {type.usage_count || 0} times
                    </div>
                    {type.last_used_at && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Last: {new Date(type.last_used_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.is_system_default 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {type.is_system_default ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!type.is_system_default && (
                        <button
                          onClick={() => handleDelete(type.id, type.type_name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {types.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No disbursement types found. Create your first custom type above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
