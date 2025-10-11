/**
 * Subscription Callback Page
 * Handles payment gateway redirects after payment
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { paymentGatewayService } from '../services/payment/payment-gateway.service';
import { subscriptionService } from '../services/api/subscription.service';
import { toast } from '../services/toast.service';
import { PaymentGateway } from '../types/subscription.types';

type PaymentStatus = 'processing' | 'success' | 'failed';

export const SubscriptionCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment reference from URL params
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      const gateway = searchParams.get('gateway') as PaymentGateway || PaymentGateway.PAYSTACK;

      if (!reference) {
        setStatus('failed');
        setMessage('Payment reference not found');
        return;
      }

      // Verify payment with gateway
      const isVerified = await paymentGatewayService.verifyPayment(reference, gateway);

      if (isVerified) {
        // Reload subscription data
        await subscriptionService.getCurrentSubscription();
        
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        toast.success('Subscription activated successfully');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support if you were charged.');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying your payment. Please contact support.');
      toast.error('Payment verification error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <Loader className="mx-auto mb-4 h-16 w-16 animate-spin text-primary-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Processing Payment</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="mb-6 text-gray-600">{message}</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Payment Failed</h2>
              <p className="mb-6 text-gray-600">{message}</p>
              <div className="space-y-3">
                <Button onClick={() => navigate('/subscription')} className="w-full">
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>

        {status !== 'processing' && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Need help?{' '}
              <a href="mailto:support@lexohub.com" className="text-primary-600 hover:text-primary-700">
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
