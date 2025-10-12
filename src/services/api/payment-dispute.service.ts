/**
 * Payment Dispute Service
 * Handles payment dispute operations
 */

import { supabase } from '../../lib/supabase';
import { BaseApiService } from './base-api.service';
import type { PaymentDispute, PaymentDisputeCreate } from '../../types/financial.types';
import { toast } from 'react-hot-toast';

export class PaymentDisputeService extends BaseApiService<PaymentDispute> {
  constructor() {
    super('payment_disputes');
  }

  /**
   * Create a new payment dispute
   */
  async createDispute(data: PaymentDisputeCreate): Promise<PaymentDispute | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: dispute, error } = await supabase
        .from('payment_disputes')
        .insert({
          ...data,
          advocate_id: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Dispute created successfully');
      return dispute;
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast.error('Failed to create dispute');
      return null;
    }
  }

  /**
   * Respond to a dispute
   */
  async respondToDispute(id: string, response: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_disputes')
        .update({
          advocate_response: response,
          status: 'under_review',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Response submitted successfully');
      return true;
    } catch (error) {
      console.error('Error responding to dispute:', error);
      toast.error('Failed to submit response');
      return false;
    }
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    id: string,
    resolutionType: PaymentDispute['resolution_type'],
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_disputes')
        .update({
          resolution_type: resolutionType,
          resolution_notes: resolutionNotes,
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Dispute resolved successfully');
      return true;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute');
      return false;
    }
  }
}

export const paymentDisputeService = new PaymentDisputeService();
