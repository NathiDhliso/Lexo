/**
 * Invoice Numbering Audit Log Component
 * Displays audit trail of all invoice numbers for SARS compliance
 * Requirements: 3.4, 3.9
 */

import React, { useState, useEffect } from 'react';
import { invoiceNumberingService } from '../../services/api/invoice-numbering.service';
import { InvoiceNumberingAudit } from '../../types/invoice-settings.types';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export const InvoiceNumberingAuditLog: React.FC = () => {
  const [auditRecords, setAuditRecords] = useState<InvoiceNumberingAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberType, setNumberType] = useState<'invoice' | 'credit_note' | ''>('');
  const [status, setStatus] = useState<'used' | 'voided' | ''>('');

  useEffect(() => {
    loadAuditRecords();
  }, [startDate, endDate, numberType, status]);

  const loadAuditRecords = async () => {
    try {
      setLoading(true);
      const data = await invoiceNumberingService.getNumberingAudit(
        startDate || undefined,
        endDate || undefined,
        numberType || undefined,
        status || undefined
      );
      setAuditRecords(data);
    } catch (error) {
      console.error('Error loading audit records:', error);
      toast.error('Failed to load audit records');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvContent = await invoiceNumberingService.exportAuditToCSV(
        startDate || undefined,
        endDate || undefined
      );

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-numbering-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Audit log exported successfully');
    } catch (error) {
      console.error('Error exporting audit log:', error);
      toast.error('Failed to export audit log');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'used') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Used
        </span>
      );
    } else if (status === 'voided') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Voided
        </span>
      );
    }
    return null;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'invoice') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Invoice
        </span>
      );
    } else if (type === 'credit_note') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Credit Note
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={numberType}
              onChange={(e) => setNumberType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="credit_note">Credit Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="used">Used</option>
              <option value="voided">Voided</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleExportCSV}
            disabled={exporting || auditRecords.length === 0}
            variant="secondary"
          >
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Audit Log</h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete history of all invoice and credit note numbers
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : auditRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Void Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={record.status === 'voided' ? 'bg-red-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {record.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(record.number_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.invoice_id ? (
                        <span className="font-mono text-xs">{record.invoice_id.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.void_reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {auditRecords.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Records:</span>
              <span className="ml-2 font-semibold">{auditRecords.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Used:</span>
              <span className="ml-2 font-semibold text-green-600">
                {auditRecords.filter(r => r.status === 'used').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Voided:</span>
              <span className="ml-2 font-semibold text-red-600">
                {auditRecords.filter(r => r.status === 'voided').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Invoices:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {auditRecords.filter(r => r.number_type === 'invoice').length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SARS Compliance Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">SARS Compliance</h4>
        <p className="text-sm text-yellow-800">
          This audit log maintains a complete record of all invoice numbers as required by SARS.
          Export this log regularly for your tax records. Voided numbers are highlighted and include
          the reason for voiding.
        </p>
      </div>
    </div>
  );
};
