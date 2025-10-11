/**
 * Payment Gateway Service
 * Unified interface for payment processing
 */

import { PaymentGateway, type SubscriptionTier } from '../../types/subscription.types';
import { paystackService } from './paystack.service';
import { payfastService } from './payfast.service';
import { calculateSubscriptionPrice } from '../../config/subscription-tiers.config';

export interface InitiatePaymentParams {
  tier: SubscriptionTier;
  additionalUsers?: number;
  gateway: PaymentGateway;
  userEmail: string;
  userName: { first: string; last: string };
  callbackUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

class PaymentGatewayService {
  /**
   * Initiate a subscription payment
   */
  async initiateSubscriptionPayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      const amount = calculateSubscriptionPrice(params.tier, params.additionalUsers || 0);

      if (params.gateway === PaymentGateway.PAYSTACK) {
        return await this.initiatePaystackPayment(amount, params);
      } else if (params.gateway === PaymentGateway.PAYFAST) {
        return await this.initiatePayFastPayment(amount, params);
      }

      return {
        success: false,
        error: 'Invalid payment gateway'
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }

  /**
   * Initiate Paystack payment
   */
  private async initiatePaystackPayment(
    amount: number,
    params: InitiatePaymentParams
  ): Promise<PaymentResult> {
    const reference = paystackService.generateReference();

    const response = await paystackService.initializeTransaction({
      email: params.userEmail,
      amount: amount, // Paystack expects amount in kobo (cents)
      reference,
      callback_url: params.callbackUrl,
      metadata: {
        tier: params.tier,
        additional_users: params.additionalUsers || 0,
        custom_fields: [
          {
            display_name: 'Subscription Tier',
            variable_name: 'subscription_tier',
            value: params.tier
          }
        ]
      }
    });

    if (response.status) {
      return {
        success: true,
        paymentUrl: response.data.authorization_url,
        reference: response.data.reference
      };
    }

    return {
      success: false,
      error: response.message || 'Paystack initialization failed'
    };
  }

  /**
   * Initiate PayFast payment
   */
  private async initiatePayFastPayment(
    amount: number,
    params: InitiatePaymentParams
  ): Promise<PaymentResult> {
    const amountInZAR = amount / 100; // Convert cents to ZAR

    const paymentData = payfastService.preparePaymentData({
      amount: amountInZAR,
      item_name: `LexoHub ${params.tier} Subscription`,
      item_description: `Monthly subscription for ${params.tier} tier`,
      email: params.userEmail,
      name_first: params.userName.first,
      name_last: params.userName.last,
      return_url: params.callbackUrl,
      cancel_url: params.cancelUrl,
      notify_url: `${window.location.origin}/api/webhooks/payfast`,
      subscription: true,
      recurring_amount: amountInZAR
    });

    // Create form and submit to PayFast
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfastService.getPaymentUrl();

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value?.toString() || '';
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    return {
      success: true,
      reference: payfastService.generateReference()
    };
  }

  /**
   * Verify payment completion
   */
  async verifyPayment(reference: string, gateway: PaymentGateway): Promise<boolean> {
    try {
      if (gateway === PaymentGateway.PAYSTACK) {
        const response = await paystackService.verifyTransaction(reference);
        return response.status && response.data.status === 'success';
      } else if (gateway === PaymentGateway.PAYFAST) {
        // PayFast verification happens via ITN webhook
        // This would typically be handled server-side
        return true;
      }

      return false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const paymentGatewayService = new PaymentGatewayService();
