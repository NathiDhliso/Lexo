import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, CheckCircle, Mail, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { awsEmailService } from '../../services/aws-email.service';

interface EngagementLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagementId: string;
  matterTitle: string;
}

export const EngagementLinkModal: React.FC<EngagementLinkModalProps> = ({
  isOpen,
  onClose,
  engagementId,
  matterTitle,
}) => {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLink = async () => {
      const { data, error } = await supabase
        .from('engagement_agreements')
        .select('public_token')
        .eq('id', engagementId)
        .single();

      if (error) {
        console.error('Error fetching engagement token:', error);
        return;
      }

      const token = data.public_token;
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/#/attorney/engagement/${token}`;
      setGeneratedLink(link);
    };

    fetchLink();
  }, [isOpen, engagementId]);

  const sendEmail = async () => {
    if (!emailAddress || !generatedLink) return;
    
    setSendingEmail(true);
    try {
      const clientName = emailAddress.split('@')[0].replace(/[._-]/g, ' ');
      
      const result = await awsEmailService.sendEngagementLinkEmail({
        recipientEmail: emailAddress,
        recipientName: clientName,
        matterTitle: matterTitle,
        linkUrl: generatedLink
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      await supabase
        .from('engagement_agreements')
        .update({
          link_sent_at: new Date().toISOString(),
          link_sent_to: emailAddress
        })
        .eq('id', engagementId);

      toast.success(`Signing link sent to ${emailAddress}`);
      setEmailAddress('');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  const openInNewTab = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank');
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setEmailAddress('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-xl max-w-2xl w-full mx-4">
        <div className="border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Send Engagement Agreement for Signature
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Matter</h3>
            <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-metallic-gray-900 p-3 rounded-lg">{matterTitle}</p>
          </div>

          {generatedLink ? (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Signing Link Ready</h3>
                </div>
                
                <div className="bg-neutral-50 dark:bg-metallic-gray-900 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 font-mono text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-metallic-gray-800 p-2 rounded border border-neutral-200 dark:border-metallic-gray-700 break-all">
                      {generatedLink}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="flex items-center gap-2 px-3 py-2 bg-neutral-600 dark:bg-metallic-gray-600 text-white rounded hover:bg-neutral-700 dark:hover:bg-metallic-gray-500 whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Link via Email
                </h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="client@example.com"
                    className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={sendEmail}
                    disabled={!emailAddress || sendingEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {sendingEmail ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  The client will receive an email with the link to review and sign the engagement agreement.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Instructions for Client
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Share this link with the client</li>
                  <li>• The client can access and sign without creating an account</li>
                  <li>• Digital signature capture is included</li>
                  <li>• Once signed, you'll be notified immediately</li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">Loading signing link...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
