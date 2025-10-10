import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../../types/database';

type EngagementAgreement = Database['public']['Tables']['engagement_agreements']['Row'];
type EngagementAgreementInsert = Database['public']['Tables']['engagement_agreements']['Insert'];
type EngagementAgreementUpdate = Database['public']['Tables']['engagement_agreements']['Update'];

export interface CreateEngagementAgreementRequest {
  proformaRequestId: string;
  clientName: string;
  clientEmail?: string;
  scopeOfWork: string;
  feeStructure: string;
  termsAndConditions?: string;
}

export interface SignEngagementAgreementRequest {
  agreementId: string;
  clientSignature?: string;
  advocateSignature?: string;
}

export class EngagementAgreementService {
  static async createFromProForma(request: CreateEngagementAgreementRequest): Promise<EngagementAgreement> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const agreementData: EngagementAgreementInsert = {
        proforma_request_id: request.proformaRequestId,
        advocate_id: user.id,
        client_name: request.clientName,
        client_email: request.clientEmail,
        scope_of_work: request.scopeOfWork,
        fee_structure: request.feeStructure,
        terms_and_conditions: request.termsAndConditions || this.getDefaultTerms(),
        status: 'draft'
      };

      const { data, error } = await supabase
        .from('engagement_agreements')
        .insert(agreementData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Engagement agreement created');
      return data;
    } catch (error) {
      console.error('Error creating engagement agreement:', error);
      const message = error instanceof Error ? error.message : 'Failed to create engagement agreement';
      toast.error(message);
      throw error;
    }
  }

  static async getByProFormaId(proformaId: string): Promise<EngagementAgreement | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('engagement_agreements')
        .select('*')
        .eq('proforma_request_id', proformaId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching engagement agreement:', error);
      throw error;
    }
  }

  static async getById(agreementId: string): Promise<EngagementAgreement> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('engagement_agreements')
        .select('*')
        .eq('id', agreementId)
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching engagement agreement:', error);
      throw error;
    }
  }

  static async sendToClient(agreementId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('engagement_agreements')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', agreementId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Engagement agreement sent to client');
    } catch (error) {
      console.error('Error sending engagement agreement:', error);
      const message = error instanceof Error ? error.message : 'Failed to send engagement agreement';
      toast.error(message);
      throw error;
    }
  }

  static async signAgreement(request: SignEngagementAgreementRequest): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const updateData: EngagementAgreementUpdate = {
        status: 'signed',
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (request.clientSignature) {
        updateData.client_signature_data = request.clientSignature;
      }

      if (request.advocateSignature) {
        updateData.advocate_signature_data = request.advocateSignature;
      }

      const { error } = await supabase
        .from('engagement_agreements')
        .update(updateData)
        .eq('id', request.agreementId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Engagement agreement signed');
    } catch (error) {
      console.error('Error signing engagement agreement:', error);
      const message = error instanceof Error ? error.message : 'Failed to sign engagement agreement';
      toast.error(message);
      throw error;
    }
  }

  static async convertToMatter(agreementId: string): Promise<string> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const agreement = await this.getById(agreementId);
      
      if (agreement.status !== 'signed') {
        throw new Error('Agreement must be signed before converting to matter');
      }

      if (!agreement.proforma_request_id) {
        throw new Error('No pro forma request associated with this agreement');
      }

      const { data: proforma, error: proformaError } = await supabase
        .from('proforma_requests')
        .select('*')
        .eq('id', agreement.proforma_request_id)
        .single();

      if (proformaError || !proforma) {
        throw new Error('Pro forma request not found');
      }

      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .insert({
          advocate_id: user.id,
          title: proforma.matter_title || 'Matter from Pro Forma',
          description: agreement.scope_of_work,
          client_name: agreement.client_name,
          client_email: agreement.client_email,
          matter_type: proforma.matter_type || 'general',
          bar: proforma.bar || 'johannesburg',
          fee_type: 'standard',
          estimated_total: proforma.estimated_total,
          engagement_agreement_id: agreementId,
          status: 'active'
        })
        .select()
        .single();

      if (matterError) throw matterError;

      await supabase
        .from('engagement_agreements')
        .update({ matter_id: matter.id })
        .eq('id', agreementId);

      await supabase
        .from('proforma_requests')
        .update({ 
          status: 'converted',
          client_response_status: 'accepted'
        })
        .eq('id', agreement.proforma_request_id);

      toast.success('Matter created from engagement agreement');
      return matter.id;
    } catch (error) {
      console.error('Error converting to matter:', error);
      const message = error instanceof Error ? error.message : 'Failed to convert to matter';
      toast.error(message);
      throw error;
    }
  }

  static async cancelAgreement(agreementId: string, reason: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('engagement_agreements')
        .update({ 
          status: 'cancelled',
          terms_and_conditions: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', agreementId)
        .eq('advocate_id', user.id);

      if (error) throw error;

      toast.success('Engagement agreement cancelled');
    } catch (error) {
      console.error('Error cancelling engagement agreement:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel engagement agreement';
      toast.error(message);
      throw error;
    }
  }

  static getDefaultTerms(): string {
    return `TERMS AND CONDITIONS OF ENGAGEMENT

1. SCOPE OF SERVICES
The Advocate agrees to provide legal services as outlined in the Scope of Work section of this agreement.

2. FEES AND BILLING
Fees will be charged in accordance with the Fee Structure outlined in this agreement. All fees are subject to VAT at the prevailing rate.

3. PAYMENT TERMS
Invoices are payable within the terms specified by the applicable Bar Council rules (60 days for Johannesburg Bar, 90 days for Cape Town Bar).

4. TERMINATION
Either party may terminate this engagement with written notice. The Client remains liable for fees incurred up to the date of termination.

5. CONFIDENTIALITY
The Advocate will maintain confidentiality of all client information in accordance with professional conduct rules.

6. GOVERNING LAW
This agreement is governed by the laws of South Africa.

7. PROFESSIONAL INDEMNITY
The Advocate maintains professional indemnity insurance as required by the Bar Council.

By signing this agreement, both parties acknowledge and accept these terms and conditions.`;
  }

  static async listAgreements(options: {
    status?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: EngagementAgreement[];
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { page = 1, pageSize = 20, status } = options;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('engagement_agreements')
        .select('*', { count: 'exact' })
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
    } catch (error) {
      console.error('Error listing engagement agreements:', error);
      throw error;
    }
  }
}

export const engagementAgreementService = new EngagementAgreementService();
