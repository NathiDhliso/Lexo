/**
 * PricingCalculator - Utility for handling rate card calculations, discounts, and VAT
 * across pro forma and invoices in the LexoHub system.
 */

export interface ServiceItem {
  id: string;
  name: string;
  pricing_type: 'hourly' | 'fixed' | 'contingency';
  hourly_rate?: number;
  fixed_fee?: number;
  contingency_percentage?: number;
  estimated_hours?: number;
  quantity?: number;
  description?: string;
}

export interface TimeEntry {
  id: string;
  hours: number;
  rate: number;
  description: string;
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  vat_applicable?: boolean;
}

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
}

export interface VATConfig {
  rate: number; // e.g., 0.15 for 15%
  applicable_to_services: boolean;
  applicable_to_expenses: boolean;
}

export interface CalculationResult {
  subtotal: number;
  servicesTotal: number;
  timeEntriesTotal: number;
  expensesTotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  breakdown: {
    services: ServiceCalculation[];
    timeEntries: TimeEntryCalculation[];
    expenses: ExpenseCalculation[];
    discount: DiscountCalculation | null;
    vat: VATCalculation;
  };
}

export interface ServiceCalculation {
  service: ServiceItem;
  amount: number;
  calculation: string;
}

export interface TimeEntryCalculation {
  timeEntry: TimeEntry;
  amount: number;
}

export interface ExpenseCalculation {
  expense: Expense;
  amount: number;
  vatAmount: number;
}

export interface DiscountCalculation {
  config: DiscountConfig;
  amount: number;
  appliedTo: number;
}

export interface VATCalculation {
  config: VATConfig;
  servicesVAT: number;
  expensesVAT: number;
  totalVAT: number;
}

export class PricingCalculator {
  private static readonly DEFAULT_VAT_RATE = 0.15; // 15% VAT for South Africa

  /**
   * Calculate total pricing for services, time entries, and expenses
   */
  static calculate(
    services: ServiceItem[] = [],
    timeEntries: TimeEntry[] = [],
    expenses: Expense[] = [],
    discount?: DiscountConfig,
    vatConfig?: VATConfig
  ): CalculationResult {
    const vat = vatConfig || {
      rate: this.DEFAULT_VAT_RATE,
      applicable_to_services: true,
      applicable_to_expenses: true,
    };

    // Calculate services
    const serviceCalculations = this.calculateServices(services);
    const servicesTotal = serviceCalculations.reduce((sum, calc) => sum + calc.amount, 0);

    // Calculate time entries
    const timeEntryCalculations = this.calculateTimeEntries(timeEntries);
    const timeEntriesTotal = timeEntryCalculations.reduce((sum, calc) => sum + calc.amount, 0);

    // Calculate expenses (before VAT)
    const expenseCalculations = this.calculateExpenses(expenses, vat);
    const expensesTotal = expenseCalculations.reduce((sum, calc) => sum + calc.amount, 0);
    const expensesVAT = expenseCalculations.reduce((sum, calc) => sum + calc.vatAmount, 0);

    // Calculate subtotal (before discount and VAT)
    const subtotal = servicesTotal + timeEntriesTotal + expensesTotal;

    // Calculate discount (only on professional fees: services + time entries)
    const professionalFees = servicesTotal + timeEntriesTotal;
    const discountCalculation = discount ? this.calculateDiscount(discount, professionalFees) : null;
    const discountAmount = discountCalculation?.amount || 0;

    // Calculate VAT on services and time entries (after discount)
    const taxableServicesAmount = professionalFees - discountAmount;
    const servicesVAT = vat.applicable_to_services ? taxableServicesAmount * vat.rate : 0;

    // VAT amount (only on professional fees for main result)
    const vatAmount = servicesVAT;

    // Final total (includes all VAT)
    const total = subtotal - discountAmount + servicesVAT + expensesVAT;

    return {
      subtotal,
      servicesTotal,
      timeEntriesTotal,
      expensesTotal,
      discountAmount,
      vatAmount,
      total,
      breakdown: {
        services: serviceCalculations,
        timeEntries: timeEntryCalculations,
        expenses: expenseCalculations,
        discount: discountCalculation,
        vat: {
          config: vat,
          servicesVAT,
          expensesVAT,
          totalVAT: vatAmount,
        },
      },
    };
  }

