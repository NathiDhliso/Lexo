import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { 
  Invoice, 
  InvoiceStatus, 
  TimeEntry, 
  Matter,
  BarPaymentRules,
  InvoiceGenerationRequest
} from '../../types';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { awsEmailService } from '../aws-email.service';

// South African Bar Payment Rules
const BAR_PAYMENT_RULES: Record<string, BarPaymentRules> = {
  'johannesburg': {
    paymentTermDays: 60,
    reminderSchedule: [30, 45, 55],
    vatRate: 0.15,
    trustTransferDays: 7,
    lateFeePercentage: 0.02,
    prescriptionYears: 3
  },
  'cape_town': {
    paymentTermDays: 90,
    reminderSchedule: [30, 60, 85],
    vatRate: 0.15,
    trustTransferDays: 14,
    lateFeePercentage: 0.015,
    prescriptionYears: 3
  }
};

// Validation schemas
const InvoiceValidation = z.object({
  matterId: z.string().uuid('Invalid matter ID'),
  feesAmount: z.number().positive('Fees amount must be positive'),
  disbursementsAmount: z.number().min(0, 'Disbursements cannot be negative').optional(),
  feeNarrative: z.string().min(10, 'Fee narrative must be at least 10 characters'),
  vatRate: z.number().min(0).max(1, 'VAT rate must be between 0 and 1').optional(),
  timeEntryIds: z.array(z.string().uuid()).optional()
});

const InvoiceGenerationValidation = z.object({
  matterId: z.string().refine(
    (val) => val.startsWith('temp-pro-forma-') || z.string().uuid().safeParse(val).success,
    'Invalid matter ID'
  ),
  timeEntryIds: z.array(z.string().uuid()).optional(),
  customNarrative: z.string().optional(),
  includeUnbilledTime: z.boolean().default(true),
  isProForma: z.boolean().default(false)
});

