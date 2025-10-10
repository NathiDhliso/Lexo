import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, AlertCircle, CheckCircle, PenTool } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { SignatureCanvas } from '../../components/engagement/SignatureCanvas';
import toast from 'react-hot-toast';

interface EngagementAgreement {
  id: string;
  matter_id: string;
  matter_title: string;
  proforma_id: string;
  agreement_text: string;
  terms_and_conditions: string;
  estimated_fee: number;
  payment_terms: string;
  scope_of_work: string;
  client_signature: string | null;
  client_signed_at: string | null;
  advocate_signature: string | null;
  advocate_signed_at: string | null;
  status: string;
  created_at: string;
}

export const EngagementSigningPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [agreement, setAgreement] = useState<EngagementAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (token) {
      loadAgreement();
    }
  }, [token]);

  const loadAgreement = async () => {
    try {
      const { data, error } = await supabase
        .from('engagement_agreements')
        .select(`
          *,
          matters!inner(title)
        `)
        .eq('public_token', token)
        .single();

      if (error) throw error;

      if (data) {
        setAgreement({
          ...data,
          matter_title: data.matters.title
        });
      }
    } catch (error) {
      console.error('Error loading agreement:', error);
      toast.error('Failed to load engagement agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signature || !agreement || !agreedToTerms) return;

    setSigning(true);
    try {
      const { error } = await supabase
        .from('engagement_agreements')
        .update({
          client_signature: signature,
          client_signed_at: new Date().toISOString(),
          status: 'client_signed'
        })
        .eq('id', agreement.id);

      if (error) throw error;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_type: 'advocate',
          recipient_id: agreement.matter_id,
          type: 'engagement_signed',
          title: 'Engagement Agreement Signed',
          message: `Client has signed the engagement agreement for ${agreement.matter_title}`,
          related_entity_type: 'engagement_agreement',
          related_entity_id: agreement.id
        });

      if (notifError) console.error('Error creating notification:', notifError);

      toast.success('Engagement agreement signed successfully!');

      setTimeout(() => {
        window.location.href = '/attorney/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast.error('Failed to sign agreement');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agreement Not Found</h1>
          <p className="text-gray-600">The engagement agreement you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  if (agreement.client_signed_at) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Signed</h1>
          <p className="text-gray-600 mb-4">
            You have already signed this engagement agreement.
          </p>
          <p className="text-sm text-gray-500">
            Signed on: {new Date(agreement.client_signed_at).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Engagement Agreement</h1>
            </div>
            <p className="text-blue-100">Review and sign this engagement agreement</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{agreement.matter_title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Agreement ID: {agreement.id.slice(0, 8)}</span>
                <span>•</span>
                <span>Created: {new Date(agreement.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Scope of Work</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{agreement.scope_of_work}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Structure</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Estimated Fee:</span>
                  <span className="text-xl font-bold text-gray-900">{formatRand(agreement.estimated_fee)}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <p className="font-medium mb-1">Payment Terms:</p>
                  <p>{agreement.payment_terms}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms and Conditions</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{agreement.terms_and_conditions}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Important Notice</p>
                    <p className="text-sm text-gray-700">
                      By signing this agreement, you acknowledge that you have read, understood, and agree to all terms and conditions outlined above.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I have read and agree to the terms and conditions of this engagement agreement
                </label>
              </div>

              {!showSignature ? (
                <button
                  onClick={() => setShowSignature(true)}
                  disabled={!agreedToTerms}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <PenTool className="h-5 w-5" />
                  Sign Agreement
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Your Signature
                    </label>
                    <SignatureCanvas 
                      onSave={(sig) => {
                        setSignature(sig);
                        handleSign();
                      }}
                      onClose={() => {
                        setShowSignature(false);
                        setSignature(null);
                      }}
                      title="Sign Engagement Agreement"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
