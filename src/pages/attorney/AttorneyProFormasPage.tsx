import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/design-system/components';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProForma {
  id: string;
  number: string;
  status: 'sent' | 'approved' | 'rejected';
  amount: number;
  matter: string;
}

export const AttorneyProFormasPage: React.FC = () => {
  const [proFormas, setProFormas] = useState<ProForma[]>([
    {
      id: '1',
      number: 'PF-001',
      status: 'sent',
      amount: 50000,
      matter: 'Corporate Matter'
    },
    {
      id: '2',
      number: 'PF-002',
      status: 'sent',
      amount: 35000,
      matter: 'Litigation Case'
    }
  ]);

  const [selectedProForma, setSelectedProForma] = useState<ProForma | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [comments, setComments] = useState('');

  const approveProForma = (id: string) => {
    setProFormas(prev =>
      prev.map(pf => pf.id === id ? { ...pf, status: 'approved' as const } : pf)
    );
    setShowApprovalModal(false);
    setComments('');
    toast.success('Pro forma approved');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        Pro Forma Requests
      </h1>

      <div className="space-y-4">
        {proFormas.map(proForma => (
          <Card
            key={proForma.id}
            data-proforma-status={proForma.status}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedProForma(proForma)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {proForma.number}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Matter: {proForma.matter}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Amount: R {proForma.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  proForma.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  proForma.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {proForma.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProForma && selectedProForma.status === 'sent' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold">Pro Forma Details</h2>
            <div>
              <strong>Number:</strong> {selectedProForma.number}
            </div>
            <div>
              <strong>Matter:</strong> {selectedProForma.matter}
            </div>
            <div>
              <strong>Amount:</strong> R {selectedProForma.amount.toLocaleString()}
            </div>

            <Button
              onClick={() => setShowApprovalModal(true)}
              variant="primary"
            >
              Approve
            </Button>
          </CardContent>
        </Card>
      )}

      {showApprovalModal && selectedProForma && (
        <Card className="mt-4">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold">Approve Pro Forma</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Enter your comments..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => approveProForma(selectedProForma.id)}
                variant="primary"
              >
                Confirm
              </Button>
              <Button
                onClick={() => setShowApprovalModal(false)}
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

export default AttorneyProFormasPage;
