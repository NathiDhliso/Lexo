import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import toast from 'react-hot-toast';

interface ProFormaRequest {
  id: string;
  matter_id: string;
  matter_title: string;
  description: string;
  estimated_fee: number;
  estimated_hours: number;
  hourly_rate: number;
  complexity: string;
  urgency: string;
  services: any[];
  client_response_status: string;
  client_response_notes: string | null;
  client_responded_at: string | null;
  created_at: string;
}

export const ProFormaSubmissionPage: React.FC = () => {
  const token = window.location.hash.split('/').pop() || window.location.pathname.split('/').pop();
  const [proforma, setProforma] = useState<ProFormaRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<'accepted' | 'negotiation' | null>(null);
  const [notes, setNotes] = useState('');
  const [counterOffer, setCounterOffer] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      loadProForma();
    }
  }, [token]);

  const loadProForma = async () => {
    try {
      // First, get the pro forma request
      const { data: proformaData, error: proformaError } = await supabase
        .from('proforma_requests')
        .select('*')
        .eq('token', token)
        .single();

      if (proformaError) throw proformaError;

      if (proformaData) {
        // Then get the matter title if matter_id exists
        let matterTitle = 'Unknown Matter';
        if (proformaData.matter_id) {
          const { data: matterData, error: matterError } = await supabase
            .from('matters')
            .select('title')
            .eq('id', proformaData.matter_id)
            .single();

          if (!matterError && matterData) {
            matterTitle = matterData.title;
          }
        }

        setProforma({
          ...proformaData,
          matter_title: matterTitle
        });
      }
    } catch (error) {
      console.error('Error loading pro forma:', error);
      toast.error('Failed to load pro forma request. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!response || !proforma) return;

    setSubmitting(true);
    try {
      const updateData: any = {
        client_response_status: response,
        client_response_notes: notes || null,
        client_responded_at: new Date().toISOString()
      };

      if (response === 'negotiation' && counterOffer) {
        updateData.counter_offer_amount = counterOffer;
      }

      const { error } = await supabase
        .from('proforma_requests')
        .update(updateData)
        .eq('id', proforma.id);

      if (error) throw error;

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_type: 'advocate',
          recipient_id: proforma.matter_id,
          type: response === 'accepted' ? 'proforma_accepted' : 'proforma_negotiation',
          title: response === 'accepted' ? 'Pro Forma Accepted' : 'Pro Forma Negotiation',
          message: response === 'accepted' 
            ? `Attorney has accepted the pro forma for ${proforma.matter_title}`
            : `Attorney has requested negotiation for ${proforma.matter_title}`,
          related_entity_type: 'proforma_request',
          related_entity_id: proforma.id
        });

      if (notifError) console.error('Error creating notification:', notifError);

      toast.success(
        response === 'accepted' 
          ? 'Pro forma accepted successfully!' 
          : 'Negotiation request submitted!'
      );

      setTimeout(() => {
        window.location.href = '/attorney/dashboard';
      }, 2000);
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Forma Not Found</h1>
          <p className="text-gray-600">The pro forma request you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  if (proforma.client_response_status !== 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Responded</h1>
          <p className="text-gray-600 mb-4">
            You have already responded to this pro forma request.
          </p>
          <p className="text-sm text-gray-500">
            Status: <span className="font-semibold capitalize">{proforma.client_response_status}</span>
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
              <h1 className="text-3xl font-bold text-white">Pro Forma Fee Estimate</h1>
            </div>
            <p className="text-blue-100">Review and respond to this fee estimate</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{proforma.matter_title}</h2>
              <p className="text-gray-700 mb-4">{proforma.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Fee</p>
                    <p className="text-lg font-bold text-gray-900">{formatRand(proforma.estimated_fee)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Hours</p>
                    <p className="text-lg font-bold text-gray-900">{proforma.estimated_hours}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-lg font-bold text-gray-900">{formatRand(proforma.hourly_rate)}/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(proforma.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {proforma.services && proforma.services.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Included</h3>
                <div className="space-y-2">
                  {proforma.services.map((service: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                      </div>
                      {service.estimated_hours && (
                        <span className="text-sm text-gray-600">{service.estimated_hours}h</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setResponse('accepted')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      response === 'accepted'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${
                      response === 'accepted' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-gray-900">Accept</p>
                    <p className="text-sm text-gray-600">Approve this estimate</p>
                  </button>

                  <button
                    onClick={() => setResponse('negotiation')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      response === 'negotiation'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <AlertCircle className={`h-8 w-8 mx-auto mb-2 ${
                      response === 'negotiation' ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-gray-900">Negotiate</p>
                    <p className="text-sm text-gray-600">Request changes</p>
                  </button>
                </div>

                {response === 'negotiation' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Counter Offer Amount (Optional)
                    </label>
                    <input
                      type="number"
                      value={counterOffer || ''}
                      onChange={(e) => setCounterOffer(parseFloat(e.target.value) || null)}
                      placeholder="Enter your counter offer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notes {response === 'negotiation' && '(Required)'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      response === 'negotiation'
                        ? 'Please explain your concerns or counter proposal...'
                        : 'Add any comments or questions (optional)...'
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!response || submitting || (response === 'negotiation' && !notes)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
