/**
 * Paystack Payment Service
 * Handles Paystack payment gateway integration
 */

import type { PaystackInitializeResponse } from '../../types/subscription.types';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackService {
  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(params: {
    email: string;
    amount: number; // in kobo (cents)
    reference: string;
    callback_url: string;
    metadata?: Record<string, any>;
    plan?: string; // For subscriptions
  }): Promise<PaystackInitializeResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize Paystack transaction');
    }

    return response.json();
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference: string): Promise<any> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify Paystack transaction');
    }

    return response.json();
  }

  /**
   * Create a subscription plan
   */
  async createPlan(params: {
    name: string;
    amount: number; // in kobo
    interval: 'monthly' | 'annually';
    description?: string;
  }): Promise<any> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Paystack plan');
    }

    return response.json();
  }

  /**
   * Subscribe customer to a plan
   */
  async createSubscription(params: {
    customer: string; // customer code or email
    plan: string; // plan code
    authorization: string; // authorization code from previous transaction
  }): Promise<any> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Paystack subscription');
    }

    return response.json();
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(code: string, token: string): Promise<any> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, token })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel Paystack subscription');
    }

    return response.json();
  }

  /**
   * Generate a unique transaction reference
   */
  generateReference(): string {
    return `LEXO-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}

export const paystackService = new PaystackService();
