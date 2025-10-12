/**
 * FooterCustomization Component
 * 
 * Controls for PDF footer content including terms & conditions,
 * thank you message, bank details, and page numbers.
 */

import React from 'react';
import { FooterCustomizationProps } from './types';

export const FooterCustomization: React.FC<FooterCustomizationProps> = ({ value, onChange }) => {
  const handleChange = <K extends keyof typeof value>(key: K, newValue: typeof value[K]) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  const handleBankDetailsChange = <K extends keyof typeof value.bankDetails>(
    key: K,
    newValue: typeof value.bankDetails[K]
  ) => {
    onChange({
      ...value,
      bankDetails: {
        ...value.bankDetails,
        [key]: newValue,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Footer Customization
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Configure footer content for your PDF documents
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Terms & Conditions
          </label>
          <button
            type="button"
            onClick={() => handleChange('showTerms', !value.showTerms)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value.showTerms ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value.showTerms ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        {value.showTerms && (
          <textarea
            value={value.termsText}
            onChange={e => handleChange('termsText', e.target.value)}
            rows={3}
            placeholder="Enter terms and conditions..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent resize-none"
          />
        )}
      </div>

      {/* Thank You Message */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Thank You Message
          </label>
          <button
            type="button"
            onClick={() => handleChange('showThankYou', !value.showThankYou)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value.showThankYou ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value.showThankYou ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        {value.showThankYou && (
          <textarea
            value={value.thankYouText}
            onChange={e => handleChange('thankYouText', e.target.value)}
            rows={2}
            placeholder="Enter thank you message..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent resize-none"
          />
        )}
      </div>

      {/* Bank Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Bank Details
          </label>
          <button
            type="button"
            onClick={() => handleChange('showBankDetails', !value.showBankDetails)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value.showBankDetails ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value.showBankDetails ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
        {value.showBankDetails && (
          <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={value.bankDetails.bankName}
                onChange={e => handleBankDetailsChange('bankName', e.target.value)}
                placeholder="e.g., Standard Bank"
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={value.bankDetails.accountName}
                onChange={e => handleBankDetailsChange('accountName', e.target.value)}
                placeholder="e.g., John Doe Attorneys"
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={value.bankDetails.accountNumber}
                  onChange={e => handleBankDetailsChange('accountNumber', e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Branch Code
                </label>
                <input
                  type="text"
                  value={value.bankDetails.branchCode}
                  onChange={e => handleBankDetailsChange('branchCode', e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Account Type
              </label>
              <select
                value={value.bankDetails.accountType}
                onChange={e => handleBankDetailsChange('accountType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
              >
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Page Numbers */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Show Page Numbers
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Display page numbers in footer
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleChange('showPageNumbers', !value.showPageNumbers)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${value.showPageNumbers ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${value.showPageNumbers ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Show Timestamp
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Display generation date and time
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleChange('showTimestamp', !value.showTimestamp)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${value.showTimestamp ? 'bg-mpondo-gold-500' : 'bg-neutral-300 dark:bg-neutral-600'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${value.showTimestamp ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Preview */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          Footer Preview
        </div>
        <div className="space-y-3 p-4 bg-white dark:bg-neutral-900 rounded border-t-2 border-neutral-300 dark:border-neutral-600">
          {value.showTerms && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              <strong>Terms:</strong> {value.termsText || 'No terms specified'}
            </div>
          )}
          {value.showThankYou && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400 italic">
              {value.thankYouText || 'No thank you message'}
            </div>
          )}
          {value.showBankDetails && value.bankDetails.bankName && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              <strong>Banking Details:</strong> {value.bankDetails.bankName} |{' '}
              {value.bankDetails.accountName} | Acc: {value.bankDetails.accountNumber} | Branch:{' '}
              {value.bankDetails.branchCode} | Type: {value.bankDetails.accountType}
            </div>
          )}
          <div className="flex justify-between text-2xs text-neutral-500 dark:text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            {value.showPageNumbers && <span>Page 1 of 1</span>}
            {value.showTimestamp && <span>Generated: {new Date().toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
