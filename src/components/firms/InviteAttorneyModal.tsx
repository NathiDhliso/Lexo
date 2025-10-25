import React, { useState, useEffect } from 'react';
import { Copy, Check, Link as LinkIcon, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AttorneyService } from '../../services/api/attorney.service';
import type { Firm, InvitationTokenResponse } from '../../types/financial.types';
import { toast } from 'react-hot-toast';

interface InviteAttorneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: Firm;
}

export const InviteAttorneyModal: React.FC<InviteAttorneyModalProps> = ({
  isOpen,
  onClose,
  firm
}) => {
  const [invitationData, setInvitationData] = useState<InvitationTokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !invitationData) {
      generateToken();
    }
  }, [isOpen]);

  const generateToken = async () => {
    setLoading(true);
    try {
      const data = await AttorneyService.generateInvitationToken(firm.id);
      setInvitationData(data);
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invitationData) return;
    
    try {
      await navigator.clipboard.writeText(invitationData.invitation_link);
      setCopied(true);
      toast.success('Invitation link copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Attorney"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {firm.firm_name}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {firm.email}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Generating invitation link...
            </p>
          </div>
        ) : invitationData ? (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Invitation Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationData.invitation_link}
                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm"
                />
                <Button
                  onClick={handleCopy}
                  variant={copied ? 'success' : 'primary'}
                  size="md"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>This link expires in 7 days</span>
              </div>
            </div>

            <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
              <p className="font-medium">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the invitation link above</li>
                <li>Send it to the attorney via email or SMS</li>
                <li>They'll register and submit matter requests</li>
              </ol>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