  /**
   * Calculate individual services based on their pricing type
   */
  private static calculateServices(services: ServiceItem[]): ServiceCalculation[] {
    return services.map(service => {
      let amount = 0;
      let calculation = '';

      switch (service.pricing_type) {
        case 'hourly':
          const hours = service.estimated_hours || 1;
          const rate = service.hourly_rate || 0;
          amount = hours * rate;
          calculation = `${hours} hours × R${rate.toLocaleString()} = R${amount.toLocaleString()}`;
          break;

        case 'fixed':
          const quantity = service.quantity || 1;
          const fee = service.fixed_fee || 0;
          amount = quantity * fee;
          calculation = quantity > 1 
            ? `${quantity} × R${fee.toLocaleString()} = R${amount.toLocaleString()}`
            : `R${fee.toLocaleString()}`;
          break;

        case 'contingency':
          // Contingency fees are typically calculated as a percentage of the outcome
          // For estimation purposes, we might use a base amount or leave it as 0
          amount = 0;
          calculation = `${service.contingency_percentage || 0}% contingency (calculated on outcome)`;
          break;

        default:
          amount = 0;
          calculation = 'Unknown pricing type';
      }

      return {
        service,
        amount,
        calculation,
      };
    });
  }

  /**
   * Calculate time entries
   */
  private static calculateTimeEntries(timeEntries: TimeEntry[]): TimeEntryCalculation[] {
    return timeEntries.map(timeEntry => ({
      timeEntry,
      amount: timeEntry.hours * timeEntry.rate,
    }));
  }

  /**
   * Calculate expenses with VAT
   */
  private static calculateExpenses(expenses: Expense[], vatConfig: VATConfig): ExpenseCalculation[] {
    return expenses.map(expense => {
      const amount = expense.amount;
      const vatApplicable = expense.vat_applicable !== false && vatConfig.applicable_to_expenses;
      const vatAmount = vatApplicable ? amount * vatConfig.rate : 0;

      return {
        expense,
        amount,
        vatAmount,
      };
    });
  }

  /**
   * Calculate discount amount
   */
  private static calculateDiscount(discount: DiscountConfig, subtotal: number): DiscountCalculation {
    let amount = 0;

    if (discount.type === 'percentage') {
      amount = subtotal * (discount.value / 100);
    } else if (discount.type === 'fixed') {
      amount = Math.min(discount.value, subtotal); // Don't exceed subtotal
    }

    return {
      config: discount,
      amount,
      appliedTo: subtotal,
    };
  }

  /**
   * Format currency for South African Rand
   */
  static formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Calculate estimated hours for a matter based on complexity and service types
   */
  static estimateHours(
    matterType: string,
    complexity: 'low' | 'medium' | 'high',
    services: ServiceItem[] = []
  ): number {
    const baseHours = {
      low: { commercial: 5, litigation: 10, corporate: 8 },
      medium: { commercial: 15, litigation: 25, corporate: 20 },
      high: { commercial: 40, litigation: 60, corporate: 50 },
    };

    const matterTypeKey = matterType as keyof typeof baseHours.low;
    const base = baseHours[complexity][matterTypeKey] || baseHours[complexity].commercial;
    const serviceHours = services.reduce((sum, service) => sum + (service.estimated_hours || 0), 0);

    return Math.round(base + serviceHours);
  }

  /**
   * Generate a detailed breakdown object for analysis
   */
  static generateBreakdown(
    services: ServiceItem[] = [],
    timeEntries: TimeEntry[] = [],
    expenses: Expense[] = []
  ) {
    const result = this.calculate(services, timeEntries, expenses);
    
    return {
      services: result.breakdown.services.map(s => ({
        name: s.service.name,
        amount: s.amount,
        description: s.service.description || ''
      })),
      timeEntries: result.breakdown.timeEntries.map(t => ({
        description: t.timeEntry.description,
        hours: t.timeEntry.hours,
        rate: t.timeEntry.rate,
        amount: t.amount
      })),
      expenses: result.breakdown.expenses.map(e => ({
        description: e.expense.description,
        amount: e.amount,
        vatAmount: e.vatAmount
      })),
      vat: {
        rate: result.breakdown.vat.config.rate,
        servicesVAT: result.breakdown.vat.servicesVAT,
        expensesVAT: result.breakdown.vat.expensesVAT,
        totalVAT: result.breakdown.vat.totalVAT
      },
      totals: {
        subtotal: result.subtotal,
        servicesTotal: result.servicesTotal,
        timeEntriesTotal: result.timeEntriesTotal,
        expensesTotal: result.expensesTotal,
        discountAmount: result.discountAmount,
        vatAmount: result.vatAmount,
        total: result.total
      }
    };
  }

