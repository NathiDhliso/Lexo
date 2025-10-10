import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Card, CardContent } from '../design-system/components';
import toast from 'react-hot-toast';

interface CreateProFormaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proforma: any) => void;
}

export const CreateProFormaModal: React.FC<CreateProFormaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    matterDescription: '',
  });

  const [createdProForma, setCreatedProForma] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProForma = {
      id: `pf-${Date.now()}`,
      ...formData,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    toast.success('Pro forma created successfully');
    setCreatedProForma(newProForma);
  };

  const handleSendToClient = () => {
    if (createdProForma) {
      onSuccess(createdProForma);
      onClose();
      setFormData({ clientName: '', clientEmail: '', matterDescription: '' });
      setCreatedProForma(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Create Pro Forma</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <CardContent className="p-6">
          {!createdProForma ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium mb-1">
                  Client Name
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium mb-1">
                  Client Email
                </label>
                <input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label htmlFor="matterDescription" className="block text-sm font-medium mb-1">
                  Matter Description
                </label>
                <textarea
                  id="matterDescription"
                  value={formData.matterDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, matterDescription: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" className="flex-1">
                  Create
                </Button>
                <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Pro forma created successfully!
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>Client:</strong> {createdProForma.clientName}</p>
                <p><strong>Email:</strong> {createdProForma.clientEmail}</p>
                <p><strong>Description:</strong> {createdProForma.matterDescription}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendToClient} variant="primary" className="flex-1">
                  Send to Client
                </Button>
                <Button onClick={onClose} variant="secondary" className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProFormaModal;
