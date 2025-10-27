/**
 * Invoice Email Delivery Service
 * Handles invoice delivery to attorneys via email
 * Requirements: 8.5, 8.6
 */

import { supabase } from '../../lib/supabase';
import { invoicePDFService } from '../invoice-pdf.service';
import { toastService } from '../toast.service';

export interface InvoiceEmailDeliveryRequest {
  invoice_id: string;
  attorney_email: string;
  attorney_name: string;
  advocate_name: string;
  matter_title: string;
  invoice_number: string;
  include_portal_link?: boolean;
}

export class InvoiceEmailDeliveryService {
  /**
   * Send invoice PDF to unregistered attorney via email
   * Requirement 8.5, 8.6
   */
  static async sendInvoiceToAttorney(request: InvoiceEmailDeliveryRequest): Promise<boolean> {
    try {
      // 1. Generate PDF blob
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          matter:matters(title, client_name, reference_number),
          time_entries(*),
          expenses(*),
          services:matter_services(*)
        `)
        .eq('id', request.invoice_id)
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Get advocate info
      const { data: advocateData, error: advocateError } = await supabase
        .from('profiles')
        .select('full_name, practice_number, email, phone, vat_number, vat_registered, address')
        .eq('id', invoiceData.advocate_id)
        .single();

      if (advocateError) throw advocateError;

      // 3. Generate PDF
      const pdfBlob = await invoicePDFService.generateInvoicePDF(
        invoiceData,
        {
          full_name: advocateData.full_name,
          practice_number: advocateData.practice_number,
          email: advocateData.email,
          phone: advocateData.phone,
          advocate_id: invoiceData.advocate_id,
          vat_number: advocateData.vat_number,
          vat_registered: advocateData.vat_registered,
          address: advocateData.address
        }
      );

      // 4. Convert PDF to base64
      const reader = new FileReader();
      const base64PDF = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      // 5. Send email via Supabase Edge Function
      const { data: emailData, error: emailError } = await supabase.functions.invoke(
        'send-invoice-email',
        {
          body: {
            to: request.attorney_email,
            attorney_name: request.attorney_name,
            advocate_name: request.advocate_name,
            matter_title: request.matter_title,
            invoice_number: request.invoice_number,
            pdf_attachment: base64PDF,
            include_portal_link: request.include_portal_link || false,
            invoice_id: request.invoice_id
          }
        }
      );

      if (emailError) {
        console.error('Email delivery error:', emailError);
        // Fallback: Log for manual delivery
        console.log('FALLBACK: Invoice email delivery failed, logging for manual processing:', {
          request,
          error: emailError
        });
        
        toastService.warning('Invoice generated but email delivery failed. Please send manually.');
        return false;
      }

      // 6. Log delivery in database
      await supabase.from('invoice_delivery_log').insert({
        invoice_id: request.invoice_id,
        delivered_to: request.attorney_email,
        delivery_method: 'email',
        delivered_at: new Date().toISOString(),
        delivery_status: 'sent'
      });

      toastService.success(`Invoice sent to ${request.attorney_email}`);
      return true;
    } catch (error: any) {
      console.error('Error sending invoice to attorney:', error);
      toastService.error(error.message || 'Failed to send invoice');
      return false;
    }
  }

  /**
   * Check if attorney should receive email delivery
   * Returns true if attorney is NOT registered (needs email delivery)
   * Requirement 8.5
   */
  static async shouldEmailInvoice(attorneyEmail: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('attorneys')
        .select('is_registered')
        .eq('email', attorneyEmail)
        .single();

      if (error) {
        // Attorney doesn't exist yet, should email
        return true;
      }

      // Email if not registered
      return !data.is_registered;
    } catch (_error) {
      // Default to email delivery if check fails
      return true;
    }
  }

  /**
   * Get delivery history for an invoice
   */
  static async getInvoiceDeliveryHistory(invoiceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('invoice_delivery_log')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching delivery history:', error);
      return [];
    }
  }
}

export const invoiceEmailDeliveryService = new InvoiceEmailDeliveryService();
