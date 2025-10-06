import { supabase } from '../lib/supabase';
import type { Matter, ProForma, Invoice } from '../types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
}

export interface WorkflowStep {
  id: string;
  action: string;
  description: string;
  autoExecute: boolean;
  conditions?: WorkflowCondition[];
}

export interface WorkflowTrigger {
  event: string;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export class WorkflowAutomationService {
  static async updateMatterStatus(matterId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('matters')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', matterId);

    if (error) throw error;

    await this.triggerWorkflow('matter_status_changed', { matterId, newStatus });
  }

  static async updateProFormaStatus(proFormaId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('pro_forma_requests')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', proFormaId);

    if (error) throw error;

    await this.triggerWorkflow('proforma_status_changed', { proFormaId, newStatus });
  }

  static async updateInvoiceStatus(invoiceId: string, newStatus: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) throw error;

    await this.triggerWorkflow('invoice_status_changed', { invoiceId, newStatus });
  }

  static async triggerWorkflow(event: string, data: any): Promise<void> {
    console.log(`Workflow triggered: ${event}`, data);

    switch (event) {
      case 'proforma_status_changed':
        if (data.newStatus === 'accepted') {
          await this.handleProFormaAccepted(data.proFormaId);
        }
        break;

      case 'invoice_status_changed':
        if (data.newStatus === 'sent') {
          await this.schedulePaymentReminders(data.invoiceId);
        }
        break;

      case 'matter_status_changed':
        if (data.newStatus === 'settled') {
          await this.handleMatterSettled(data.matterId);
        }
        break;
    }
  }

  private static async handleProFormaAccepted(proFormaId: string): Promise<void> {
    console.log('Auto-action: Pro forma accepted, suggesting invoice conversion');
  }

  private static async schedulePaymentReminders(invoiceId: string): Promise<void> {
    console.log('Auto-action: Scheduling payment reminders for invoice', invoiceId);
  }

  private static async handleMatterSettled(matterId: string): Promise<void> {
    console.log('Auto-action: Matter settled, checking for unbilled time');
  }

  static async getWorkflowSuggestions(userId: string): Promise<any[]> {
    const suggestions = [];

    const { data: matters } = await supabase
      .from('matters')
      .select('*')
      .eq('advocate_id', userId)
      .eq('status', 'active');

    const { data: proformas } = await supabase
      .from('pro_forma_requests')
      .select('*')
      .eq('advocate_id', userId)
      .in('status', ['pending', 'sent']);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('advocate_id', userId)
      .in('status', ['draft', 'sent', 'overdue']);

    if (matters && matters.length > 0) {
      const mattersWithoutProForma = matters.filter(m => !m.has_proforma);
      if (mattersWithoutProForma.length > 0) {
        suggestions.push({
          type: 'create_proforma',
          count: mattersWithoutProForma.length,
          priority: 'medium',
          matters: mattersWithoutProForma
        });
      }
    }

    if (proformas && proformas.length > 0) {
      const acceptedProFormas = proformas.filter(p => p.status === 'accepted');
      if (acceptedProFormas.length > 0) {
        suggestions.push({
          type: 'convert_proforma',
          count: acceptedProFormas.length,
          priority: 'high',
          proformas: acceptedProFormas
        });
      }
    }

    if (invoices && invoices.length > 0) {
      const overdueInvoices = invoices.filter(i => i.status === 'overdue');
      if (overdueInvoices.length > 0) {
        suggestions.push({
          type: 'chase_payment',
          count: overdueInvoices.length,
          priority: 'high',
          invoices: overdueInvoices
        });
      }
    }

    return suggestions;
  }

  static readonly WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
      id: 'standard-matter-to-invoice',
      name: 'Standard Matter to Invoice',
      description: 'Complete workflow from matter creation to invoice payment',
      steps: [
        {
          id: 'create-matter',
          action: 'Create Matter',
          description: 'Create a new matter with client details',
          autoExecute: false
        },
        {
          id: 'generate-proforma',
          action: 'Generate Pro Forma',
          description: 'Create pro forma invoice for client approval',
          autoExecute: false
        },
        {
          id: 'await-acceptance',
          action: 'Await Pro Forma Acceptance',
          description: 'Wait for client to accept pro forma',
          autoExecute: true
        },
        {
          id: 'convert-to-invoice',
          action: 'Convert to Invoice',
          description: 'Convert accepted pro forma to final invoice',
          autoExecute: false
        },
        {
          id: 'send-invoice',
          action: 'Send Invoice',
          description: 'Email invoice to client',
          autoExecute: false
        },
        {
          id: 'track-payment',
          action: 'Track Payment',
          description: 'Monitor payment status and send reminders',
          autoExecute: true
        }
      ],
      triggers: [
        {
          event: 'proforma_accepted',
          conditions: [
            { field: 'status', operator: 'equals', value: 'accepted' }
          ]
        }
      ]
    },
    {
      id: 'quick-invoice',
      name: 'Quick Invoice (No Pro Forma)',
      description: 'Direct invoice generation without pro forma',
      steps: [
        {
          id: 'create-matter',
          action: 'Create Matter',
          description: 'Create a new matter',
          autoExecute: false
        },
        {
          id: 'generate-invoice',
          action: 'Generate Invoice',
          description: 'Create invoice directly',
          autoExecute: false
        },
        {
          id: 'send-invoice',
          action: 'Send Invoice',
          description: 'Email invoice to client',
          autoExecute: false
        },
        {
          id: 'track-payment',
          action: 'Track Payment',
          description: 'Monitor payment status',
          autoExecute: true
        }
      ],
      triggers: []
    }
  ];
}
