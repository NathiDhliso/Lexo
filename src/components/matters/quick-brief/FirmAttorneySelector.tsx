/**
 * FirmAttorneySelector Component (Step 1)
 * Select or quick-add firm and attorney for the brief
 */

import React, { useState, useEffect } from 'react';
import { Building2, UserPlus } from 'lucide-react';
import { FormSelect } from '../../ui/FormSelect';
import { FormInput } from '../../ui/FormInput';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import type { QuickBriefMatterData } from '../../../types/quick-brief.types';
import { toast } from 'react-hot-toast';

export interface FirmAttorneySelectorProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

interface Firm {
  id: string;
  firm_name: string;
}

interface Attorney {
  id: string;
  attorney_name: string;
  email: string;
  phone?: string;
  firm_id: string;
}

export const FirmAttorneySelector: React.FC<FirmAttorneySelectorProps> = ({
  formData,
  onChange,
  advocateId
}) => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [loadingFirms, setLoadingFirms] = useState(true);
  const [loadingAttorneys, setLoadingAttorneys] = useState(false);

  // Quick add form state
  const [quickAddData, setQuickAddData] = useState({
    firm_name: '',
    attorney_name: '',
    email: '',
    phone: ''
  });

  // Load firms on mount
  useEffect(() => {
    loadFirms();
  }, [advocateId]);

  // Load attorneys when firm is selected
  useEffect(() => {
    if (formData.firm_id) {
      loadAttorneys(formData.firm_id);
    } else {
      setAttorneys([]);
    }
  }, [formData.firm_id]);

  const loadFirms = async () => {
    setLoadingFirms(true);
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('id, firm_name')
        .eq('advocate_id', advocateId)
        .order('firm_name');

      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error loading firms:', error);
      toast.error('Failed to load firms');
    } finally {
      setLoadingFirms(false);
    }
  };

  const loadAttorneys = async (firmId: string) => {
    setLoadingAttorneys(true);
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('id, attorney_name, email, phone, firm_id')
        .eq('firm_id', firmId)
        .order('attorney_name');

      if (error) throw error;
      setAttorneys(data || []);
    } catch (error) {
      console.error('Error loading attorneys:', error);
      toast.error('Failed to load attorneys');
    } finally {
      setLoadingAttorneys(false);
    }
  };

  const handleFirmChange = (firmId: string) => {
    const selectedFirm = firms.find(f => f.id === firmId);
    onChange({
      firm_id: firmId,
      firm_name: selectedFirm?.firm_name || '',
      attorney_id: undefined,
      attorney_name: '',
      attorney_email: '',
      attorney_phone: undefined
    });
  };

  const handleAttorneyChange = (attorneyId: string) => {
    const selectedAttorney = attorneys.find(a => a.id === attorneyId);
    if (selectedAttorney) {
      onChange({
        attorney_id: attorneyId,
        attorney_name: selectedAttorney.attorney_name,
        attorney_email: selectedAttorney.email,
        attorney_phone: selectedAttorney.phone
      });
    }
  };

  const handleQuickAdd = async () => {
    // Validate
    if (!quickAddData.firm_name.trim()) {
      toast.error('Firm name is required');
      return;
    }
    if (!quickAddData.attorney_name.trim()) {
      toast.error('Attorney name is required');
      return;
    }
    if (!quickAddData.email.trim()) {
      toast.error('Attorney email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(quickAddData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Create firm
      const { data: firm, error: firmError } = await supabase
        .from('firms')
        .insert({
          firm_name: quickAddData.firm_name.trim(),
          advocate_id: advocateId
        })
        .select()
        .single();

      if (firmError) throw firmError;

      // Create attorney
      const { data: attorney, error: attorneyError } = await supabase
        .from('attorneys')
        .insert({
          attorney_name: quickAddData.attorney_name.trim(),
          email: quickAddData.email.trim(),
          phone: quickAddData.phone.trim() || null,
          firm_id: firm.id
        })
        .select()
        .single();

      if (attorneyError) throw attorneyError;

      // Update form data
      onChange({
        firm_id: firm.id,
        firm_name: firm.firm_name,
        attorney_id: attorney.id,
        attorney_name: attorney.attorney_name,
        attorney_email: attorney.email,
        attorney_phone: attorney.phone
      });

      // Refresh lists
      await loadFirms();
      await loadAttorneys(firm.id);

      // Reset and hide quick add form
      setQuickAddData({ firm_name: '', attorney_name: '', email: '', phone: '' });
      setShowQuickAdd(false);
      toast.success('Firm and attorney added successfully');
    } catch (error) {
      console.error('Error adding firm/attorney:', error);
      toast.error('Failed to add firm and attorney');
    }
  };

  const isValid = formData.firm_name && formData.attorney_name && formData.attorney_email;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Who's instructing you?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select the firm and attorney, or add new ones
          </p>
        </div>
      </div>

      {!showQuickAdd ? (
        <>
          {/* Firm Selection */}
          <FormSelect
            label="Law Firm"
            value={formData.firm_id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFirmChange(e.target.value)}
            disabled={loadingFirms}
            required
          >
            <option value="">
              {loadingFirms ? 'Loading firms...' : 'Select a firm'}
            </option>
            {firms.map((firm) => (
              <option key={firm.id} value={firm.id}>
                {firm.firm_name}
              </option>
            ))}
          </FormSelect>

          {/* Attorney Selection */}
          <FormSelect
            label="Instructing Attorney"
            value={formData.attorney_id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAttorneyChange(e.target.value)}
            disabled={!formData.firm_id || loadingAttorneys}
            required
          >
            <option value="">
              {!formData.firm_id
                ? 'Select a firm first'
                : loadingAttorneys
                ? 'Loading attorneys...'
                : 'Select an attorney'}
            </option>
            {attorneys.map((attorney) => (
              <option key={attorney.id} value={attorney.id}>
                {attorney.attorney_name}
              </option>
            ))}
          </FormSelect>

          {/* Quick Add Button */}
          <Button
            variant="ghost"
            onClick={() => setShowQuickAdd(true)}
            className="w-full border-2 border-dashed border-neutral-300 dark:border-metallic-gray-600 hover:border-mpondo-gold-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Quick Add Firm & Attorney
          </Button>

          {/* Display selected attorney details */}
          {isValid && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                Selected Attorney Details:
              </p>
              <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                <p><strong>Firm:</strong> {formData.firm_name}</p>
                <p><strong>Attorney:</strong> {formData.attorney_name}</p>
                <p><strong>Email:</strong> {formData.attorney_email}</p>
                {formData.attorney_phone && (
                  <p><strong>Phone:</strong> {formData.attorney_phone}</p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Quick Add Form */}
          <div className="p-6 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/10 border-2 border-mpondo-gold-200 dark:border-mpondo-gold-800 rounded-lg space-y-4">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Quick Add New Firm & Attorney
            </h4>

            <FormInput
              label="Firm Name"
              value={quickAddData.firm_name}
              onChange={(e) => setQuickAddData({ ...quickAddData, firm_name: e.target.value })}
              placeholder="Enter firm name"
              required
            />

            <FormInput
              label="Attorney Name"
              value={quickAddData.attorney_name}
              onChange={(e) => setQuickAddData({ ...quickAddData, attorney_name: e.target.value })}
              placeholder="Enter attorney name"
              required
            />

            <FormInput
              label="Attorney Email"
              type="email"
              value={quickAddData.email}
              onChange={(e) => setQuickAddData({ ...quickAddData, email: e.target.value })}
              placeholder="attorney@firm.com"
              required
            />

            <FormInput
              label="Attorney Phone (Optional)"
              type="tel"
              value={quickAddData.phone}
              onChange={(e) => setQuickAddData({ ...quickAddData, phone: e.target.value })}
              placeholder="+27 XX XXX XXXX"
            />

            <div className="flex gap-2 pt-2">
              <Button
                variant="primary"
                onClick={handleQuickAdd}
                className="flex-1"
              >
                Add & Select
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowQuickAdd(false);
                  setQuickAddData({ firm_name: '', attorney_name: '', email: '', phone: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FirmAttorneySelector;
