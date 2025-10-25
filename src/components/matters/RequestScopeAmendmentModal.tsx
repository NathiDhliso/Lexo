/**
 * RequestScopeAmendmentModal Component
 * Modal for requesting scope amendments when work scope changes mid-matter
 */
import React, { useState } from 'react';
import { Button, Input } from '../design-system/components';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { formatRand } from '../../lib/currency';
import type { Matter } from '../../types';

interface RequestScopeAmendmentModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AdditionalService {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export const RequestScopeAmendmentModal: React.FC<RequestScopeAmendmentModalProps> = ({
  isOpen,
  matter,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([
    { description: '', hours: 0, rate: 2500, amount: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !matter) return null;

  const originalEstimate = (matter as any).estimated_value || matter.wip_value || 0;
  const amendmentTotal = additionalServices.reduce((sum, service) => sum + service.amount, 0);
  const newTotal = originalEstimate + amendmentTotal;

  const handleAddService = () => {
    setAdditionalServices([
      ...additionalServices,
      { description: '', hours: 0, rate: 2500, amount: 0 }
    ]);
  };

  const handleRemoveService = (index: number) => {
    setAdditionalServices(additionalServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof AdditionalService, value: string | number) => {
    const updated = [...additionalServices];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate amount
    if (field === 'hours' || field === 'rate') {
      updated[index].amount = updated[index].hours * updated[index].rate;
    }
    
    setAdditionalServices(updated);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the scope amendment');
      return;
    }

    if (additionalServices.length === 0 || !additionalServices[0].description) {
      toast.error('Please add at least one additional service');
      return;
    }

    const loadingToast = toast.loading('Creating scope amendment request...');
    
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create scope amendment record
      const { error: amendmentError } = await supabase
        .from('scope_amendments')
        .insert({
          matter_id: matter.id,
          advocate_id: user.id,
          amendment_type: 'scope_increase',
          reason: reason,
          description: additionalServices.map(s => `${s.description} (${s.hours}h @ ${formatRand(s.rate)})`).join('\n'),
          original_estimate: originalEstimate,
          new_estimate: newTotal,
          variance_amount: amendmentTotal,
          variance_percentage: originalEstimate > 0 ? (amendmentTotal / originalEstimate) * 100 : 0,
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select()
        .single();

      if (amendmentError) throw amendmentError;

      toast.success('Scope amendment request sent to attorney', { 
        id: loadingToast,
        duration: 4000 
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating scope amendment:', error);
      toast.error('Failed to create scope amendment request', { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-3xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-judicial-blue-600 dark:text-judicial-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Request Scope Amendment
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Add services beyond original scope
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Matter Details */}
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {matter.title}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Original Estimate:</span>
                <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(originalEstimate)}
                </span>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Current WIP:</span>
                <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(matter.wip_value || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Reason for Amendment <span className="text-status-error-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="e.g., Opposing counsel filed new papers requiring additional work..."
              className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-judicial-blue-500"
            />
          </div>

          {/* Additional Services */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Additional Services <span className="text-status-error-500">*</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddService}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Service
              </Button>
            </div>

            <div className="space-y-3">
              {additionalServices.map((service, index) => (
                <div key={index} className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <Input
                        type="text"
                        value={service.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'description', e.target.value)}
                        placeholder="Service description (e.g., Draft replying affidavit)"
                      />
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            Hours
                          </label>
                          <Input
                            type="number"
                            value={service.hours || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'hours', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.5"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            Rate
                          </label>
                          <Input
                            type="number"
                            value={service.rate || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            Amount
                          </label>
                          <div className="px-3 py-2 bg-neutral-100 dark:bg-metallic-gray-700 rounded-lg text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {formatRand(service.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {additionalServices.length > 1 && (
                      <button
                        onClick={() => handleRemoveService(index)}
                        className="p-2 text-status-error-500 hover:bg-status-error-50 dark:hover:bg-status-error-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Original Pro Forma:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatRand(originalEstimate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700 dark:text-neutral-300">Amendment Services:</span>
                <span className="font-medium text-judicial-blue-700 dark:text-judicial-blue-300">
                  + {formatRand(amendmentTotal)}
                </span>
              </div>
              <div className="border-t border-judicial-blue-200 dark:border-judicial-blue-700 pt-2 flex justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">New Total:</span>
                <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  {formatRand(newTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>What happens next:</strong> The attorney will receive this amendment request for approval. 
              You can continue with the original scope while waiting for approval.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1 bg-judicial-blue-600 hover:bg-judicial-blue-700"
              disabled={isLoading}
            >
              Send Amendment Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
