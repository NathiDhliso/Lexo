import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/design-system/components';
import { FileText, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
}

export const AttorneyInvoicesPage: React.FC = () => {
  const [invoices] = useState<Invoice[]>([
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `inv-${i}`,
      number: `INV-${String(i + 1).padStart(4, '0')}`,
      amount: 15000 + i * 5000,
      status: 'pending' as const,
      dueDate: new Date(Date.now() + i * 86400000).toISOString()
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `inv-overdue-${i}`,
      number: `INV-${String(i + 100).padStart(4, '0')}`,
      amount: 20000 + i * 3000,
      status: 'overdue' as const,
      dueDate: new Date(Date.now() - (i + 1) * 86400000).toISOString()
    }))
  ]);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter && inv.status !== statusFilter) return false;
    return true;
  });

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('1234567890');
    toast.success('Account number copied');
  };

  const recordPayment = () => {
    toast.success('Payment recorded');
    setShowPaymentModal(false);
  };

  const downloadPDF = (invoice: Invoice) => {
    const blob = new Blob([`Invoice ${invoice.number}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.number}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        My Invoices
      </h1>

      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <Card className="flex-1">
          <CardContent className="p-4">
            <p className="text-sm text-neutral-600">Total Outstanding</p>
            <p className="text-2xl font-bold">R {totalOutstanding.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredInvoices.map(invoice => (
          <Card
            key={invoice.id}
            data-invoice-id={invoice.id}
            data-invoice-status={invoice.status}
            className="cursor-pointer hover:theme-shadow-md transition-shadow"
            onClick={() => setSelectedInvoice(invoice)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {invoice.number}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Amount: R {invoice.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status === 'pending' ? 'Pending' :
                   invoice.status === 'paid' ? 'Paid' : 'Overdue'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInvoice && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Invoice Details</h2>
            <div>
              <strong>Invoice Number:</strong> {selectedInvoice.number}
            </div>
            <div>
              <strong>Amount:</strong> R {selectedInvoice.amount.toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> {selectedInvoice.status}
            </div>
            <div>
              <strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
            </div>

            <div className="flex gap-2 flex-wrap">
              {selectedInvoice.status !== 'paid' && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  variant="primary"
                >
                  Pay Now
                </Button>
              )}
              <Button
                onClick={() => downloadPDF(selectedInvoice)}
                variant="secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPaymentModal && selectedInvoice && (
        <Card className="mt-4">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold">Payment Details</h3>
            
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <h4 className="font-bold mb-2">Bank Details</h4>
              <div className="space-y-1">
                <p><strong>Bank:</strong> Standard Bank</p>
                <p><strong>Account Name:</strong> Law Firm Trust Account</p>
                <p className="flex items-center gap-2">
                  <strong>Account Number:</strong> 1234567890
                  <Button
                    onClick={copyAccountNumber}
                    variant="secondary"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Account Number
                  </Button>
                </p>
                <p><strong>Branch Code:</strong> 051001</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Reference</label>
              <input
                id="paymentReference"
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter payment reference"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={recordPayment}
                variant="primary"
              >
                Record Payment
              </Button>
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttorneyInvoicesPage;
