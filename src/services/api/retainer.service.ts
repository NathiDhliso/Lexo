import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type RetainerAgreement = Database['public']['Tables']['retainer_agreements']['Row'];
type RetainerAgreementInsert = Database['public']['Tables']['retainer_agreements']['Insert'];
type TrustTransaction = Database['public']['Tables']['trust_transactions']['Row'];
type TrustTransactionInsert = Database['public']['Tables']['trust_transactions']['Insert'];

export interface CreateRetainerRequest {
  matterId: string;
  engagementAgreementId?: string;
  retainerType: 'monthly' | 'annual' | 'project' | 'evergreen';
  retainerAmount: number;
  billingPeriod?: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  startDate: string;
  endDate?: string;
  autoRenew?: boolean;
  notes?: string;
}

export interface DepositRequest {
  retainerId: string;
  amount: number;
  reference?: string;
  description: string;
  transactionDate?: string;
}

export interface DrawdownRequest {
  retainerId: string;
  amount: number;
  description: string;
  invoiceId?: string;
  timeEntryId?: string;
  expenseId?: string;
  transactionDate?: string;
}

export interface RetainerSummary {
  retainer: RetainerAgreement;
  totalDeposits: number;
  totalDrawdowns: number;
  currentBalance: number;
  percentageRemaining: number;
  isLowBalance: boolean;
  recentTransactions: TrustTransaction[];
}

export class RetainerService {
  static async create(request: CreateRetainerRequest): Promise<RetainerAgreement> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const retainerData: RetainerAgreementInsert = {
        matter_id: request.matterId,
        engagement_agreement_id: request.engagementAgreementId,
        advocate_id: user.id,
        retainer_type: request.retainerType,
        retainer_amount: request.retainerAmount,
        billing_period: request.billingPeriod,
        start_date: request.startDate,
        end_date: request.endDate,
        auto_renew: request.autoRenew || false,
        notes: request.notes,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('retainer_agreements')
        .insert(retainerData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Retainer agreement created');
      return data;
    } catch (error) {
      console.error('Error creating retainer:', error);
      const message = error instanceof Error ? error.message : 'Failed to create retainer';
      toast.error(message);
      throw error;
    }
  }

