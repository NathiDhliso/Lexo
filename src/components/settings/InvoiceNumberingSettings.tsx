/**
 * Invoice Numbering Settings Component
 * Configure invoice numbering mode (strict/flexible) and preferences
 * Requirements: 5.1, 5.7
 */

import React, { useState, useEffect } from 'react';
import { Settings, AlertCircle, CheckCircle, Info, Hash } from 'lucide-react';
import { invoiceNumberingService } from '../../services/api/invoice-numbering.service';
import { toast } from 'react-hot-toast';
import { InvoiceSettings } from '../../types/invoice-settings.types';

export const InvoiceNumberingSettings: React.FC = () => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [numberingMode, setNumberingMode] = useState<'strict' | 'flexible'>('strict');
  const [yearResetEnabled, setYearResetEnabled] = useState(true);
  const [allowManualNumbers, setAllowManualNumbers] = useState(false);
  const [gapToleranceDays, setGapToleranceDays] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await invoiceNumberingService.getSettings();
      setSettings(data);
      
      // Populate form from settings
      setNumberingMode((data as any).invoice_numbering_mode || 'strict');
      setYearResetEnabled((data as any).year_reset_enabled !== false);
      setAllowManualNumbers((data as any).allow_manual_numbers || false);
      setGapToleranceDays((data as any).gap_tolerance_days || 0);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load invoice numbering settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updates = {
        invoice_numbering_mode: numberingMode,
        year_reset_enabled: yearResetEnabled,
        allow_manual_numbers: allowManualNumbers,
        gap_tolerance_days: gapToleranceDays,
      };

      await invoiceNumberingService.updateSettings(updates as any);
      toast.success('Invoice numbering settings saved successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load invoice numbering settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <Hash className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
            Invoice Numbering Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Configure how invoice numbers are generated and managed
          </p>
        </div>
      </div>

      {/* Current Sequence Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Current Sequence Information
            </p>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>
                <span className="font-medium">Next Invoice Number:</span>{' '}
                {settings.invoice_number_format.replace('YYYY', settings.invoice_sequence_year.toString())
                  .replace('NNN', String(settings.invoice_sequence_current + 1).padStart(3, '0'))
                  .replace('NNNN', String(settings.invoice_sequence_current + 1).padStart(4, '0'))}
              </p>
              <p>
                <span className="font-medium">Current Sequence:</span> {settings.invoice_sequence_current}
              </p>
              <p>
                <span className="font-medium">Sequence Year:</span> {settings.invoice_sequence_year}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numbering Mode */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
          Numbering Mode
        </h3>

        <div className="space-y-4">
          {/* Strict Mode */}
          <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-metallic-gray-700/50 transition-colors"
            style={{
              borderColor: numberingMode === 'strict' ? '#3b82f6' : 'rgb(229, 231, 235)',
            }}
          >
            <input
              type="radio"
              name="numberingMode"
              value="strict"
              checked={numberingMode === 'strict'}
              onChange={() => setNumberingMode('strict')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-neutral-100">
                  Strict Sequential (Recommended)
                </span>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                  SARS Compliant
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                No gaps allowed in invoice numbering sequence. If an invoice is voided, it will block the sequence until resolved.
                This ensures complete audit trail compliance.
              </p>
            </div>
          </label>

          {/* Flexible Mode */}
          <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-metallic-gray-700/50 transition-colors"
            style={{
              borderColor: numberingMode === 'flexible' ? '#3b82f6' : 'rgb(229, 231, 235)',
            }}
          >
            <input
              type="radio"
              name="numberingMode"
              value="flexible"
              checked={numberingMode === 'flexible'}
              onChange={() => setNumberingMode('flexible')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-neutral-100">
                  Flexible with Gap Logging
                </span>
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs rounded">
                  Audited
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Gaps in invoice sequence are allowed but logged in audit trail with reasons. Useful for practices with multiple
                billing staff or external invoice generation.
              </p>
            </div>
          </label>
        </div>

        {/* Gap Tolerance (only for flexible mode) */}
        {numberingMode === 'flexible' && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-metallic-gray-700/30 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Gap Tolerance Days
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={gapToleranceDays}
              onChange={(e) => setGapToleranceDays(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-metallic-gray-800 dark:text-neutral-100"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              Number of days to wait before alerting about gaps in sequence. Set to 0 for immediate alerts.
            </p>
          </div>
        )}
      </div>

      {/* Year Reset */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
          Year Reset Options
        </h3>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={yearResetEnabled}
            onChange={(e) => setYearResetEnabled(e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-neutral-100 mb-1">
              Auto-reset sequence on January 1st
            </div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Automatically reset invoice sequence to 1 at the start of each new year. 
              Common practice for annual tax reporting.
            </p>
          </div>
        </label>

        {yearResetEnabled && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <p>
                Next reset will occur on January 1, {new Date().getFullYear() + 1}. 
                Sequence will restart from 1.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Override */}
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
          Advanced Options
        </h3>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowManualNumbers}
            onChange={(e) => setAllowManualNumbers(e.target.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-neutral-100 mb-1">
              Allow manual invoice number entry
            </div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Enable manual override of auto-generated invoice numbers. All manual entries will be logged in audit trail.
            </p>
          </div>
        </label>

        {allowManualNumbers && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-orange-800 dark:text-orange-300">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Warning:</strong> Manual number entry can create gaps in your sequence. 
                Use only when absolutely necessary and ensure proper documentation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-metallic-gray-700">
        <button
          onClick={loadSettings}
          className="px-6 py-2 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg"
          disabled={saving}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