  /**
   * Generate a detailed pricing breakdown for display
   */
  static generateBreakdownText(result: CalculationResult): string {
    const lines: string[] = [];

    // Services
    if (result.breakdown.services.length > 0) {
      lines.push('SERVICES:');
      result.breakdown.services.forEach(calc => {
        lines.push(`  ${calc.service.name}: ${calc.calculation}`);
      });
      lines.push(`  Subtotal: ${this.formatCurrency(result.servicesTotal)}`);
      lines.push('');
    }

    // Time Entries
    if (result.breakdown.timeEntries.length > 0) {
      lines.push('TIME ENTRIES:');
      result.breakdown.timeEntries.forEach(calc => {
        lines.push(`  ${calc.timeEntry.description}: ${calc.timeEntry.hours}h × ${this.formatCurrency(calc.timeEntry.rate)} = ${this.formatCurrency(calc.amount)}`);
      });
      lines.push(`  Subtotal: ${this.formatCurrency(result.timeEntriesTotal)}`);
      lines.push('');
    }

    // Expenses
    if (result.breakdown.expenses.length > 0) {
      lines.push('EXPENSES:');
      result.breakdown.expenses.forEach(calc => {
        lines.push(`  ${calc.expense.description}: ${this.formatCurrency(calc.amount)}`);
        if (calc.vatAmount > 0) {
          lines.push(`    VAT: ${this.formatCurrency(calc.vatAmount)}`);
        }
      });
      lines.push(`  Subtotal: ${this.formatCurrency(result.expensesTotal)}`);
      lines.push('');
    }

    // Totals
    lines.push(`SUBTOTAL: ${this.formatCurrency(result.subtotal)}`);

    if (result.discountAmount > 0) {
      lines.push(`DISCOUNT: -${this.formatCurrency(result.discountAmount)}`);
    }

    if (result.vatAmount > 0) {
      lines.push(`VAT (${(result.breakdown.vat.config.rate * 100).toFixed(0)}%): ${this.formatCurrency(result.vatAmount)}`);
    }

    lines.push(`TOTAL: ${this.formatCurrency(result.total)}`);

    return lines.join('\n');
  }

  /**
   * Validate pricing configuration
   */
  static validatePricing(
    services: ServiceItem[] = [],
    timeEntries: TimeEntry[] = [],
    expenses: Expense[] = []
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate services
    services.forEach((service, index) => {
      if (!service.name?.trim()) {
        errors.push(`Service ${index + 1}: Name is required`);
      }

      switch (service.pricing_type) {
        case 'hourly':
          if (!service.hourly_rate || service.hourly_rate <= 0) {
            errors.push(`Service "${service.name}": Hourly rate must be greater than 0`);
          }
          if (service.estimated_hours && service.estimated_hours <= 0) {
            errors.push(`Service "${service.name}": Estimated hours must be greater than 0`);
          }
          break;

        case 'fixed':
          if (!service.fixed_fee || service.fixed_fee <= 0) {
            errors.push(`Service "${service.name}": Fixed fee must be greater than 0`);
          }
          break;

        case 'contingency':
          if (!service.contingency_percentage || service.contingency_percentage <= 0 || service.contingency_percentage > 100) {
            errors.push(`Service "${service.name}": Contingency percentage must be between 0 and 100`);
          }
          break;
      }
    });

    // Validate time entries
    timeEntries.forEach((entry, index) => {
      if (!entry.description?.trim()) {
        errors.push(`Time entry ${index + 1}: Description is required`);
      }
      if (!entry.hours || entry.hours <= 0) {
        errors.push(`Time entry ${index + 1}: Hours must be greater than 0`);
      }
      if (!entry.rate || entry.rate <= 0) {
        errors.push(`Time entry ${index + 1}: Rate must be greater than 0`);
      }
    });

    // Validate expenses
    expenses.forEach((expense, index) => {
      if (!expense.description?.trim()) {
        errors.push(`Expense ${index + 1}: Description is required`);
      }
      if (!expense.amount || expense.amount <= 0) {
        errors.push(`Expense ${index + 1}: Amount must be greater than 0`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    return {
      isValid: true,
      errors: [],
    };
  }
}