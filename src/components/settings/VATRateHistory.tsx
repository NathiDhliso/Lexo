/**
 * VAT Rate History Component
 * Allows tracking of VAT rate changes over time
 * Requirements: 3.8, 3.9
 */

import React, { useState, useEffect } from 'react';
import { invoiceNumberingService } from '../../services/api/invoice-numbering.service';
import { InvoiceSettings } from '../../types/invoice-settings.types';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const VATRateHistory: React.FC = () => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newRate, setNewRate] = useState(15);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await invoiceNumberingService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load VAT rate history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async () => {
    try {
      if (!effectiveDate) {
        toast.error('Effective date is required');
        return;
      }

      if (newRate < 0 || newRate > 100) {
        toast.error('VAT rate must be between 0 and 100');
        return;
      }

      setSaving(true);
      await invoiceNumberingService.addVATRateChange(
        newRate / 100, // Convert to decimal
        effectiveDate,
        notes || undefined
      );

      toast.success('VAT rate change added successfully');
      setShowAddForm(false);
      setNewRate(15);
      setEffectiveDate('');
      setNotes('');
      await loadSettings();
    } catch (error) {
      console.error('Error adding VAT rate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add VAT rate');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentRate = () => {
    if (!settings) return 15;
    
    const today = new Date();
    let currentRate = settings.vat_rate * 100;

    // Find the most recent rate that's effective
    if (settings.vat_rate_history && settings.vat_rate_history.length > 0) {
      const sortedHistory = [...settings.vat_rate_history].sort(
        (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      );

      for (const entry of sortedHistory) {
        if (new Date(entry.effective_date) <= today) {
          currentRate = entry.rate * 100;
          break;
        }
      }
    }

    return currentRate;
  };

  const getFutureRates = () => {
    if (!settings || !settings.vat_rate_history) return [];
    
    const today = new Date();
    return settings.vat_rate_history
      .filter(entry => new Date(entry.effective_date) > today)
      .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime());
  };

  const getPastRates = () => {
    if (!settings || !settings.vat_rate_history) return [];
    
    const today = new Date();
    return settings.vat_rate_history
      .filter(entry => new Date(entry.effective_date) <= today)
      .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentRate = getCurrentRate();
  const futureRates = getFutureRates();
  const pastRates = getPastRates();

  return (
    <div className="space-y-6">
      {/* Current Rate */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Current VAT Rate</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-600">{currentRate.toFixed(2)}%</p>
            <p className="text-sm text-gray-600 mt-1">
              Effective for all new invoices
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="secondary"
          >
            {showAddForm ? 'Cancel' : 'Schedule Rate Change'}
          </Button>
        </div>
      </div>

      {/* Add New Rate Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Schedule VAT Rate Change</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New VAT Rate (%)
              </label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <FormInput
              label="Effective Date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Government announced VAT increase"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowAddForm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRate}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Add Rate Change'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Future Rate Changes */}
      {futureRates.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Scheduled Rate Changes</h3>
          <div className="space-y-3">
            {futureRates.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div>
                  <p className="font-semibold text-blue-900">
                    {(entry.rate * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-blue-700">
                    Effective: {format(new Date(entry.effective_date), 'MMMM d, yyyy')}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                  )}
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Rates */}
      {pastRates.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Rate History</h3>
          <div className="space-y-2">
            {pastRates.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {(entry.rate * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Effective: {format(new Date(entry.effective_date), 'MMMM d, yyyy')}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                  )}
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                  Historical
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">How VAT Rate History Works</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Schedule future VAT rate changes in advance</li>
          <li>The system automatically applies the correct rate based on invoice date</li>
          <li>Historical rates are preserved for audit purposes</li>
          <li>All rate changes are tracked for SARS compliance</li>
        </ul>
      </div>
    </div>
  );
};
