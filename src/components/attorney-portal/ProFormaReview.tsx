import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, Download, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';

interface ProFormaReviewProps {
  proformaId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProFormaReview: React.FC<ProFormaReviewProps> = ({
  proformaId,
  onClose,
  onUpdate
}) => {
  const [proforma, setProforma] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'approve' | 'reject' | 'negotiate' | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProForma();
  }, [proformaId]);

  const loadProForma = async () => {
    try {
      const { data, error } = await supabase
        .from('proforma_requests')
        .select(`
          *,
          matters (
            title,
            client_name,
            advocates (
              full_name,
              email,
              phone_number
            )
          )
        `)
        .eq('id', proformaId)
        .single();

      if (error) throw error;
      setProforma(data);
    } catch (error) {
      console.error('Error loading pro forma:', error);
      toast.error('Failed to load pro forma');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('proforma_requests')
        .update({
          client_response_status: 'accepted',
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', proformaId);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        user_type: 'attorney',
        user_id: user.id,
        action: 'proforma_approved',
        entity_type: 'proforma_requests',
        entity_id: proformaId,
        metadata: { comments }
      });

      toast.success('Pro forma approved successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving pro forma:', error);
      toast.error('Failed to approve pro forma');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('proforma_requests')
        .update({
          client_response_status: 'rejected',
          status: 'rejected',
          rejection_reason: comments,
          rejection_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', proformaId);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        user_type: 'attorney',
        user_id: user.id,
        action: 'proforma_rejected',
        entity_type: 'proforma_requests',
        entity_id: proformaId,
        metadata: { reason: comments }
      });

      toast.success('Pro forma rejected');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting pro forma:', error);
      toast.error('Failed to reject pro forma');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNegotiate = async () => {
    if (!comments.trim()) {
      toast.error('Please provide negotiation comments');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const history = proforma.negotiation_history || [];
      history.push({
        date: new Date().toISOString(),
        comments,
        by: 'attorney'
      });

      const { error } = await supabase
        .from('proforma_requests')
        .update({
          client_response_status: 'negotiating',
          negotiation_history: history,
          updated_at: new Date().toISOString()
        })
        .eq('id', proformaId);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        user_type: 'attorney',
        user_id: user.id,
        action: 'proforma_negotiation',
        entity_type: 'proforma_requests',
        entity_id: proformaId,
        metadata: { comments }
      });

      toast.success('Negotiation comments sent to advocate');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      toast.error('Failed to submit negotiation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (action === 'approve') handleApprove();
    else if (action === 'reject') handleReject();
    else if (action === 'negotiate') handleNegotiate();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-neutral-500">
        Pro forma not found
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-metallic-gray-800 rounded-lg theme-shadow-lg max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-metallic-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">Pro Forma Review</h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
              {proforma.matters?.title} - {proforma.matters?.client_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Advocate</label>
            <p className="text-gray-900 dark:text-neutral-100">{proforma.matters?.advocates?.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Estimated Total</label>
            <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {formatRand(proforma.estimated_total || 0)}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Matter Description</label>
          <p className="text-gray-900 dark:text-neutral-100 mt-1">{proforma.matter_description}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Scope of Work</label>
          <p className="text-gray-900 dark:text-neutral-100 mt-1 whitespace-pre-wrap">{proforma.scope_of_work}</p>
        </div>

        {proforma.negotiation_history && proforma.negotiation_history.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">Negotiation History</label>
            <div className="mt-2 space-y-2">
              {proforma.negotiation_history.map((entry: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-metallic-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-500">
                    <Clock className="h-3 w-3" />
                    {new Date(entry.date).toLocaleString()} - {entry.by}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-neutral-100 mt-1">{entry.comments}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!action ? (
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setAction('approve')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="h-5 w-5" />
              Approve
            </button>
            <button
              onClick={() => setAction('negotiate')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              Negotiate
            </button>
            <button
              onClick={() => setAction('reject')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="h-5 w-5" />
              Reject
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                {action === 'approve' && 'Approval Comments (Optional)'}
                {action === 'reject' && 'Rejection Reason (Required)'}
                {action === 'negotiate' && 'Negotiation Comments (Required)'}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  action === 'approve' ? 'Optional comments...' :
                  action === 'reject' ? 'Please explain why you are rejecting this pro forma...' :
                  'Please provide your negotiation points...'
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
              </button>
              <button
                onClick={() => {
                  setAction(null);
                  setComments('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-metallic-gray-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:bg-metallic-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
