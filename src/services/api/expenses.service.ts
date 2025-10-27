import { DisbursementService, DisbursementCreate } from './disbursement.service';

/**
 * @deprecated ExpensesService is deprecated. Use DisbursementService instead.
 * This compatibility layer will be removed in a future version.
 */

export interface Expense {
  id: string;
  matter_id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  matter_id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  receipt_url?: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  date?: string;
  category?: string;
  receipt_url?: string;
}

/**
 * @deprecated ExpensesService is deprecated. Use DisbursementService instead.
 * This is a compatibility layer that delegates to DisbursementService.
 */
export class ExpensesService {
  /**
   * @deprecated Use DisbursementService.getDisbursementsByMatter() instead
   */
  static async getMatterExpenses(matterId: string): Promise<Expense[]> {
    console.warn('ExpensesService.getMatterExpenses is deprecated. Use DisbursementService.getDisbursementsByMatter instead.');
    
    const disbursements = await DisbursementService.getDisbursementsByMatter(matterId);
    
    // Convert Disbursement to Expense format for compatibility
    return disbursements.map(disbursement => ({
      id: disbursement.id,
      matter_id: disbursement.matter_id,
      description: disbursement.description,
      amount: disbursement.amount,
      date: disbursement.date_incurred,
      category: undefined, // Not available in disbursement model
      receipt_url: disbursement.receipt_link,
      created_at: disbursement.created_at,
      updated_at: disbursement.updated_at
    }));
  }

  /**
   * @deprecated Use DisbursementService directly instead
   */
  static async getExpenseById(id: string): Promise<Expense | null> {
    console.warn('ExpensesService.getExpenseById is deprecated. Use DisbursementService directly instead.');
    
    // This method doesn't have a direct equivalent in DisbursementService
    // For now, we'll get all disbursements and filter (not efficient, but maintains compatibility)
    const disbursements = await DisbursementService.getDisbursements({ pageSize: 1000 });
    const disbursement = disbursements.data.find(d => d.id === id);
    
    if (!disbursement) return null;
    
    return {
      id: disbursement.id,
      matter_id: disbursement.matter_id,
      description: disbursement.description,
      amount: disbursement.amount,
      date: disbursement.date_incurred,
      category: undefined,
      receipt_url: disbursement.receipt_link,
      created_at: disbursement.created_at,
      updated_at: disbursement.updated_at
    };
  }

  /**
   * @deprecated Use DisbursementService.createDisbursement() instead
   */
  static async createExpense(input: CreateExpenseInput): Promise<Expense> {
    console.warn('ExpensesService.createExpense is deprecated. Use DisbursementService.createDisbursement instead.');
    
    const disbursementInput: DisbursementCreate = {
      matter_id: input.matter_id,
      description: input.description,
      amount: input.amount,
      date_incurred: input.date,
      receipt_link: input.receipt_url
    };
    
    const disbursement = await DisbursementService.createDisbursement(disbursementInput);
    
    return {
      id: disbursement.id,
      matter_id: disbursement.matter_id,
      description: disbursement.description,
      amount: disbursement.amount,
      date: disbursement.date_incurred,
      category: input.category,
      receipt_url: disbursement.receipt_link,
      created_at: disbursement.created_at,
      updated_at: disbursement.updated_at
    };
  }

  /**
   * @deprecated Use DisbursementService.updateDisbursement() instead
   */
  static async updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
    console.warn('ExpensesService.updateExpense is deprecated. Use DisbursementService.updateDisbursement instead.');
    
    const updateData: Partial<DisbursementCreate> = {};
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.date !== undefined) updateData.date_incurred = input.date;
    if (input.receipt_url !== undefined) updateData.receipt_link = input.receipt_url;
    
    const disbursement = await DisbursementService.updateDisbursement(id, updateData);
    
    return {
      id: disbursement.id,
      matter_id: disbursement.matter_id,
      description: disbursement.description,
      amount: disbursement.amount,
      date: disbursement.date_incurred,
      category: input.category,
      receipt_url: disbursement.receipt_link,
      created_at: disbursement.created_at,
      updated_at: disbursement.updated_at
    };
  }

  /**
   * @deprecated Use DisbursementService.deleteDisbursement() instead
   */
  static async deleteExpense(id: string): Promise<void> {
    console.warn('ExpensesService.deleteExpense is deprecated. Use DisbursementService.deleteDisbursement instead.');
    
    await DisbursementService.deleteDisbursement(id);
  }

  /**
   * @deprecated Use DisbursementService.getDisbursementsByMatter() and calculate total instead
   */
  static async getTotalExpensesForMatter(matterId: string): Promise<number> {
    console.warn('ExpensesService.getTotalExpensesForMatter is deprecated. Use DisbursementService.getDisbursementsByMatter and calculate total instead.');
    
    const disbursements = await DisbursementService.getDisbursementsByMatter(matterId);
    return disbursements.reduce((sum, disbursement) => sum + (disbursement.amount || 0), 0);
  }

  /**
   * @deprecated Use DisbursementService.getDisbursementsByMatter() and filter by date instead
   */
  static async getExpensesByDateRange(
    matterId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    console.warn('ExpensesService.getExpensesByDateRange is deprecated. Use DisbursementService.getDisbursementsByMatter and filter by date instead.');
    
    const disbursements = await DisbursementService.getDisbursementsByMatter(matterId);
    
    const filtered = disbursements.filter(disbursement => {
      const date = new Date(disbursement.date_incurred);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return date >= start && date <= end;
    });
    
    return filtered.map(disbursement => ({
      id: disbursement.id,
      matter_id: disbursement.matter_id,
      description: disbursement.description,
      amount: disbursement.amount,
      date: disbursement.date_incurred,
      category: undefined,
      receipt_url: disbursement.receipt_link,
      created_at: disbursement.created_at,
      updated_at: disbursement.updated_at
    }));
  }

  /**
   * @deprecated Category filtering not available in DisbursementService. Use DisbursementService.getDisbursementsByMatter() instead
   */
  static async getExpensesByCategory(matterId: string, category: string): Promise<Expense[]> {
    console.warn('ExpensesService.getExpensesByCategory is deprecated. Category filtering not available in DisbursementService. Use DisbursementService.getDisbursementsByMatter() instead.');
    
    // Since DisbursementService doesn't have category filtering, return empty array
    // This maintains compatibility but indicates the feature is no longer supported
    console.warn(`Category filtering for "${category}" is no longer supported. Returning empty array.`);
    return [];
  }
}
