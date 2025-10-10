import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, Copy, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface PaymentInterfaceProps {
  invoiceId: string;
  onPaymentComplete?: () => void;
}

interface InvoiceDetails {
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  matters: {
    title: string;
    advocates: {
      full_name: string;
      bank_account_name: string;
      bank_account_number: string;
      bank_name: string;
      branch_code: string;
    };
  };
}

export const PaymentInterface: React.FC<PaymentInterfaceProps> = ({
  invoiceId,
  onPaymentComplete
}) => {
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'eft' | 'card'>('eft');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadInvoiceDetails();
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          invoice_number,
          total_amount,
          amount_paid,
          balance_due,
          matters (
            title,
            advocates (
              full_name,
              bank_account_name,
              bank_account_number,
              bank_name,
              branch_code
            )
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data);
      setPaymentAmount(data.balance_due.toString());
      setReference(`INV-${data.invoice_number}`);
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleEFTPayment = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (!reference.trim()) {
        throw new Error('Payment reference is required');
      }

      const { error } = await supabase.from('payments').insert({
        invoice_id: invoiceId,
        advocate_id: invoice?.matters?.advocates?.id,
        amount,
        payment_method: 'eft',
        reference,
        payment_date: new Date().toISOString(),
        notes: 'EFT payment recorded by attorney'
      });

      if (error) throw error;

      await supabase.from('audit_log').insert({
        user_type: 'attorney',
        user_id: user.id,
        action: 'payment_recorded',
        entity_type: 'payments',
        entity_id: invoiceId,
        metadata: { amount, reference, method: 'eft' }
      });

      toast.success('Payment recorded successfully');
      if (onPaymentComplete) onPaymentComplete();
    } catch (error) {
      console.error('Error recording payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = () => {
    toast.error('Card payment integration coming soon. Please use EFT for now.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-8 text-gray-500">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Matter</p>
            <p className="font-medium text-gray-900">{invoice.matters?.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-medium text-gray-900">{formatRand(invoice.total_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Amount Due</p>
            <p className="text-2xl font-bold text-gray-900">{formatRand(invoice.balance_due)}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('eft')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'eft'
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span className="font-medium">EFT / Bank Transfer</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Credit Card</span>
          </button>
        </div>

        {paymentMethod === 'eft' ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Bank Transfer Instructions</p>
                  <p>Please use the banking details below to make your payment. After completing the transfer, record your payment reference below.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Banking Details</h3>
              
              <BankDetailRow
                label="Account Name"
                value={invoice.matters?.advocates?.bank_account_name || 'N/A'}
                onCopy={copyToClipboard}
                copied={copied}
              />
              <BankDetailRow
                label="Account Number"
                value={invoice.matters?.advocates?.bank_account_number || 'N/A'}
                onCopy={copyToClipboard}
                copied={copied}
              />
              <BankDetailRow
                label="Bank"
                value={invoice.matters?.advocates?.bank_name || 'N/A'}
                onCopy={copyToClipboard}
                copied={copied}
              />
              <BankDetailRow
                label="Branch Code"
                value={invoice.matters?.advocates?.branch_code || 'N/A'}
                onCopy={copyToClipboard}
                copied={copied}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={invoice.balance_due}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., EFT-12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your bank reference number after making the transfer
                </p>
              </div>

              <button
                onClick={handleEFTPayment}
                disabled={submitting || !reference.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Recording Payment...' : 'Record Payment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Card Payment Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Online card payment integration is currently in development.
              Please use EFT for now.
            </p>
            <button
              onClick={() => setPaymentMethod('eft')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Switch to EFT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface BankDetailRowProps {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
  copied: string | null;
}

const BankDetailRow: React.FC<BankDetailRowProps> = ({ label, value, onCopy, copied }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        title={`Copy ${label}`}
      >
        {copied === label ? (
          <Check className="h-5 w-5 text-green-600" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};
