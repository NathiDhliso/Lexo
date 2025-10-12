import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';
import toast from 'react-hot-toast';

interface CreditNote {
  id: string;
  invoiceId: string;
  number: string;
  amount: number;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  reasonCategory: string;
  detailedReason: string;
  createdAt: string;
}

export const CreditNotesPage: React.FC = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([
    {
      id: '1',
      invoiceId: 'INV-001',
      number: 'CN-202501-001',
      amount: 5000,
      status: 'draft',
      reasonCategory: 'Billing Error',
      detailedReason: 'Incorrect hours billed',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      invoiceId: 'INV-002',
      number: 'CN-202501-002',
      amount: 3000,
      status: 'issued',
      reasonCategory: 'Client Goodwill',
      detailedReason: 'Discount for long-term client',
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCreditNote, setNewCreditNote] = useState({
    amount: '',
    reasonCategory: '',
    detailedReason: ''
  });

  const issueCreditNote = (id: string) => {
    setCreditNotes(prev =>
      prev.map(cn => cn.id === id ? { ...cn, status: 'issued' as const } : cn)
    );
    toast.success('Credit note issued');
  };

  const applyCreditNote = (id: string) => {
    setCreditNotes(prev =>
      prev.map(cn => cn.id === id ? { ...cn, status: 'applied' as const } : cn)
    );
    toast.success('Credit note applied');
  };

  const cancelCreditNote = (id: string, reason: string) => {
    setCreditNotes(prev =>
      prev.map(cn => cn.id === id ? { ...cn, status: 'cancelled' as const } : cn)
    );
    toast.success('Credit note cancelled');
  };

  const createCreditNote = () => {
    const newCN: CreditNote = {
      id: `${creditNotes.length + 1}`,
      invoiceId: 'INV-003',
      number: `CN-202501-${String(creditNotes.length + 1).padStart(3, '0')}`,
      amount: parseFloat(newCreditNote.amount),
      status: 'draft',
      reasonCategory: newCreditNote.reasonCategory,
      detailedReason: newCreditNote.detailedReason,
      createdAt: new Date().toISOString()
    };

    setCreditNotes(prev => [...prev, newCN]);
    setShowCreateModal(false);
    setNewCreditNote({ amount: '', reasonCategory: '', detailedReason: '' });
    toast.success('Credit note created');
  };

  const downloadPDF = (creditNote: CreditNote) => {
    const blob = new Blob([`Credit Note ${creditNote.number}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${creditNote.number}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Credit Notes
        </h1>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          Create Credit Note
        </Button>
      </div>

      <div className="space-y-4">
        {creditNotes.map(creditNote => (
          <Card
            key={creditNote.id}
            data-credit-note-id={creditNote.id}
            data-credit-note-status={creditNote.status}
            className="cursor-pointer hover:theme-shadow-md transition-shadow"
            onClick={() => setSelectedCreditNote(creditNote)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {creditNote.number}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Amount: R {creditNote.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {creditNote.reasonCategory}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  creditNote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  creditNote.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                  creditNote.status === 'applied' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {creditNote.status === 'draft' ? 'Draft' :
                   creditNote.status === 'issued' ? 'Issued' :
                   creditNote.status === 'applied' ? 'Applied' : 'Cancelled'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCreditNote && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Credit Note Details</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <strong>Number:</strong> {selectedCreditNote.number}
            </div>
            <div>
              <strong>Invoice ID:</strong> {selectedCreditNote.invoiceId}
            </div>
            <div>
              <strong>Amount:</strong> R {selectedCreditNote.amount.toLocaleString()}
            </div>
            <div>
              <strong>Category:</strong> {selectedCreditNote.reasonCategory}
            </div>
            <div>
              <strong>Reason:</strong> {selectedCreditNote.detailedReason}
            </div>
            <div>
              <strong>Status:</strong> {selectedCreditNote.status}
            </div>

            <div className="flex gap-2 flex-wrap">
              {selectedCreditNote.status === 'draft' && (
                <>
                  <Button
                    onClick={() => issueCreditNote(selectedCreditNote.id)}
                    variant="primary"
                  >
                    Issue
                  </Button>
                  <Button
                    onClick={() => {
                      const reason = prompt('Enter cancellation reason:');
                      if (reason) {
                        cancelCreditNote(selectedCreditNote.id, reason);
                      }
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </>
              )}

              {selectedCreditNote.status === 'issued' && (
                <Button
                  onClick={() => applyCreditNote(selectedCreditNote.id)}
                  variant="primary"
                >
                  Apply to Invoice
                </Button>
              )}

              <Button
                onClick={() => downloadPDF(selectedCreditNote)}
                variant="secondary"
              >
                View PDF
              </Button>

              <Button
                onClick={() => downloadPDF(selectedCreditNote)}
                variant="secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateModal && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-bold">Create Credit Note</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                id="amount"
                type="number"
                value={newCreditNote.amount}
                onChange={(e) => setNewCreditNote(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason Category</label>
              <select
                id="reasonCategory"
                value={newCreditNote.reasonCategory}
                onChange={(e) => setNewCreditNote(prev => ({ ...prev, reasonCategory: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select category</option>
                <option value="Billing Error">Billing Error</option>
                <option value="Client Goodwill">Client Goodwill</option>
                <option value="Service Issue">Service Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Detailed Reason</label>
              <textarea
                id="detailedReason"
                value={newCreditNote.detailedReason}
                onChange={(e) => setNewCreditNote(prev => ({ ...prev, detailedReason: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Enter detailed reason"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createCreditNote}
                variant="primary"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowCreateModal(false)}
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

export default CreditNotesPage;
