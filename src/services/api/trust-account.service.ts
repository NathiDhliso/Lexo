/**
 * Trust Account Service
 * Handles trust account management, transactions, and LPC compliance
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

// Type definitions
type TrustAccount = {
  id: string;
  advocate_id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  branch_code: string | null;
  account_type: 'trust' | 'business';
  current_balance: number;
  lpc_compliant: boolean;
  reconciliation_day_of_month: number;
  low_balance_threshold: number;
  negative_balance_alert_sent: boolean;
  last_reconciliation_date: string | null;
  last_reconciliation_balance: number | null;
  created_at: string;
  updated_at: string;
};

type TrustTransaction = {
  id: string;
  trust_account_id: string;
  retainer_id: string | null;
  matter_id: string;
  advocate_id: string;
  transaction_type: 'deposit' | 'drawdown' | 'refund' | 'transfer' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string | null;
  description: string;
  receipt_number: string | null;
  payment_method: 'eft' | 'cash' | 'cheque' | 'card' | 'debit_order' | null;
  client_id: string | null;
  invoice_id: string | null;
  transaction_date: string;
  is_reconciled: boolean;
  created_at: string;
};

type TrustTransfer = {
  id: string;
  trust_account_id: string;
  advocate_id: string;
  matter_id: string;
  transfer_type: 'trust_to_business' | 'business_to_trust';
  amount: number;
  trust_balance_before: number;
  trust_balance_after: number;
  business_balance_before: number | null;
  business_balance_after: number | null;
  reason: string;
  authorization_type: 'invoice_payment' | 'fee_earned' | 'cost_reimbursement' | 'refund' | 'correction';
  invoice_id: string | null;
  transfer_date: string;
  created_at: string;
};

export interface UpdateTrustAccountRequest {
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  branch_code?: string;
  reconciliation_day_of_month?: number;
  low_balance_threshold?: number;
}

export interface RecordTrustReceiptRequest {
  matterId: string;
  clientId?: string;
  amount: number;
  reference?: string;
  description: string;
  paymentMethod: 'eft' | 'cash' | 'cheque' | 'card' | 'debit_order';
  transactionDate?: string;
}

export interface TransferToBusinessRequest {
  matterId: string;
  amount: number;
  reason: string;
  authorizationType: 'invoice_payment' | 'fee_earned' | 'cost_reimbursement' | 'refund' | 'correction';
  invoiceId?: string;
  transferDate?: string;
}

export interface ReconciliationReport {
  trustAccount: TrustAccount;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalDrawdowns: number;
  totalTransfers: number;
  transactions: TrustTransaction[];
  transfers: TrustTransfer[];
  period: {
    startDate: string;
    endDate: string;
  };
  isReconciled: boolean;
  discrepancy: number;
}

export class TrustAccountService {
  /**
   * Get trust account for the current advocate
   * Requirement: 4.1
   */
  static async getTrustAccount(advocateId?: string): Promise<TrustAccount> {
    try {
      let targetAdvocateId = advocateId;
      
      if (!targetAdvocateId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }
        targetAdvocateId = user.id;
      }

      const { data, error } = await supabase
        .from('trust_accounts')
        .select('*')
        .eq('advocate_id', targetAdvocateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Trust account not found. Please contact support.');
        }
        throw error;
      }

      return data as TrustAccount;
    } catch (error) {
      console.error('Error fetching trust account:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch trust account';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Update trust account details
   * Requirement: 4.1
   */
  static async updateTrustAccountDetails(
    request: UpdateTrustAccountRequest
  ): Promise<TrustAccount> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate bank details if provided
      if (request.account_number && request.account_number.length < 8) {
        throw new Error('Invalid account number');
      }

      const { data, error } = await supabase
        .from('trust_accounts')
        .update(request)
        .eq('advocate_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Trust account details updated');
      return data as TrustAccount;
    } catch (error) {
      console.error('Error updating trust account:', error);
      const message = error instanceof Error ? error.message : 'Failed to update trust account';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Record trust receipt (deposit) with automatic receipt number
   * Requirements: 4.2, 4.4
   */
  static async recordTrustReceipt(
    request: RecordTrustReceiptRequest
  ): Promise<{ transaction: TrustTransaction; receiptNumber: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get trust account
      const trustAccount = await this.getTrustAccount(user.id);

      // Get retainer for this matter if exists
      const { data: retainer } = await supabase
        .from('retainer_agreements')
        .select('id')
        .eq('matter_id', request.matterId)
        .eq('advocate_id', user.id)
        .single();

      const transactionData = {
        trust_account_id: trustAccount.id,
        retainer_id: retainer?.id || null,
        matter_id: request.matterId,
        advocate_id: user.id,
        transaction_type: 'deposit' as const,
        amount: request.amount,
        balance_before: trustAccount.current_balance,
        balance_after: trustAccount.current_balance + request.amount,
        reference: request.reference || null,
        description: request.description,
        payment_method: request.paymentMethod,
        client_id: request.clientId || null,
        transaction_date: request.transactionDate || new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('trust_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      const transaction = data as TrustTransaction;
      const receiptNumber = transaction.receipt_number || 'PENDING';

      toast.success(`Trust receipt ${receiptNumber} recorded successfully`);
      return { transaction, receiptNumber };
    } catch (error) {
      console.error('Error recording trust receipt:', error);
      const message = error instanceof Error ? error.message : 'Failed to record trust receipt';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get trust transactions with filters
   * Requirement: 4.2, 4.6
   */
  static async getTrustTransactions(filters: {
    advocateId?: string;
    matterId?: string;
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    isReconciled?: boolean;
  }): Promise<TrustTransaction[]> {
    try {
      let query = supabase
        .from('trust_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters.advocateId) {
        query = query.eq('advocate_id', filters.advocateId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('advocate_id', user.id);
        }
      }

      if (filters.matterId) {
        query = query.eq('matter_id', filters.matterId);
      }

      if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }

      if (filters.transactionType) {
        query = query.eq('transaction_type', filters.transactionType);
      }

      if (filters.isReconciled !== undefined) {
        query = query.eq('is_reconciled', filters.isReconciled);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as TrustTransaction[];
    } catch (error) {
      console.error('Error fetching trust transactions:', error);
      throw error;
    }
  }

  /**
   * Transfer from trust account to business account
   * Requirements: 4.5
   */
  static async transferToBusinessAccount(
    request: TransferToBusinessRequest
  ): Promise<TrustTransfer> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get trust account and validate balance
      const trustAccount = await this.getTrustAccount(user.id);

      // Requirement 4.7: Validate sufficient balance
      if (trustAccount.current_balance < request.amount) {
        throw new Error(
          `Insufficient trust account balance. Available: R${trustAccount.current_balance.toFixed(2)}, Required: R${request.amount.toFixed(2)}`
        );
      }

      const transferData = {
        trust_account_id: trustAccount.id,
        advocate_id: user.id,
        matter_id: request.matterId,
        transfer_type: 'trust_to_business' as const,
        amount: request.amount,
        trust_balance_before: trustAccount.current_balance,
        trust_balance_after: trustAccount.current_balance - request.amount,
        reason: request.reason,
        authorization_type: request.authorizationType,
        invoice_id: request.invoiceId || null,
        transfer_date: request.transferDate || new Date().toISOString().split('T')[0],
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trust_transfers')
        .insert(transferData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Transfer of R${request.amount.toFixed(2)} completed successfully`);
      return data as TrustTransfer;
    } catch (error) {
      console.error('Error transferring to business account:', error);
      const message = error instanceof Error ? error.message : 'Failed to transfer funds';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Generate reconciliation report for trust account
   * Requirement: 4.8
   */
  static async generateReconciliationReport(
    startDate: string,
    endDate: string
  ): Promise<ReconciliationReport> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const trustAccount = await this.getTrustAccount(user.id);

      // Get transactions in date range
      const transactions = await this.getTrustTransactions({
        advocateId: user.id,
        startDate,
        endDate,
      });

      // Get transfers in date range
      const { data: transfers, error: transfersError } = await supabase
        .from('trust_transfers')
        .select('*')
        .eq('advocate_id', user.id)
        .gte('transfer_date', startDate)
        .lte('transfer_date', endDate)
        .order('transfer_date', { ascending: false });

      if (transfersError) throw transfersError;

      // Calculate totals
      const deposits = transactions.filter(t => t.transaction_type === 'deposit');
      const drawdowns = transactions.filter(t => t.transaction_type === 'drawdown');
      
      const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
      const totalDrawdowns = drawdowns.reduce((sum, t) => sum + t.amount, 0);
      const totalTransfers = (transfers as TrustTransfer[]).reduce((sum, t) => sum + t.amount, 0);

      // Calculate opening balance (current balance - net changes)
      const netChange = totalDeposits - totalDrawdowns - totalTransfers;
      const openingBalance = trustAccount.current_balance - netChange;

      const report: ReconciliationReport = {
        trustAccount,
        openingBalance,
        closingBalance: trustAccount.current_balance,
        totalDeposits,
        totalDrawdowns,
        totalTransfers,
        transactions,
        transfers: transfers as TrustTransfer[],
        period: { startDate, endDate },
        isReconciled: trustAccount.last_reconciliation_date === endDate,
        discrepancy: 0,
      };

      return report;
    } catch (error) {
      console.error('Error generating reconciliation report:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Mark trust account as reconciled
   * Requirement: 4.8
   */
  static async markAsReconciled(
    reconciliationDate: string,
    reconciledBalance: number
  ): Promise<TrustAccount> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trust_accounts')
        .update({
          last_reconciliation_date: reconciliationDate,
          last_reconciliation_balance: reconciledBalance,
        })
        .eq('advocate_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Mark all transactions up to this date as reconciled
      await supabase
        .from('trust_transactions')
        .update({ is_reconciled: true, reconciliation_date: reconciliationDate })
        .eq('advocate_id', user.id)
        .lte('transaction_date', reconciliationDate)
        .eq('is_reconciled', false);

      toast.success('Trust account reconciled successfully');
      return data as TrustAccount;
    } catch (error) {
      console.error('Error marking as reconciled:', error);
      const message = error instanceof Error ? error.message : 'Failed to reconcile account';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Check for trust account violations (negative balance)
   * Requirement: 4.7
   */
  static async checkForViolations(): Promise<{
    hasViolation: boolean;
    balance: number;
    message: string;
  }> {
    try {
      const trustAccount = await this.getTrustAccount();

      const hasViolation = trustAccount.current_balance < 0;
      
      return {
        hasViolation,
        balance: trustAccount.current_balance,
        message: hasViolation
          ? `CRITICAL: Trust account has negative balance of R${Math.abs(trustAccount.current_balance).toFixed(2)}. This violates LPC rules.`
          : 'Trust account is compliant',
      };
    } catch (error) {
      console.error('Error checking violations:', error);
      throw error;
    }
  }
}

export const trustAccountService = TrustAccountService;
