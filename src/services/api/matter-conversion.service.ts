import { supabase } from '../../lib/supabase';
import { proformaRequestService } from './proforma-request.service';
import { toast } from 'react-hot-toast';

export class MatterConversionService {
  private static instance: MatterConversionService;

  public static getInstance(): MatterConversionService {
    if (!MatterConversionService.instance) {
      MatterConversionService.instance = new MatterConversionService();
    }
    return MatterConversionService.instance;
  }

  async convertProFormaToMatter(
    proformaId: string,
    matterData: any
  ): Promise<string> {
    try {
      const proforma = await proformaRequestService.getById(proformaId);
      if (!proforma) {
        throw new Error('Pro forma request not found');
      }

      if (proforma.status !== 'accepted') {
        throw new Error('Only accepted pro forma requests can be converted');
      }

      if (proforma.converted_matter_id) {
        throw new Error('This pro forma has already been converted');
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const expectedDate = matterData.expected_completion_date || matterData.expectedCompletionDate;
      
      const completeMatterData = {
        advocate_id: user.id,
        title: matterData.title,
        description: matterData.description,
        matter_type: matterData.matter_type || matterData.matterType || null,
        court_case_number: matterData.court_case_number || matterData.courtCaseNumber || null,
        client_name: matterData.client_name || matterData.clientName,
        client_email: matterData.client_email || matterData.clientEmail || null,
        client_phone: matterData.client_phone || matterData.clientPhone || null,
        client_address: matterData.client_address || matterData.clientAddress || null,
        client_type: matterData.client_type || matterData.clientType || null,
        instructing_attorney: matterData.instructing_attorney || matterData.instructingAttorney || null,
        instructing_attorney_email: matterData.instructing_attorney_email || matterData.instructingAttorneyEmail || null,
        instructing_attorney_phone: matterData.instructing_attorney_phone || matterData.instructingAttorneyPhone || null,
        instructing_firm: matterData.instructing_firm || matterData.instructingFirm || null,
        instructing_firm_ref: matterData.instructing_firm_ref || matterData.instructingFirmRef || null,
        fee_type: matterData.fee_type || matterData.feeType || null,
        estimated_fee: matterData.estimated_fee || matterData.estimatedFee || null,
        fee_cap: matterData.fee_cap || matterData.feeCap || null,
        risk_level: matterData.risk_level || matterData.riskLevel || null,
        expected_completion_date: expectedDate && expectedDate !== '' ? expectedDate : null,
        date_instructed: new Date().toISOString().split('T')[0],
        tags: matterData.tags || [],
        source_proforma_id: proforma.id,
        is_prepopulated: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .insert(completeMatterData)
        .select()
        .single();

      if (matterError) throw matterError;

      await proformaRequestService.update(proforma.id, {
        status: 'converted',
        converted_matter_id: matter.id,
      });

      toast.success('Pro forma converted to matter successfully');
      return matter.id;
    } catch (error) {
      console.error('Error converting pro forma to matter:', error);
      const message = error instanceof Error ? error.message : 'Failed to convert pro forma';
      toast.error(message);
      throw error;
    }
  }

  async reverseConversion(matterId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get the matter and verify ownership
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('*')
        .eq('id', matterId)
        .eq('advocate_id', user.id)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found or unauthorized');
      }

      if (!matter.source_proforma_id) {
        throw new Error('This matter was not created from a pro forma conversion');
      }

      // Check if matter has any time entries
      const { data: timeEntries, error: timeEntriesError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('matter_id', matterId)
        .limit(1);

      if (timeEntriesError) throw timeEntriesError;

      if (timeEntries && timeEntries.length > 0) {
        throw new Error('Cannot reverse conversion: Matter has time entries. Please delete all time entries first.');
      }

      // Check if matter has any expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id')
        .eq('matter_id', matterId)
        .limit(1);

      if (expensesError) throw expensesError;

      if (expenses && expenses.length > 0) {
        throw new Error('Cannot reverse conversion: Matter has expenses. Please delete all expenses first.');
      }

      // Check if matter has any invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id')
        .eq('matter_id', matterId)
        .limit(1);

      if (invoicesError) throw invoicesError;

      if (invoices && invoices.length > 0) {
        throw new Error('Cannot reverse conversion: Matter has invoices. Please delete all invoices first.');
      }

      // Get the original pro forma
      const proforma = await proformaRequestService.getById(matter.source_proforma_id);
      if (!proforma) {
        throw new Error('Original pro forma request not found');
      }

      if (proforma.status !== 'converted') {
        throw new Error('Pro forma is not in converted status');
      }

      // Perform the reversal in a transaction-like manner
      // First, delete the matter
      const { error: deleteError } = await supabase
        .from('matters')
        .delete()
        .eq('id', matterId)
        .eq('advocate_id', user.id);

      if (deleteError) {
        throw new Error(`Failed to delete matter: ${deleteError.message}`);
      }

      // Then reset the pro forma status to draft for further editing
      // This ensures the matter is deleted before updating the pro forma
      const updatedProforma = await proformaRequestService.update(matter.source_proforma_id, {
        status: 'draft',
        converted_matter_id: null,
      });

      // Verify the update was successful
      if (updatedProforma.status !== 'draft') {
        console.error('Pro forma status was not updated to draft:', updatedProforma);
        throw new Error('Failed to update pro forma status to draft');
      }

      toast.success('Conversion reversed successfully. Pro forma is now in draft status for editing.');
    } catch (error) {
      console.error('Error reversing conversion:', error);
      const message = error instanceof Error ? error.message : 'Failed to reverse conversion';
      toast.error(message);
      throw error;
    }
  }

  async prepopulateMatterForm(proformaId: string) {
    try {
      const proforma = await proformaRequestService.getById(proformaId);
      if (!proforma) return null;

      return {
        title: proforma.work_title || '',
        description: proforma.work_description || '',
        matter_type: '',
        matterType: '',
        court_case_number: '',
        courtCaseNumber: '',
        client_name: proforma.instructing_attorney_name || '',
        clientName: proforma.instructing_attorney_name || '',
        client_email: proforma.instructing_attorney_email || '',
        clientEmail: proforma.instructing_attorney_email || '',
        client_phone: proforma.instructing_attorney_phone || '',
        clientPhone: proforma.instructing_attorney_phone || '',
        client_address: '',
        clientAddress: '',
        client_type: 'individual' as const,
        clientType: 'individual' as const,
        instructing_attorney: proforma.instructing_attorney_name || '',
        instructingAttorney: proforma.instructing_attorney_name || '',
        instructing_attorney_email: proforma.instructing_attorney_email || '',
        instructingAttorneyEmail: proforma.instructing_attorney_email || '',
        instructing_attorney_phone: proforma.instructing_attorney_phone || '',
        instructingAttorneyPhone: proforma.instructing_attorney_phone || '',
        instructing_firm: proforma.instructing_firm || '',
        instructingFirm: proforma.instructing_firm || '',
        instructing_firm_ref: '',
        instructingFirmRef: '',
        fee_type: 'fixed' as const,
        feeType: 'fixed' as const,
        estimated_fee: proforma.estimated_amount || 0,
        estimatedFee: proforma.estimated_amount || 0,
        fee_cap: undefined,
        feeCap: undefined,
        risk_level: 'medium' as const,
        riskLevel: 'medium' as const,
        expected_completion_date: '',
        expectedCompletionDate: '',
        tags: [],
        services: [],
      };
    } catch (error) {
      console.error('Error prepopulating matter form:', error);
      return null;
    }
  }
}

export const matterConversionService = MatterConversionService.getInstance();