export class InvoiceService {
  // Generate invoice from matter with time entries (Phase 3)
  static async generateInvoice(request: InvoiceGenerationRequest): Promise<Invoice> {
    try {
      const validated = InvoiceGenerationValidation.parse(request);
      const { matterId, timeEntryIds, customNarrative, isProForma } = validated;
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      const isTempProFormaMatter = matterId.startsWith('temp-pro-forma-');
      
      if (isTempProFormaMatter && !isProForma) {
        throw new Error('Temporary matters can only generate pro forma invoices');
      }
      
      if (isTempProFormaMatter) {
        return this.generateProFormaForTempMatter(request, user);
      }
      
      // Fetch matter details
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('*')
        .eq('id', matterId)
        .eq('advocate_id', user.id)
        .single();
      
      if (matterError || !matter) {
        throw new Error('Matter not found or unauthorized');
      }
      
      // Fetch unbilled time entries
      let timeEntriesQuery = supabase
        .from('time_entries')
        .select('*')
        .eq('matter_id', matterId)
        .eq('billed', false);
      
      if (timeEntryIds && timeEntryIds.length > 0) {
        timeEntriesQuery = timeEntriesQuery.in('id', timeEntryIds);
      }
      
      const { data: timeEntries, error: entriesError } = await timeEntriesQuery;
      
      if (entriesError) throw entriesError;
      if (!timeEntries || timeEntries.length === 0) {
        throw new Error('No unbilled time entries found');
      }
      
      // Calculate fees
      const totalFees = timeEntries.reduce((sum, entry) => {
        return sum + ((entry.duration / 60) * entry.rate);
      }, 0);
      
      // Get disbursements
      const disbursements = matter.disbursements || 0;
      
      // Generate fee narrative
      const narrative = customNarrative || await this.generateFeeNarrative(
        matter,
        timeEntries,
        disbursements
      );
      
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(matter.bar);
      
      // Calculate dates based on Bar rules
      const rules = BAR_PAYMENT_RULES[matter.bar];
      if (!rules) {
        throw new Error(`Payment rules not found for bar: ${matter.bar}`);
      }
      
      const invoiceDate = new Date();
      const dueDate = addDays(invoiceDate, rules.paymentTermDays);
      const vatAmount = totalFees * rules.vatRate;
      const totalAmount = totalFees + vatAmount + disbursements;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          matter_id: matterId,
          invoice_number: invoiceNumber,
          matter_title: matter.title,
          client_name: matter.client_name,
          invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
          due_date: format(dueDate, 'yyyy-MM-dd'),
          bar: matter.bar,
          amount: totalFees,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          disbursements: disbursements,
          // Always use a valid DB enum value for status
          status: 'draft',
          // Tag pro forma using internal_notes so we can filter server-side
          internal_notes: isProForma ? 'pro_forma' : null,
          fee_narrative: narrative,
          reminders_sent: 0,
          next_reminder_date: format(addDays(invoiceDate, rules.reminderSchedule[0]), 'yyyy-MM-dd'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Mark time entries as billed (only for final invoices, not pro forma)
      if (!isProForma) {
        await supabase
          .from('time_entries')
          .update({ 
            billed: true, 
            invoice_id: invoice.id,
            updated_at: new Date().toISOString()
          })
        .in('id', timeEntries.map(e => e.id));
      }
      
      // Update matter WIP value (only for final invoices, not pro forma)
      if (!isProForma) {
      await supabase
        .from('matters')
        .update({ 
          wip_value: Math.max(0, (matter.wip_value || 0) - totalFees),
          actual_fee: (matter.actual_fee || 0) + totalFees,
          updated_at: new Date().toISOString()
        })
        .eq('id', matterId);
      }
      
      toast.success(isProForma ? 'Pro forma invoice generated successfully' : 'Invoice generated successfully');
      return this.mapDatabaseToInvoice(invoice);
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate invoice';
      toast.error(message);
      throw error;
    }
  }

  private static async generateProFormaForTempMatter(request: InvoiceGenerationRequest, user: any): Promise<Invoice> {
    const { matterId, customNarrative } = request;
    
    const requestId = matterId.replace('temp-pro-forma-', '');
    
    const { data: proFormaRequest, error: requestError } = await supabase
      .from('proforma_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (requestError || !proFormaRequest) {
      throw new Error('Pro forma request not found');
    }
    
    const { data: existingMatters } = await supabase
      .from('matters')
      .select('id')
      .eq('advocate_id', user.id)
      .limit(1);
    
    let tempMatterId: string;
    
    if (existingMatters && existingMatters.length > 0) {
      tempMatterId = existingMatters[0].id;
    } else {
      tempMatterId = '00000000-0000-0000-0000-000000000000';
    }
    
    const invoiceNumber = await this.generateInvoiceNumber('johannesburg');
    const invoiceDate = new Date();
    const dueDate = addDays(invoiceDate, 60);
    
    // Import rate card service for pricing
    const { rateCardService } = await import('../rate-card.service');
    
    // Get advocate's hourly rate
    const { data: advocate } = await supabase
      .from('advocates')
      .select('hourly_rate')
      .eq('id', user.id)
      .single();
    
    const advocateHourlyRate = advocate?.hourly_rate || 2500;
    
    // Determine matter type from request
    const matterType = proFormaRequest.matter_type || 'general';
    
    // Generate pro forma estimate using rate card system
    let proFormaEstimate;
    try {
      proFormaEstimate = await rateCardService.generateProFormaEstimate(
        matterType,
        undefined, // Use default services
        advocateHourlyRate
      );
    } catch (error) {
      console.warn('Failed to generate rate card estimate, using fallback:', error);
      // Fallback to original logic if rate card system fails
      const estimatedFees = proFormaRequest.total_amount || advocateHourlyRate * 2; // 2 hours default
      proFormaEstimate = {
        line_items: [
          {
            service_name: 'Legal Consultation',
            description: 'Initial consultation and case assessment',
            quantity: 1,
            unit_price: advocateHourlyRate,
            total_amount: advocateHourlyRate,
            service_category: 'consultation' as const,
            estimated_hours: 1
          },
          {
            service_name: 'Legal Research',
            description: 'Research and analysis of applicable law',
            quantity: 1,
            unit_price: advocateHourlyRate,
            total_amount: advocateHourlyRate,
            service_category: 'research' as const,
            estimated_hours: 1
          }
        ],
        subtotal: estimatedFees,
        vat_amount: estimatedFees * 0.15,
        total_amount: estimatedFees * 1.15,
        estimated_total_hours: 2,
        matter_type: matterType
      };
    }
    
    // Build detailed narrative with line items
    const lineItemsNarrative = proFormaEstimate.line_items
      .map(item => `${item.service_name}: ${item.description} - R${item.total_amount.toFixed(2)}`)
      .join('\n');
    
    const detailedNarrative = customNarrative || 
      `Pro forma invoice for: ${proFormaRequest.matter_title || 'Legal Services'}\n\n` +
      `Matter Description: ${proFormaRequest.matter_description || ''}\n\n` +
      `SERVICES BREAKDOWN:\n${lineItemsNarrative}\n\n` +
      `Estimated Total Hours: ${proFormaEstimate.estimated_total_hours}\n` +
      `Subtotal: R${proFormaEstimate.subtotal.toFixed(2)}\n` +
      `VAT (15%): R${proFormaEstimate.vat_amount.toFixed(2)}\n` +
      `Total Amount: R${proFormaEstimate.total_amount.toFixed(2)}`;
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        matter_id: tempMatterId,
        advocate_id: user.id,
        invoice_number: invoiceNumber,
        invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        bar: 'johannesburg',
        fees_amount: proFormaEstimate.subtotal,
        disbursements_amount: 0,
        vat_rate: 0.15,
        amount_paid: 0,
        status: 'draft',
        is_pro_forma: true,
        internal_notes: `pro_forma_request:${requestId}`,
        external_id: requestId,
        fee_narrative: detailedNarrative,
        reminders_sent: 0,
        next_reminder_date: format(addDays(invoiceDate, 30), 'yyyy-MM-dd')
      })
      .select()
      .single();
    
