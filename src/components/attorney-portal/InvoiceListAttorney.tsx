import React, { useState, useEffect } from 'react';
import { FileText, Download, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  invoice_sequence: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  issue_date: string;
  due_date: string;
  matters: {
    title: string;
    client_name: string;
  };
}

export const InvoiceListAttorney: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accessibleMatters } = await supabase
        .from('attorney_matter_access')
        .select('matter_id')
        .eq('attorney_user_id', user.id)
        .is('revoked_at', null);

      const matterIds = accessibleMatters?.map(a => a.matter_id) || [];

      let query = supabase
        .from('invoices')
        .select(`
          *,
          matters (
            title,
            client_name
          )
        `)
        .in('matter_id', matterIds)
        .is('deleted_at', null)
        .order('issue_date', { ascending: false });

      if (filter === 'pending') {
        query = query.in('payment_status', ['pending', 'partial']);
      } else if (filter === 'overdue') {
        query = query
          .in('payment_status', ['pending', 'partial'])
          .lt('due_date', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      toast.success(`Downloading invoice ${invoiceNumber}...`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getTotalOutstanding = () => {
    return invoices
      .filter(inv => ['pending', 'partial'].includes(inv.payment_status))
      .reduce((sum, inv) => sum + inv.balance_due, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Invoices</h1>
          <p className="text-gray-600 dark:text-neutral-400">
            {invoices.length} invoices • {formatRand(getTotalOutstanding())} outstanding
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Pending Payment
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'overdue'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Overdue
        </button>
      </div>

      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow divide-y divide-gray-200">
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-neutral-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-neutral-400">No invoices found</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onDownload={downloadPDF}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface InvoiceCardProps {
  invoice: Invoice;
  onDownload: (id: string, number: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onDownload }) => {
  const getStatusBadge = () => {
    switch (invoice.payment_status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4" />
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4" />
            Partially Paid
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-4 w-4" />
            Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        );
    }
  };

  const isOverdue = invoice.payment_status !== 'paid' && 
                    new Date(invoice.due_date) < new Date();

  return (
    <div className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
      isOverdue ? 'bg-red-50' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              {invoice.invoice_number}
            </h3>
            {getStatusBadge()}
            <span className="text-sm text-gray-500 dark:text-neutral-500 capitalize">
              {invoice.invoice_type} #{invoice.invoice_sequence}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
            {invoice.matters?.title} - {invoice.matters?.client_name}
          </p>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-neutral-400">Issue Date</p>
              <p className="font-medium text-gray-900 dark:text-neutral-100">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-neutral-400">Due Date</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(invoice.due_date).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-neutral-400">Total Amount</p>
              <p className="font-medium text-gray-900 dark:text-neutral-100">
                {formatRand(invoice.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-neutral-400">Balance Due</p>
              <p className="font-semibold text-gray-900 dark:text-neutral-100">
                {formatRand(invoice.balance_due)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDownload(invoice.id, invoice.invoice_number)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 bg-white dark:bg-metallic-gray-800 border border-gray-300 dark:border-metallic-gray-600 rounded-lg hover:bg-gray-50 dark:bg-metallic-gray-900"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          {invoice.balance_due > 0 && (
            <a
              href={`/attorney/payments/${invoice.id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4" />
              Pay Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
