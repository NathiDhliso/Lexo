/**
 * PayFast Payment Service
 * Handles PayFast payment gateway integration
 */

import type { PayFastPaymentData } from '../../types/subscription.types';

// Note: PayFast signature generation should be done server-side for security
// This is a client-side implementation for development/testing only

const PAYFAST_MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = import.meta.env.VITE_PAYFAST_PASSPHRASE;
const PAYFAST_MODE = import.meta.env.VITE_PAYFAST_MODE || 'sandbox'; // 'sandbox' or 'live'

const PAYFAST_URL = PAYFAST_MODE === 'live' 
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

export class PayFastService {
  /**
   * Generate MD5 signature for PayFast
   * IMPORTANT: In production, this should be done server-side
   */
  private async generateSignature(data: Record<string, string>): Promise<string> {
    // Create parameter string
    const paramString = Object.keys(data)
      .filter(key => key !== 'signature')
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
      .join('&');

    // Add passphrase if configured
    const stringToHash = PAYFAST_PASSPHRASE 
      ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
      : paramString;

    // Use Web Crypto API for hashing
    const encoder = new TextEncoder();
    const data_buffer = encoder.encode(stringToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data_buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Prepare payment data for PayFast
   */
  async preparePaymentData(params: {
    amount: number; // in ZAR (not cents)
    item_name: string;
    item_description: string;
    email: string;
    name_first: string;
    name_last: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    subscription?: boolean;
    recurring_amount?: number;
  }): Promise<PayFastPaymentData> {
    const data: any = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: params.return_url,
      cancel_url: params.cancel_url,
      notify_url: params.notify_url,
      name_first: params.name_first,
      name_last: params.name_last,
      email_address: params.email,
      amount: params.amount.toFixed(2),
      item_name: params.item_name,
      item_description: params.item_description
    };

    // Add subscription fields if needed
    if (params.subscription) {
      data.subscription_type = '1'; // 1 = subscription
      data.billing_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      data.recurring_amount = (params.recurring_amount || params.amount).toFixed(2);
      data.frequency = '3'; // 3 = monthly
      data.cycles = '0'; // 0 = until cancelled
    }

    // Generate signature
    data.signature = await this.generateSignature(data);

    return data;
  }

  /**
   * Get PayFast payment URL
   */
  getPaymentUrl(): string {
    return PAYFAST_URL;
  }

  /**
   * Verify PayFast ITN (Instant Transaction Notification)
   */
  async verifyITN(data: Record<string, string>): Promise<boolean> {
    // Verify signature
    const receivedSignature = data.signature;
    const calculatedSignature = await this.generateSignature(data);

    if (receivedSignature !== calculatedSignature) {
      console.error('PayFast signature mismatch');
      return false;
    }

    // Verify payment status
    const validStatuses = ['COMPLETE', 'APPROVED'];
    if (!validStatuses.includes(data.payment_status)) {
      console.error('PayFast invalid payment status:', data.payment_status);
      return false;
    }

    // Verify with PayFast server
    try {
      const response = await fetch(`${PAYFAST_URL}/query/${data.pf_payment_id}`, {
        method: 'GET',
        headers: {
          'merchant-id': PAYFAST_MERCHANT_ID,
          'version': 'v1',
          'timestamp': new Date().toISOString()
        }
      });

      if (!response.ok) {
        console.error('PayFast server verification failed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('PayFast verification error:', error);
      return false;
    }
  }

  /**
   * Cancel a PayFast subscription
   */
  async cancelSubscription(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${PAYFAST_URL}/subscriptions/${token}/cancel`, {
        method: 'PUT',
        headers: {
          'merchant-id': PAYFAST_MERCHANT_ID,
          'version': 'v1',
          'timestamp': new Date().toISOString()
        }
      });

      return response.ok;
    } catch (error) {
      console.error('PayFast subscription cancellation error:', error);
      return false;
    }
  }

  /**
   * Generate a unique merchant reference
   */
  generateReference(): string {
    return `LEXO-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}

export const payfastService = new PayFastService();
