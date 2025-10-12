import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '../components/design-system/components';
import toast from 'react-hot-toast';

interface Dispute {
  id: string;
  invoiceId: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  disputeType: string;
  disputedAmount: number;
  reason: string;
  response?: string;
  createdAt: string;
}

export const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: '1',
      invoiceId: 'INV-001',
      status: 'open',
      disputeType: 'Amount Incorrect',
      disputedAmount: 5000,
      reason: 'Hours not agreed upon',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      invoiceId: 'INV-002',
      status: 'under_review',
      disputeType: 'Service Quality',
      disputedAmount: 3000,
      reason: 'Work not completed',
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');

  const respondToDispute = (disputeId: string) => {
    setDisputes(prev =>
      prev.map(d => d.id === disputeId ? { ...d, status: 'under_review' as const, response } : d)
    );
    setShowResponseModal(false);
    setResponse('');
    toast.success('Response submitted');
  };

  const issueCreditNote = (disputeId: string, amount: number) => {
    setDisputes(prev =>
      prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d)
    );
    toast.success('Credit note issued');
  };

  const markAsSettled = (disputeId: string) => {
    setDisputes(prev =>
      prev.map(d => d.id === disputeId ? { ...d, status: 'resolved' as const } : d)
    );
    toast.success('Dispute settled');
  };

  const escalateDispute = (disputeId: string) => {
    setDisputes(prev =>
      prev.map(d => d.id === disputeId ? { ...d, status: 'escalated' as const } : d)
    );
    toast.success('Dispute escalated');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Payment Disputes
      </h1>

      <div className="space-y-4">
        {disputes.map(dispute => (
          <Card
            key={dispute.id}
            data-dispute-status={dispute.status}
            className="cursor-pointer hover:theme-shadow-md transition-shadow"
            onClick={() => setSelectedDispute(dispute)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-5 h-5 text-status-warning-500" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {dispute.disputeType} - Invoice {dispute.invoiceId}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Amount: R {dispute.disputedAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {dispute.reason}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  dispute.status === 'open' ? 'bg-blue-100 text-blue-800' :
                  dispute.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {dispute.status === 'under_review' ? 'Under Review' : 
                   dispute.status === 'open' ? 'Open' :
                   dispute.status === 'resolved' ? 'Resolved' : 'Escalated'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDispute && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Dispute Details</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <strong>Invoice ID:</strong> {selectedDispute.invoiceId}
            </div>
            <div>
              <strong>Type:</strong> {selectedDispute.disputeType}
            </div>
            <div>
              <strong>Amount:</strong> R {selectedDispute.disputedAmount.toLocaleString()}
            </div>
            <div>
              <strong>Reason:</strong> {selectedDispute.reason}
            </div>
            <div>
              <strong>Status:</strong> {selectedDispute.status}
            </div>

            <div className="flex gap-2 flex-wrap">
              {selectedDispute.status === 'open' && (
                <>
                  <Button
                    onClick={() => setShowResponseModal(true)}
                    variant="primary"
                  >
                    Respond
                  </Button>
                  <Button
                    onClick={() => escalateDispute(selectedDispute.id)}
                    variant="secondary"
                  >
                    Escalate
                  </Button>
                </>
              )}

              {selectedDispute.status === 'under_review' && (
                <>
                  <Button
                    onClick={() => {
                      const amount = prompt('Enter credit note amount:');
                      if (amount) {
                        issueCreditNote(selectedDispute.id, parseFloat(amount));
                      }
                    }}
                    variant="primary"
                  >
                    Issue Credit Note
                  </Button>
                  <Button
                    onClick={() => {
                      const notes = prompt('Enter settlement notes:');
                      if (notes) {
                        markAsSettled(selectedDispute.id);
                      }
                    }}
                    variant="secondary"
                  >
                    Mark as Settled
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showResponseModal && selectedDispute && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-bold">Respond to Dispute</h3>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Response</label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Enter your response..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supporting Documents</label>
              <input
                type="file"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => respondToDispute(selectedDispute.id)}
                variant="primary"
              >
                Submit Response
              </Button>
              <Button
                onClick={() => setShowResponseModal(false)}
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

export default DisputesPage;
