import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button, Input, Select, Textarea } from '../design-system/components';
import { matterApiService } from '../../services/api';
import { toast } from 'react-hot-toast';
import type { Matter } from '../../types';

interface EditMatterModalProps {
  matter: Matter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const MATTER_TYPES = [
  'Personal Injury',
  'Motor Vehicle Accident',
  'Medical Malpractice',
  'Product Liability',
  'Workplace Injury',
  'Property Damage',
  'Contract Dispute',
  'Insurance Claim',
  'Commercial Litigation',
  'Contract Law',
  'Employment Law',
  'Family Law',
  'Criminal Law',
  'Property Law',
  'Intellectual Property',
  'Tax Law',
  'Constitutional Law',
  'Administrative Law',
  'Other'
];

export const EditMatterModal: React.FC<EditMatterModalProps> = ({
  matter,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    matter_type: '',
    description: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    instructing_attorney: '',
    instructing_firm: '',
    instructing_attorney_email: '',
    instructing_attorney_phone: '',
    estimated_fee: 0,
    status: 'active'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (matter) {
      setFormData({
        title: matter.title || '',
        matter_type: matter.matter_type || '',
        description: matter.description || '',
        client_name: matter.client_name || '',
        client_email: matter.client_email || '',
        client_phone: matter.client_phone || '',
        client_address: matter.client_address || '',
        instructing_attorney: matter.instructing_attorney || '',
        instructing_firm: matter.instructing_firm || '',
        instructing_attorney_email: matter.instructing_attorney_email || '',
        instructing_attorney_phone: matter.instructing_attorney_phone || '',
        estimated_fee: matter.estimated_fee || 0,
        status: matter.status || 'active'
      });
    }
  }, [matter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matter) return;

    setIsSaving(true);
    try {
      const result = await matterApiService.update(matter.id, formData);
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to update matter');
        return;
      }

      toast.success('Matter updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating matter:', error);
      toast.error('Failed to update matter');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !matter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-metallic-gray-700">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Edit Matter</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Matter Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Matter Type *
                </label>
                <Select
                  value={formData.matter_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, matter_type: e.target.value }))}
                  required
                >
                  <option value="">Select matter type</option>
                  {MATTER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="settled">Settled</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Client Name *
                  </label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Client Email
                  </label>
                  <Input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Client Phone
                  </label>
                  <Input
                    value={formData.client_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Client Address
                  </label>
                  <Input
                    value={formData.client_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Attorney Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Instructing Attorney *
                  </label>
                  <Input
                    value={formData.instructing_attorney}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Law Firm
                  </label>
                  <Input
                    value={formData.instructing_firm}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructing_firm: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Attorney Email
                  </label>
                  <Input
                    type="email"
                    value={formData.instructing_attorney_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Attorney Phone
                  </label>
                  <Input
                    value={formData.instructing_attorney_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructing_attorney_phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-metallic-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Estimated Fee (R)
                  </label>
                  <Input
                    type="number"
                    value={formData.estimated_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_fee: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
