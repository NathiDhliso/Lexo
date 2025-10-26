/**
 * Invoice Settings Form Component
 * Allows advocates to configure invoice numbering and VAT settings
 * Requirements: 3.1, 3.5, 3.8
 */

import React, { useState, useEffect } from 'react';
import { invoiceNumberingService } from '../../services/api/invoice-numbering.service';
import {
  InvoiceSettings,
  InvoiceSettingsUpdate,
  INVOICE_NUMBER_FORMAT_PRESETS,
  CREDIT_NOTE_FORMAT_PRESETS
} from '../../types/invoice-settings.types';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { toast } from 'react-hot-toast';

export const InvoiceSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('');
  const [previewCreditNoteNumber, setPreviewCreditNoteNumber] = useState('');

  // Form state
  const [invoiceFormat, setInvoiceFormat] = useState('INV-YYYY-NNN');
  const [creditNoteFormat, setCreditNoteFormat] = useState('CN-YYYY-NNN');
  const [vatRegistered, setVatRegistered] = useState(false);
  const [vatNumber, setVatNumber] = useState('');
  const [vatRate, setVatRate] = useState(15);
  const [advocateName, setAdvocateName] = useState('');
  const [advocateAddress, setAdvocateAddress] = useState('');
  const [advocatePhone, setAdvocatePhone] = useState('');
  const [advocateEmail, setAdvocateEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      updatePreviews();
    }
  }, [invoiceFormat, creditNoteFormat, settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await invoiceNumberingService.getSettings();
      setSettings(data);
      
      // Populate form
      setInvoiceFormat(data.invoice_number_format);
      setCreditNoteFormat(data.credit_note_format);
      setVatRegistered(data.vat_registered);
      setVatNumber(data.vat_number || '');
      setVatRate(data.vat_rate * 100); // Convert to percentage
      setAdvocateName(data.advocate_full_name || '');
      setAdvocateAddress(data.advocate_address || '');
      setAdvocatePhone(data.advocate_phone || '');
      setAdvocateEmail(data.advocate_email || '');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load invoice settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreviews = async () => {
    try {
      const invoicePreview = await invoiceNumberingService.previewNextInvoiceNumber();
      const creditNotePreview = await invoiceNumberingService.previewNextCreditNoteNumber();
      setPreviewInvoiceNumber(invoicePreview);
      setPreviewCreditNoteNumber(creditNotePreview);
    } catch (error) {
      console.error('Error updating previews:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (vatRegistered && !vatNumber.trim()) {
        toast.error('VAT number is required when VAT registered');
        return;
      }

      if (vatRate < 0 || vatRate > 100) {
        toast.error('VAT rate must be between 0 and 100');
        return;
      }

      setSaving(true);

      const updates: InvoiceSettingsUpdate = {
        invoice_number_format: invoiceFormat,
        credit_note_format: creditNoteFormat,
        vat_registered: vatRegistered,
        vat_number: vatRegistered ? vatNumber : undefined,
        vat_rate: vatRate / 100, // Convert to decimal
        advocate_full_name: advocateName || undefined,
        advocate_address: advocateAddress || undefined,
        advocate_phone: advocatePhone || undefined,
        advocate_email: advocateEmail || undefined
      };

      await invoiceNumberingService.updateSettings(updates);
      toast.success('Invoice settings saved successfully');
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

  return (
    <div className="space-y-6">
      {/* Invoice Number Format */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Invoice Numbering</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number Format
            </label>
            <select
              value={invoiceFormat}
              onChange={(e) => setInvoiceFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {INVOICE_NUMBER_FORMAT_PRESETS.map((preset) => (
                <option key={preset.format} value={preset.format}>
                  {preset.label} - {preset.example}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {INVOICE_NUMBER_FORMAT_PRESETS.find(p => p.format === invoiceFormat)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Note Format
            </label>
            <select
              value={creditNoteFormat}
              onChange={(e) => setCreditNoteFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CREDIT_NOTE_FORMAT_PRESETS.map((preset) => (
                <option key={preset.format} value={preset.format}>
                  {preset.label} - {preset.example}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {CREDIT_NOTE_FORMAT_PRESETS.find(p => p.format === creditNoteFormat)?.description}
            </p>
          </div>

          {settings && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Invoice Sequence:</span>
                  <span className="ml-2 font-semibold">{settings.invoice_sequence_current}</span>
                </div>
                <div>
                  <span className="text-gray-600">Next Invoice Number:</span>
                  <span className="ml-2 font-semibold text-blue-600">{previewInvoiceNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Credit Note Sequence:</span>
                  <span className="ml-2 font-semibold">{settings.credit_note_sequence_current}</span>
                </div>
                <div>
                  <span className="text-gray-600">Next Credit Note Number:</span>
                  <span className="ml-2 font-semibold text-blue-600">{previewCreditNoteNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VAT Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">VAT Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vatRegistered"
              checked={vatRegistered}
              onChange={(e) => setVatRegistered(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="vatRegistered" className="ml-2 block text-sm text-gray-900">
              I am VAT registered
            </label>
          </div>

          {vatRegistered && (
            <>
              <FormInput
                label="VAT Registration Number"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="4123456789"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT Rate (%)
                </label>
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Current South African VAT rate is 15%
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Advocate Details for Tax Invoices */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Advocate Details (for Tax Invoices)</h3>
        <p className="text-sm text-gray-600 mb-4">
          These details will appear on your tax invoices as required by SARS
        </p>
        
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            value={advocateName}
            onChange={(e) => setAdvocateName(e.target.value)}
            placeholder="John Doe"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={advocateAddress}
              onChange={(e) => setAdvocateAddress(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street&#10;Johannesburg, 2000&#10;South Africa"
            />
          </div>

          <FormInput
            label="Phone Number"
            value={advocatePhone}
            onChange={(e) => setAdvocatePhone(e.target.value)}
            placeholder="+27 11 123 4567"
          />

          <FormInput
            label="Email Address"
            type="email"
            value={advocateEmail}
            onChange={(e) => setAdvocateEmail(e.target.value)}
            placeholder="advocate@example.com"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">SARS Compliance</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Invoice numbers must be sequential and cannot have gaps</li>
          <li>VAT registered businesses must issue tax invoices with all required details</li>
          <li>Keep records of all invoice numbers, including voided ones</li>
          <li>VAT rate changes must be tracked with effective dates</li>
        </ul>
      </div>
    </div>
  );
};