    if (invoiceError) {
      console.error('Error creating pro forma invoice:', invoiceError);
      throw new Error('Failed to create pro forma invoice');
    }
    
    await supabase
      .from('proforma_requests')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    toast.success('Pro forma invoice generated successfully');
    return this.mapDatabaseToInvoice(invoice);
  }

  // Create a new invoice (legacy method)
  static async createInvoice(data: {
    matterId: string;
    feesAmount: number;
    disbursementsAmount?: number;
    feeNarrative: string;
    vatRate?: number;
    timeEntryIds?: string[];
  }): Promise<Invoice> {
    try {
      // Validate input
      const validated = InvoiceValidation.parse(data);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get matter details and advocate bar for validation
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('title, client_name, advocate_id, advocates!matters_advocate_id_fkey(bar)')
        .eq('id', validated.matterId)
        .single();

      if (matterError) {
        console.error('Matter lookup error:', matterError);
        throw new Error(`Matter not found: ${matterError.message}`);
      }

      if (!matter) {
        throw new Error('Matter not found');
      }

      if (matter.advocate_id !== user.id) {
        throw new Error('Unauthorized: You can only create invoices for your own matters');
      }

      // Extract bar from advocate
      const bar = (matter.advocates as any)?.bar || 'johannesburg';
      
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(bar);
      
      // Calculate due date based on bar rules
      const invoiceDate = new Date();
      const dueDate = this.calculateDueDate(invoiceDate, bar);
      
      // Create the invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          matter_id: validated.matterId,
          advocate_id: user.id,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          bar: bar,
          fees_amount: validated.feesAmount,
          disbursements_amount: validated.disbursementsAmount || 0,
          vat_rate: validated.vatRate || 0.15,
          fee_narrative: validated.feeNarrative,
          status: 'draft',
          reminders_sent: 0,
          reminder_history: []
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create invoice: ${error.message}`);
      }

      // Mark time entries as billed if provided
      if (validated.timeEntryIds && validated.timeEntryIds.length > 0) {
        await supabase
          .from('time_entries')
          .update({ 
            billed: true, 
            invoice_id: invoice.id 
          })
          .in('id', validated.timeEntryIds);
      }
      
      toast.success('Invoice created successfully');
      return invoice as Invoice;
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to create invoice';
      toast.error(message);
      throw error;
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(
    invoiceId: string, 
    newStatus: InvoiceStatus
  ): Promise<Invoice> {
    try {
      const { data: currentInvoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
        
      if (fetchError || !currentInvoice) {
        throw new Error('Invoice not found');
      }
      
      // Validate status transition
      if (!this.isValidStatusTransition(currentInvoice.status as InvoiceStatus, newStatus)) {
        throw new Error(`Invalid status transition from ${currentInvoice.status} to ${newStatus}`);
      }
      
      // Prepare update data
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Add status-specific fields
      if (newStatus === 'sent' && !currentInvoice.sent_at) {
        updateData.sent_at = new Date().toISOString();
      } else if (newStatus === 'paid' && !currentInvoice.datePaid) {
        updateData.date_paid = new Date().toISOString().split('T')[0];
        updateData.amount_paid = currentInvoice.total_amount;
      }
      
      const { data: updatedInvoice, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to update invoice: ${error.message}`);
      }
      
      toast.success(`Invoice status updated to ${newStatus}`);
      return updatedInvoice as Invoice;
      
    } catch (error) {
      console.error('Error updating invoice status:', error);
      const message = error instanceof Error ? error.message : 'Failed to update invoice status';
      toast.error(message);
      throw error;
    }
  }

  static async getProFormaInvoiceHistory(advocateId: string) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('is_pro_forma', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(inv => this.mapDatabaseToInvoice(inv));
    } catch (error) {
      console.error('Error fetching pro forma invoice history:', error);
      throw new Error('Failed to fetch pro forma invoice history');
    }
  }

  static async getProFormaInvoicesByRequest(requestId: string) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('external_id', requestId)
        .eq('is_pro_forma', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(inv => this.mapDatabaseToInvoice(inv));
    } catch (error) {
      console.error('Error fetching pro forma invoices for request:', error);
      throw new Error('Failed to fetch pro forma invoices');
    }
  }

  // Get invoices with filtering and pagination
  static async getInvoices(options: {
    page?: number;
    pageSize?: number;
    status?: InvoiceStatus[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    matterId?: string;
  } = {}) {
    const {
      page = 1,
      pageSize = 10,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      matterId
    } = options;
    
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          matters!inner(title, client_name)
        `, { count: 'exact' });
      
      // Apply filters
      if (status && status.length > 0) {
        // Only apply valid DB enum statuses to the query
        const dbValidStatuses = ['draft','sent','viewed','paid','overdue','disputed','written_off'];
        const hasProForma = status.includes('pro_forma' as any);
        const validStatuses = status
          .map(s => String(s))
          .filter(s => dbValidStatuses.includes(s));

        if (validStatuses.length > 0) {
          query = query.in('status', validStatuses);
        }

        // Special handling: filter pro formas by internal_notes tag
        if (hasProForma) {
          query = query.ilike('internal_notes', '%pro_forma%');
        }
      }

      if (matterId) {
        query = query.eq('matter_id', matterId);
      }
      
      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,fee_narrative.ilike.%${search}%`);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        // Log detailed Postgrest error information to aid RLS/schema debugging
        console.warn('[InvoicesService] Postgrest error fetching invoices', {
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
          message: error.message
        });
        throw new Error(`Failed to fetch invoices: ${error.message}`);
      }
      
      return {
        data: (data || []) as Invoice[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
      
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
      throw error;
    }
  }

  // Record a payment
  static async recordPayment(invoiceId: string, payment: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
  }): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      // Record the payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          advocate_id: user.id,
          amount: payment.amount,
          payment_date: payment.paymentDate,
          payment_method: payment.paymentMethod,
          reference: payment.reference
        });

      if (paymentError) {
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }

      // Update invoice payment status
      const newAmountPaid = (invoice.amount_paid || 0) + payment.amount;
      const newStatus = newAmountPaid >= invoice.total_amount ? 'paid' : invoice.status;

      await supabase
        .from('invoices')
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          date_paid: newStatus === 'paid' ? payment.paymentDate : invoice.datePaid,
          payment_method: payment.paymentMethod,
          payment_reference: payment.reference
        })
        .eq('id', invoiceId);

      toast.success('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(message);
      throw error;
    }
  }

  // Convert pro forma to final invoice
  static async convertProFormaToFinal(proFormaId: string): Promise<Invoice> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the pro forma invoice
      const { data: proForma, error: proFormaError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', proFormaId)
        .eq('advocate_id', user.id)
        // Identify pro forma by internal_notes tag set during generation
        .ilike('internal_notes', '%pro_forma%')
        .single();

      if (proFormaError || !proForma) {
        throw new Error('Pro forma invoice not found or unauthorized');
      }

      // Get the matter details
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('*')
        .eq('id', proForma.matter_id)
        .single();

      if (matterError || !matter) {
        throw new Error('Associated matter not found');
      }

      // Get the time entries associated with this pro forma
      const { data: timeEntries, error: timeEntriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('matter_id', proForma.matter_id)
        .eq('billed', false)
        .is('deleted_at', null);

      if (timeEntriesError) {
        throw timeEntriesError;
      }

      // Generate new invoice number for final invoice
      const finalInvoiceNumber = await this.generateInvoiceNumber(matter.bar);

      // Create the final invoice based on pro forma data
      const { data: finalInvoice, error: finalInvoiceError } = await supabase
        .from('invoices')
        .insert({
          matter_id: proForma.matter_id,
          advocate_id: user.id,
          invoice_number: finalInvoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: proForma.due_date,
          bar: proForma.bar,
          fees_amount: proForma.fees_amount,
          disbursements_amount: proForma.disbursements_amount,
          subtotal: proForma.subtotal,
          vat_rate: proForma.vat_rate,
          vat_amount: proForma.vat_amount,
          total_amount: proForma.total_amount,
          status: 'draft',
          fee_narrative: proForma.fee_narrative,
          internal_notes: `Converted from pro forma ${proForma.invoice_number}`,
          reminders_sent: 0,
          reminder_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (finalInvoiceError) {
        throw new Error(`Failed to create final invoice: ${finalInvoiceError.message}`);
      }

      // Soft-delete or mark the original pro forma as converted without using invalid enum
      await supabase
        .from('invoices')
        .update({
          internal_notes: `Converted to final invoice ${finalInvoiceNumber}`,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', proFormaId);

      // Mark time entries as billed and associate with final invoice
      if (timeEntries && timeEntries.length > 0) {
        await supabase
          .from('time_entries')
          .update({
            billed: true,
            invoice_id: finalInvoice.id,
            updated_at: new Date().toISOString()
          })
          .in('id', timeEntries.map(e => e.id));
      }

      // Update matter WIP value
      await supabase
        .from('matters')
        .update({
          wip_value: Math.max(0, (matter.wip_value || 0) - proForma.fees_amount),
          actual_fee: (matter.actual_fee || 0) + proForma.fees_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', matter.id);

      toast.success('Pro forma converted to final invoice successfully');
      return this.mapDatabaseToInvoice(finalInvoice);

    } catch (error) {
      console.error('Error converting pro forma to final invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to convert pro forma';
      toast.error(message);
      throw error;
    }
  }

  static async sendInvoice(invoiceId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*, matters(client_name, client_email)')
        .eq('id', invoiceId)
        .eq('advocate_id', user.id)
        .single();
      
      if (invoiceError || !invoice) {
        throw new Error('Invoice not found or unauthorized');
      }

      const matter = invoice.matters as any;
      const clientEmail = matter?.client_email;
      const clientName = matter?.client_name || 'Valued Client';

      if (clientEmail && awsEmailService.isConfigured()) {
        const emailResult = await awsEmailService.sendInvoiceEmail({
          recipientEmail: clientEmail,
          recipientName: clientName,
          invoiceNumber: invoice.invoice_number,
          invoiceAmount: invoice.total_amount,
          dueDate: format(new Date(invoice.due_date), 'dd MMM yyyy'),
        });

        if (!emailResult.success) {
          console.warn('Failed to send invoice email:', emailResult.error);
        }
      }

      await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);
      
      toast.success('Invoice sent successfully');
      
    } catch (error) {
      console.error('Error sending invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to send invoice';
      toast.error(message);
      throw error;
    }
  }

  // Generate HTML for invoice
  private static generateInvoiceHTML(invoice: any): string {
    const subtotal = invoice.fees_amount + invoice.disbursements_amount;
    const vatAmount = invoice.vat_amount || (subtotal * (invoice.vat_rate || 0.15));
    const total = invoice.total_amount || (subtotal + vatAmount);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      color: #333;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #D4AF37;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #D4AF37;
      margin: 0;
      font-size: 2.5em;
      letter-spacing: 2px;
    }
    .header .invoice-number {
      font-size: 1.2em;
      color: #666;
      margin-top: 10px;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .invoice-details div {
      flex: 1;
    }
    .invoice-details h3 {
      color: #D4AF37;
      margin-bottom: 10px;
      font-size: 1.1em;
    }
    .invoice-details p {
      margin: 5px 0;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .invoice-table th {
      background: #f8f8f8;
      padding: 15px;
      text-align: left;
      border-bottom: 2px solid #D4AF37;
      font-weight: 600;
      color: #333;
    }
    .invoice-table td {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }
    .invoice-table tr:hover {
      background: #fafafa;
    }
    .fee-narrative {
      margin: 30px 0;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #D4AF37;
      border-radius: 4px;
    }
    .fee-narrative h4 {
      margin-top: 0;
      color: #D4AF37;
    }
    .totals {
      margin-top: 40px;
      text-align: right;
    }
    .totals table {
      margin-left: auto;
      width: 400px;
      border-collapse: collapse;
    }
    .totals td {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    .totals .subtotal-row {
      font-weight: 500;
    }
    .totals .final-row {
      font-weight: bold;
      font-size: 1.3em;
      border-top: 3px solid #D4AF37;
      background: #f8f8f8;
      color: #D4AF37;
    }
    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    .footer p {
      margin: 5px 0;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #D4AF37;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .print-button:hover {
      background: #c49d2f;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <h1>INVOICE</h1>
    <div class="invoice-number">${invoice.invoice_number}</div>
  </div>

  <div class="invoice-details">
    <div>
      <h3>Bill To:</h3>
      <p><strong>${invoice.client_name || 'Client Name'}</strong></p>
      <p>Matter: ${invoice.matter_title || 'Matter Title'}</p>
    </div>
    <div style="text-align: right;">
      <p><strong>Invoice Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p><strong>Bar:</strong> ${invoice.bar.charAt(0).toUpperCase() + invoice.bar.slice(1)}</p>
    </div>
  </div>

  <table class="invoice-table">
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: right; width: 150px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Professional Fees</strong></td>
        <td style="text-align: right;">R ${invoice.fees_amount.toFixed(2)}</td>
      </tr>
      ${invoice.disbursements_amount > 0 ? `
      <tr>
        <td><strong>Disbursements</strong></td>
        <td style="text-align: right;">R ${invoice.disbursements_amount.toFixed(2)}</td>
      </tr>
      ` : ''}
    </tbody>
  </table>

  ${invoice.fee_narrative ? `
  <div class="fee-narrative">
    <h4>Fee Narrative</h4>
    <p>${invoice.fee_narrative}</p>
  </div>
  ` : ''}

  <div class="totals">
    <table>
      <tr class="subtotal-row">
        <td>Subtotal:</td>
        <td style="text-align: right;">R ${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>VAT (${((invoice.vat_rate || 0.15) * 100).toFixed(0)}%):</td>
        <td style="text-align: right;">R ${vatAmount.toFixed(2)}</td>
      </tr>
      <tr class="final-row">
        <td>TOTAL AMOUNT DUE:</td>
        <td style="text-align: right;">R ${total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p><strong>Thank you for your business</strong></p>
    <p>Please make payment within the specified due date</p>
    <p style="margin-top: 20px; font-size: 0.85em;">This is a computer-generated invoice</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Download invoice PDF
  static async downloadInvoicePDF(invoiceId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('advocate_id', user.id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found or unauthorized');
      }

      // Generate HTML invoice
      const invoiceHTML = this.generateInvoiceHTML(invoice);

      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoice_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded. Open the file and use Print to PDF from your browser.');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to download invoice';
      toast.error(message);
      throw error;
    }
  }

  // Update invoice
  static async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('advocate_id', user.id)
        .select()
        .single();
        
      if (error || !invoice) {
        throw new Error('Invoice not found or unauthorized');
      }
      
      return this.mapDatabaseToInvoice(invoice);
      
    } catch (error) {
      console.error('Error updating invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to update invoice';
      toast.error(message);
      throw error;
    }
  }

  // Delete invoice
  static async deleteInvoice(invoiceId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('invoices')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('advocate_id', user.id);
        
      if (error) {
        throw new Error(`Failed to delete invoice: ${error.message}`);
      }
      
    } catch (error) {
      console.error('Error deleting invoice:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete invoice';
      toast.error(message);
      throw error;
    }
  }

  // Helper: Generate invoice number
  private static async generateInvoiceNumber(bar: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const prefix = bar === 'johannesburg' ? 'JHB' : 'CPT';
    
    try {
      // Get the last invoice number for this month and bar
      const { data } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `${prefix}-${year}${month}-%`)
        .order('invoice_number', { ascending: false })
        .limit(1);
      
      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastInvoice = data[0].invoice_number;
        const lastNumber = parseInt(lastInvoice.split('-').pop() || '0');
        nextNumber = lastNumber + 1;
      }
      
      return `${prefix}-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      return `${prefix}-${year}${month}-${Date.now().toString().slice(-4)}`;
    }
  }

  // Helper: Calculate due date based on bar rules
  private static calculateDueDate(invoiceDate: Date, bar: string): Date {
    const dueDate = new Date(invoiceDate);
    if (bar === 'johannesburg') {
      dueDate.setDate(dueDate.getDate() + 60); // 60 days for Johannesburg Bar
    } else {
      dueDate.setDate(dueDate.getDate() + 90); // 90 days for Cape Town Bar
    }
    return dueDate;
  }

  // Helper: Validate status transitions
  private static isValidStatusTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      'Draft': ['Sent', 'Unpaid'],
      'Sent': ['Paid', 'Overdue', 'Unpaid'],
      'Unpaid': ['Paid', 'Overdue', 'Sent'],
      'Overdue': ['Paid', 'Unpaid'],
      'Paid': [], // No transitions from paid
      'Pending': ['Draft', 'Sent', 'Unpaid']
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  // Generate professional fee narrative (Phase 3)
  static async generateFeeNarrative(
    matter: Matter,
    timeEntries: TimeEntry[],
    disbursements: number
  ): Promise<string> {
    // Group time entries by type of work
    const workSummary = this.summarizeWork(timeEntries);
    
    let narrative = `PROFESSIONAL SERVICES RENDERED\n\n`;
    narrative += `Matter: ${matter.title}\n`;
    narrative += `Client: ${matter.clientName}\n`;
    narrative += `Period: ${this.getPeriodDescription(timeEntries)}\n\n`;
    narrative += `SUMMARY OF SERVICES:\n`;
    
    // Add detailed work descriptions
    workSummary.forEach(category => {
      narrative += `\n${category.description}:\n`;
      narrative += `${category.hours.toFixed(1)} hours @ R${category.averageRate.toFixed(2)}/hour\n`;
      narrative += `Subtotal: R${category.total.toFixed(2)}\n`;
    });
    
    // Add disbursements if any
    if (disbursements > 0) {
      narrative += `\nDISBURSEMENTS:\n`;
      narrative += `Various expenses incurred: R${disbursements.toFixed(2)}\n`;
    }
    
    // Add professional closing
    narrative += `\n---\n`;
    narrative += `Services rendered with care and diligence in accordance with `;
    narrative += `the standards of the ${matter.bar} Society of Advocates.\n`;
    
    return narrative;
  }

  

  // Automated reminder system (Phase 3)
  static async processReminders(): Promise<void> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Find invoices due for reminders
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*, matter:matters(*)')
        .eq('status', 'sent')
        .lte('next_reminder_date', today)
        .is('deleted_at', null);
      
      if (!invoices || invoices.length === 0) return;
      
      for (const invoice of invoices) {
        await this.sendReminder(invoice);
        
        // Update reminder tracking
        const rules = BAR_PAYMENT_RULES[invoice.bar];
        const reminderCount = invoice.reminders_sent + 1;
        const nextReminderIndex = reminderCount;
        
        let nextReminderDate = null;
        if (nextReminderIndex < rules.reminderSchedule.length) {
          nextReminderDate = format(
            addDays(new Date(invoice.invoice_date), rules.reminderSchedule[nextReminderIndex]),
            'yyyy-MM-dd'
          );
        }
        
        await supabase
          .from('invoices')
          .update({
            reminders_sent: reminderCount,
            last_reminder_date: today,
            next_reminder_date: nextReminderDate,
            status: reminderCount >= 3 ? ('Overdue' as InvoiceStatus) : 'Sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
      }
      
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }

  // Helper: Summarize work for narrative
  private static summarizeWork(timeEntries: TimeEntry[]) {
    const categories = new Map<string, { hours: number; entries: TimeEntry[] }>();
    
    timeEntries.forEach(entry => {
      const category = this.categorizeWork(entry.description);
      
      if (!categories.has(category)) {
        categories.set(category, {
          description: category,
          hours: 0,
          total: 0,
          rates: [],
          entries: []
        });
      }
      
      const cat = categories.get(category);
      const hours = entry.duration / 60;
      cat.hours += hours;
      cat.total += hours * entry.rate;
      cat.rates.push(entry.rate);
      cat.entries.push(entry);
    });
    
    return Array.from(categories.values()).map(cat => ({
      ...cat,
      averageRate: cat.rates.reduce((a: number, b: number) => a + b, 0) / cat.rates.length
    }));
  }
  
  // Helper: Categorize work type
  private static categorizeWork(description: string): string {
    const lower = description.toLowerCase();
    
    if (lower.includes('draft') || lower.includes('review')) return 'Drafting & Review';
    if (lower.includes('consult') || lower.includes('meeting')) return 'Consultations';
    if (lower.includes('research')) return 'Legal Research';
    if (lower.includes('court') || lower.includes('hearing')) return 'Court Appearances';
    if (lower.includes('correspond') || lower.includes('email')) return 'Correspondence';
    
    return 'General Legal Services';
  }
  
  // Helper: Get period description
  private static getPeriodDescription(timeEntries: TimeEntry[]): string {
    const dates = timeEntries.map(e => new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return `${format(minDate, 'dd MMMM yyyy')} to ${format(maxDate, 'dd MMMM yyyy')}`;
  }
  
  // Helper: Send reminder (integrated with AWS SES)
  private static async sendReminder(invoice: Invoice): Promise<void> {
    try {
      // Get matter details for client information
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('client_name, client_email')
        .eq('id', invoice.matterId)
        .single();

      if (matterError || !matter) {
        console.warn(`Could not find matter for invoice ${invoice.invoiceNumber}`);
        return;
      }

      const clientEmail = matter.client_email;
      const clientName = matter.client_name || 'Valued Client';

      if (clientEmail && awsEmailService.isConfigured()) {
        // Calculate days overdue
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        const emailResult = await awsEmailService.sendPaymentReminderEmail({
          recipientEmail: clientEmail,
          recipientName: clientName,
          invoiceNumber: invoice.invoiceNumber,
          amountDue: invoice.totalAmount,
          dueDate: format(dueDate, 'dd MMM yyyy'),
          daysOverdue: Math.max(0, daysOverdue)
        });

        if (emailResult.success) {
          console.log(`Payment reminder sent for invoice ${invoice.invoiceNumber}`);
          
          // Update reminder tracking
          await supabase
            .from('invoices')
            .update({ 
              last_reminder_sent: new Date().toISOString(),
              reminder_count: (invoice.reminderCount || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', invoice.id);
        } else {
          console.warn(`Failed to send reminder for invoice ${invoice.invoiceNumber}:`, emailResult.error);
        }
      } else {
        console.log(`Email not configured or client email missing for invoice ${invoice.invoiceNumber}`);
      }
    } catch (error) {
      console.error(`Error sending reminder for invoice ${invoice.invoiceNumber}:`, error);
    }
  }
  
  // Helper: Schedule reminders
  private static async scheduleReminders(invoice: Invoice): Promise<void> {
    // In production, integrate with job scheduler
    console.log(`Scheduling reminders for invoice ${invoice.invoiceNumber}`);
  }
  
  // Helper: Map database record to Invoice type
  private static mapDatabaseToInvoice(dbInvoice: Record<string, unknown>): Invoice {
    return {
      id: dbInvoice.id as string,
      invoiceNumber: dbInvoice.invoice_number as string,
      matterId: dbInvoice.matter_id as string,
      matterTitle: dbInvoice.matter_title as string,
      clientName: dbInvoice.client_name as string,
      amount: dbInvoice.amount as number,
      vatAmount: dbInvoice.vat_amount as number,
      totalAmount: dbInvoice.total_amount as number,
      dateIssued: dbInvoice.invoice_date as string,
      dateDue: dbInvoice.due_date as string,
      datePaid: dbInvoice.date_paid as string | null,
      status: dbInvoice.status as InvoiceStatus,
      bar: dbInvoice.bar as string,
      paymentMethod: dbInvoice.payment_method as string | null,
      remindersSent: dbInvoice.reminders_sent as number,
      lastReminderDate: dbInvoice.last_reminder_date as string | null,
      nextReminderDate: dbInvoice.next_reminder_date as string | null,
      notes: dbInvoice.notes as string | null,
      feeNarrative: dbInvoice.fee_narrative as string | null,
      disbursements: dbInvoice.disbursements as number,
      sentAt: dbInvoice.sent_at as string | null,
      amountPaid: dbInvoice.amount_paid as number,
      paymentReference: dbInvoice.payment_reference as string | null
    };
  }
}