  static async deposit(request: DepositRequest): Promise<TrustTransaction> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: retainer, error: retainerError } = await supabase
        .from('retainer_agreements')
        .select('matter_id, trust_account_balance')
        .eq('id', request.retainerId)
        .single();

      if (retainerError || !retainer) {
        throw new Error('Retainer agreement not found');
      }

      const balanceBefore = retainer.trust_account_balance || 0;
      const balanceAfter = balanceBefore + request.amount;

      const transactionData: TrustTransactionInsert = {
        retainer_id: request.retainerId,
        matter_id: retainer.matter_id,
        advocate_id: user.id,
        transaction_type: 'deposit',
        amount: request.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference: request.reference,
        description: request.description,
        transaction_date: request.transactionDate || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('trust_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Deposited R${request.amount.toLocaleString()} to trust account`);
      return data;
    } catch (error) {
      console.error('Error depositing to trust account:', error);
      const message = error instanceof Error ? error.message : 'Failed to deposit';
      toast.error(message);
      throw error;
    }
  }

  static async drawdown(request: DrawdownRequest): Promise<TrustTransaction> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: retainer, error: retainerError } = await supabase
        .from('retainer_agreements')
        .select('matter_id, trust_account_balance')
        .eq('id', request.retainerId)
        .single();

      if (retainerError || !retainer) {
        throw new Error('Retainer agreement not found');
      }

      const balanceBefore = retainer.trust_account_balance || 0;

      if (balanceBefore < request.amount) {
        throw new Error('Insufficient trust account balance');
      }

      const balanceAfter = balanceBefore - request.amount;

      const transactionData: TrustTransactionInsert = {
        retainer_id: request.retainerId,
        matter_id: retainer.matter_id,
        advocate_id: user.id,
        transaction_type: 'drawdown',
        amount: request.amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: request.description,
        invoice_id: request.invoiceId,
        time_entry_id: request.timeEntryId,
        expense_id: request.expenseId,
        transaction_date: request.transactionDate || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('trust_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Drew down R${request.amount.toLocaleString()} from trust account`);
      return data;
    } catch (error) {
      console.error('Error drawing down from trust account:', error);
      const message = error instanceof Error ? error.message : 'Failed to drawdown';
      toast.error(message);
      throw error;
    }
  }

  static async refund(retainerId: string, amount: number, reason: string): Promise<TrustTransaction> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: retainer, error: retainerError } = await supabase
        .from('retainer_agreements')
        .select('matter_id, trust_account_balance')
        .eq('id', retainerId)
        .single();

      if (retainerError || !retainer) {
        throw new Error('Retainer agreement not found');
      }

      const balanceBefore = retainer.trust_account_balance || 0;

      if (balanceBefore < amount) {
        throw new Error('Refund amount exceeds available balance');
      }

      const balanceAfter = balanceBefore - amount;

      const transactionData: TrustTransactionInsert = {
        retainer_id: retainerId,
        matter_id: retainer.matter_id,
        advocate_id: user.id,
        transaction_type: 'refund',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Refund: ${reason}`
      };

      const { data, error } = await supabase
        .from('trust_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Refunded R${amount.toLocaleString()} to client`);
      return data;
    } catch (error) {
      console.error('Error processing refund:', error);
      const message = error instanceof Error ? error.message : 'Failed to process refund';
      toast.error(message);
      throw error;
    }
  }

  static async getByMatterId(matterId: string): Promise<RetainerAgreement | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('retainer_agreements')
        .select('*')
        .eq('matter_id', matterId)
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching retainer:', error);
      throw error;
    }
  }

  static async getSummary(retainerId: string): Promise<RetainerSummary> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: retainer, error: retainerError } = await supabase
        .from('retainer_agreements')
        .select('*')
        .eq('id', retainerId)
        .eq('advocate_id', user.id)
        .single();

      if (retainerError || !retainer) {
        throw new Error('Retainer agreement not found');
      }

      const { data: transactions, error: transactionsError } = await supabase
        .from('trust_transactions')
        .select('*')
        .eq('retainer_id', retainerId)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      const totalDeposits = (transactions || [])
        .filter(t => t.transaction_type === 'deposit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalDrawdowns = (transactions || [])
        .filter(t => t.transaction_type === 'drawdown')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const currentBalance = retainer.trust_account_balance || 0;
      const percentageRemaining = retainer.retainer_amount > 0 
        ? (currentBalance / retainer.retainer_amount) * 100 
        : 0;

      const isLowBalance = percentageRemaining <= (retainer.low_balance_threshold || 20);

      return {
        retainer,
        totalDeposits,
        totalDrawdowns,
        currentBalance,
        percentageRemaining,
        isLowBalance,
        recentTransactions: transactions || []
      };
    } catch (error) {
      console.error('Error getting retainer summary:', error);
      throw error;
    }
  }

  static async getTransactionHistory(retainerId: string): Promise<TrustTransaction[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trust_transactions')
        .select('*')
        .eq('retainer_id', retainerId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  static async cancel(retainerId: string, reason: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('retainer_agreements')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', retainerId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Retainer agreement cancelled');
    } catch (error) {
      console.error('Error cancelling retainer:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel retainer';
      toast.error(message);
      throw error;
    }
  }

  static async renew(retainerId: string, newEndDate?: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {
        status: 'active',
        updated_at: new Date().toISOString()
      };

      if (newEndDate) {
        updateData.end_date = newEndDate;
      }

      const { error } = await supabase
        .from('retainer_agreements')
        .update(updateData)
        .eq('id', retainerId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Retainer agreement renewed');
    } catch (error) {
      console.error('Error renewing retainer:', error);
      const message = error instanceof Error ? error.message : 'Failed to renew retainer';
      toast.error(message);
      throw error;
    }
  }

  static async getLowBalanceRetainers(): Promise<RetainerAgreement[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('retainer_agreements')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .eq('low_balance_alert_sent', true)
        .is('deleted_at', null)
        .order('remaining_balance', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low balance retainers:', error);
      throw error;
    }
  }

  static async getExpiringRetainers(daysAhead: number = 30): Promise<RetainerAgreement[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('retainer_agreements')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('status', 'active')
        .lte('end_date', futureDate.toISOString().split('T')[0])
        .is('deleted_at', null)
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expiring retainers:', error);
      throw error;
    }
  }
}

export const retainerService = new RetainerService();
