/**
 * Matter API Service
 * Handles all matter-related database operations
 * Extends BaseApiService for consistent error handling and CRUD operations
 */

import { BaseApiService, type ApiResponse, type FilterOptions, type PaginationOptions } from './base-api.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { Matter, MatterStatus, NewMatterForm } from '../../types';

export interface MatterFilters extends FilterOptions {
  advocate_id?: string;
  status?: MatterStatus | MatterStatus[];
  client_name?: string;
  matter_type?: string;
  bar?: 'johannesburg' | 'cape_town';
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  is_overdue?: boolean;
  date_instructed_from?: string;
  date_instructed_to?: string;
  expected_completion_from?: string;
  expected_completion_to?: string;
  tags?: string[];
}

export interface MatterStats {
  total: number;
  active: number;
  pending: number;
  settled: number;
  closed: number;
  overdue: number;
  totalWipValue: number;
  averageSettlementProbability: number;
}

export interface MatterSearchOptions {
  query: string;
  filters?: MatterFilters;
  pagination?: PaginationOptions;
}

export class MatterApiService extends BaseApiService<Matter> {
  constructor() {
    super('matters', `
      *,
      advocate:user_profiles!advocate_id(first_name, last_name, practice_number),
      time_entries(count),
      invoices(count)
    `);
  }

  /**
   * Get matters for specific advocate
   */
  async getByAdvocate(
    advocateId: string,
    options: {
      filters?: Omit<MatterFilters, 'advocate_id'>;
      pagination?: PaginationOptions;
    } = {}
  ): Promise<ApiResponse<Matter[]>> {
    const filters: MatterFilters = {
      ...options.filters,
      advocate_id: advocateId
    };

    return this.getAll({
      filters,
      pagination: options.pagination,
      sort: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Get active matters for advocate
   */
  async getActiveMatters(advocateId: string): Promise<ApiResponse<Matter[]>> {
    return this.getByAdvocate(advocateId, {
      filters: {
        status: ['active', 'pending']
      }
    });
  }

  /**
   * Get overdue matters
   */
  async getOverdueMatters(advocateId: string): Promise<ApiResponse<Matter[]>> {
    return this.getByAdvocate(advocateId, {
      filters: {
        is_overdue: true
      }
    });
  }

  /**
   * Create new matter with simple select (no joins) to avoid RLS issues
   */
  async createSimple(data: Partial<Matter>): Promise<ApiResponse<Matter>> {
    // Validate firm_id is provided
    if (!data.firm_id) {
      toast.error('Instructing firm is required');
      throw new Error('firm_id is required for matter creation');
    }

    // Verify firm exists
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('id, status')
      .eq('id', data.firm_id)
      .single();

    if (firmError || !firm) {
      toast.error('Selected firm not found');
      throw new Error('The specified firm does not exist');
    }

    if (firm.status !== 'active') {
      toast.error('Selected firm is inactive');
      throw new Error('Cannot create matter with inactive firm');
    }

    return this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .insert(data)
        .select('*') // Simple select without joins
        .single();
    });
  }

  /**
   * Create new matter from form data
  */
  async createFromForm(formData: NewMatterForm): Promise<ApiResponse<Matter>> {
    // Transform form data to match database schema
    // Ensure advocate_id matches authenticated user to satisfy RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return {
        data: null,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated',
          details: undefined
        }
      };
    }

    // Validate firm_id is provided (required for attorney-first model)
    if (!formData.firm_id && !formData.firmId) {
      toast.error('Instructing firm is required');
      throw new Error('Instructing firm is required. Please select a firm before creating a matter.');
    }

    const firmId = formData.firm_id || formData.firmId;

    // Verify firm exists
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('id, firm_name, status')
      .eq('id', firmId)
      .single();

    if (firmError || !firm) {
      toast.error('Selected firm not found');
      throw new Error('The selected instructing firm does not exist. Please select a valid firm.');
    }

    if (firm.status !== 'active') {
      toast.error('Selected firm is inactive');
      throw new Error(`The firm "${firm.firm_name}" is inactive and cannot be assigned to new matters.`);
    }

    // Only include fields that exist in the database
    const matterData: any = {
      advocate_id: user.id,
      firm_id: firmId, // Required: Link to instructing firm
      title: formData.title,
      description: formData.description,
      matter_type: formData.matterType || formData.matter_type,
      client_name: formData.clientName || formData.client_name,
      client_email: formData.clientEmail || formData.client_email,
      client_phone: formData.clientPhone || formData.client_phone,
      instructing_attorney: formData.instructingAttorney || formData.instructing_attorney,
      instructing_firm: formData.instructingFirm || formData.instructing_firm || firm.firm_name,
      status: 'active'
    };

    // Add optional fields only if they have values
    if (formData.courtCaseNumber) {
      matterData.court_case_number = formData.courtCaseNumber;
    }
    if (formData.clientAddress || formData.client_address) {
      matterData.client_address = formData.clientAddress || formData.client_address;
    }
    if (formData.instructingAttorneyEmail || formData.instructing_attorney_email) {
      matterData.instructing_attorney_email = formData.instructingAttorneyEmail || formData.instructing_attorney_email;
    }
    if (formData.instructingAttorneyPhone || formData.instructing_attorney_phone) {
      matterData.instructing_attorney_phone = formData.instructingAttorneyPhone || formData.instructing_attorney_phone;
    }
    if (formData.estimatedFee || formData.estimated_fee) {
      matterData.estimated_fee = formData.estimatedFee || formData.estimated_fee;
    }

    const result = await this.create(matterData);
    
    // If services are provided and matter was created successfully, associate them
    if (result.data && formData.services && formData.services.length > 0) {
      try {
        const matterServices = formData.services.map(serviceId => ({
          matter_id: result.data!.id,
          service_id: serviceId
        }));

        const { error: servicesError } = await supabase
          .from('matter_services')
          .insert(matterServices);

        if (servicesError) {
          console.error('Error adding services to matter:', servicesError);
          toast.error('Matter created but failed to associate services');
        } else {
          toast.success(`Matter created with ${formData.services.length} service(s) associated`);
        }
      } catch (serviceError) {
        console.error('Error associating services:', serviceError);
        toast.error('Matter created but failed to associate services');
      }
    }
    
    return result;
  }

  /**
   * Update matter status
   */
  async updateStatus(
    matterId: string, 
    status: MatterStatus,
    metadata?: {
      date_settled?: string;
      date_closed?: string;
      actual_fee?: number;
    }
  ): Promise<ApiResponse<Matter>> {
    const updateData: Partial<Matter> = {
      status,
      ...metadata
    };

    return this.update(matterId, updateData);
  }

  /**
   * Accept Brief (Path B: Quick Start)
   * Accepts a matter request immediately without pro forma
   * Sets status to ACTIVE
   */
  async acceptBrief(matterId: string): Promise<ApiResponse<Matter>> {
    const updateData: Partial<Matter> = {
      status: 'active' as MatterStatus
    };

    // TODO: Send notification to attorney about acceptance
    // TODO: Log activity in audit trail
    
    return this.update(matterId, updateData);
  }

  /**
   * Update WIP value
   */
  async updateWipValue(matterId: string, wipValue: number): Promise<ApiResponse<Matter>> {
    return this.update(matterId, { wip_value: wipValue });
  }

  /**
   * Update settlement probability
   */
  async updateSettlementProbability(
    matterId: string, 
    probability: number
  ): Promise<ApiResponse<Matter>> {
    return this.update(matterId, { settlement_probability: probability });
  }

  /**
   * Search matters by text
   */
  async searchMatters(options: MatterSearchOptions): Promise<ApiResponse<Matter[]>> {
    const searchColumns = [
      'title',
      'description',
      'client_name',
      'matter_type',
      'court_case_number',
      'instructing_attorney',
      'instructing_firm'
    ];

    return this.search(options.query, searchColumns, {
      filters: options.filters,
      pagination: options.pagination
    });
  }

  /**
   * Get matter statistics for advocate
   */
  async getStats(advocateId: string): Promise<ApiResponse<MatterStats>> {
    const requestId = this.generateRequestId();

    try {
      // Get all matters for advocate
      const mattersResponse = await this.getByAdvocate(advocateId);
      
      if (mattersResponse.error) {
        return { data: null, error: mattersResponse.error };
      }

      const matters = mattersResponse.data || [];

      // Calculate statistics
      const stats: MatterStats = {
        total: matters.length,
        active: matters.filter(m => m.status === 'active').length,
        pending: matters.filter(m => m.status === 'pending').length,
        settled: matters.filter(m => m.status === 'settled').length,
        closed: matters.filter(m => m.status === 'closed').length,
        overdue: matters.filter(m => m.is_overdue).length,
        totalWipValue: matters.reduce((sum, m) => sum + (m.wip_value || 0), 0),
        averageSettlementProbability: matters.length > 0 
          ? matters.reduce((sum, m) => sum + (m.settlement_probability || 0), 0) / matters.length
          : 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Get matters by status
   */
  async getByStatus(
    advocateId: string, 
    status: MatterStatus | MatterStatus[]
  ): Promise<ApiResponse<Matter[]>> {
    return this.getByAdvocate(advocateId, {
      filters: { status }
    });
  }

  /**
   * Get matters by risk level
   */
  async getByRiskLevel(
    advocateId: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<ApiResponse<Matter[]>> {
    return this.getByAdvocate(advocateId, {
      filters: { risk_level: riskLevel }
    });
  }

  /**
   * Get matters with upcoming deadlines
   */
  async getUpcomingDeadlines(
    advocateId: string,
    days: number = 30
  ): Promise<ApiResponse<Matter[]>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.getByAdvocate(advocateId, {
      filters: {
        status: ['active', 'pending'],
        expected_completion_to: futureDate.toISOString().split('T')[0]
      }
    });
  }

  /**
   * Perform conflict check
   */
  async performConflictCheck(
    advocateId: string,
    clientName: string,
    opposingParties: string[] = []
  ): Promise<ApiResponse<{
    hasConflict: boolean;
    conflictingMatters: Matter[];
    conflictReason?: string;
  }>> {
    const requestId = this.generateRequestId();

    try {
      // Get all matters for advocate
      const mattersResponse = await this.getByAdvocate(advocateId);
      
      if (mattersResponse.error) {
        return { data: null, error: mattersResponse.error };
      }

      const matters = mattersResponse.data || [];
      const conflictingMatters: Matter[] = [];
      let conflictReason: string | undefined;

      // Check if advocate has represented opposing parties
      for (const party of opposingParties) {
        const conflicts = matters.filter(matter => 
          matter.client_name.toLowerCase().includes(party.toLowerCase())
        );
        
        if (conflicts.length > 0) {
          conflictingMatters.push(...conflicts);
          conflictReason = 'Previously represented opposing party';
        }
      }

      // Check if advocate has matters against this client
      const clientConflicts = matters.filter(matter =>
        matter.description?.toLowerCase().includes(clientName.toLowerCase()) &&
        matter.client_name.toLowerCase() !== clientName.toLowerCase()
      );

      if (clientConflicts.length > 0) {
        conflictingMatters.push(...clientConflicts);
        conflictReason = conflictReason || 'Potential conflict with existing matter';
      }

      return {
        data: {
          hasConflict: conflictingMatters.length > 0,
          conflictingMatters: [...new Set(conflictingMatters)], // Remove duplicates
          conflictReason
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Mark conflict check as completed
   */
  async completeConflictCheck(
    matterId: string,
    cleared: boolean,
    notes?: string
  ): Promise<ApiResponse<Matter>> {
    return this.update(matterId, {
      conflict_check_completed: true,
      conflict_check_cleared: cleared,
      conflict_check_date: new Date().toISOString(),
      conflict_notes: notes
    });
  }

  /**
   * Add tags to matter
   */
  async addTags(matterId: string, tags: string[]): Promise<ApiResponse<Matter>> {
    const matterResponse = await this.getById(matterId);
    
    if (matterResponse.error) {
      return { data: null, error: matterResponse.error };
    }

    const matter = matterResponse.data;
    if (!matter) {
      return { data: null, error: matterResponse.error };
    }

    const existingTags = matter.tags || [];
    const newTags = [...new Set([...existingTags, ...tags])];

    return this.update(matterId, { tags: newTags });
  }

  /**
   * Remove tags from matter
   */
  async removeTags(matterId: string, tags: string[]): Promise<ApiResponse<Matter>> {
    const matterResponse = await this.getById(matterId);
    
    if (matterResponse.error) {
      return { data: null, error: matterResponse.error };
    }

    const matter = matterResponse.data;
    if (!matter) {
      return { data: null, error: matterResponse.error };
    }

    const existingTags = matter.tags || [];
    const updatedTags = existingTags.filter(tag => !tags.includes(tag));

    return this.update(matterId, { tags: updatedTags });
  }

  /**
   * Generate unique reference number
   */
  async generateReferenceNumber(
    advocateInitials: string,
    year: number = new Date().getFullYear()
  ): Promise<string> {
    // Get count of matters for this year
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const countResponse = await this.count({
      date_instructed_from: yearStart,
      date_instructed_to: yearEnd
    });

    const count = (countResponse.data || 0) + 1;
    const paddedCount = count.toString().padStart(3, '0');
    
    return `${advocateInitials}${year}${paddedCount}`;
  }

  // Helper method to generate request ID (inherited from BaseApiService)
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Create matter request from attorney (invitation workflow)
   */
  async createMatterRequest(data: import('../../types/financial.types').MatterRequest): Promise<Matter> {
    // Get current user (attorney)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    // Get firm to find advocate_id
    const { data: firm, error: firmError } = await supabase
      .from('firms')
      .select('*')
      .eq('id', data.firm_id)
      .single();
    
    if (firmError || !firm) {
      toast.error('Firm not found');
      throw new Error('Firm not found');
    }
    
    // Get advocate_id from firm
    if (!firm.advocate_id) {
      toast.error('This firm is not associated with an advocate');
      throw new Error('Firm has no advocate assigned');
    }
    
    const advocate_id = firm.advocate_id;
    
    // Create matter with status 'new_request'
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .insert({
        advocate_id: advocate_id,
        firm_id: data.firm_id,
        title: data.title,
        description: data.description,
        matter_type: data.matter_type,
        urgency: data.urgency_level,
        status: 'new_request',
        client_name: user.user_metadata.attorney_name || 'Unknown',
        client_email: user.email,
        instructing_attorney: user.user_metadata.attorney_name || 'Unknown',
        instructing_firm: firm.firm_name
      })
      .select()
      .single();
    
    if (matterError) {
      console.error('Error creating matter request:', matterError);
      toast.error('Failed to submit matter request');
      throw matterError;
    }
    
    toast.success('Matter request submitted successfully');
    return matter as Matter;
  }

  /**
   * Quick add active matter (for phone/email accepted matters)
   */
  async createActiveMatter(data: {
    title: string;
    instructing_firm: string;
    instructing_attorney: string;
    instructing_attorney_email: string;
    instructing_attorney_phone?: string;
    client_name?: string;
    description: string;
    matter_type: string;
    urgency?: 'routine' | 'standard' | 'urgent' | 'emergency';
  }): Promise<Matter> {
    // Get current user (advocate)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    // Create matter with status 'active' immediately
    const { data: matter, error: matterError } = await supabase
      .from('matters')
      .insert({
        advocate_id: user.id,
        title: data.title,
        description: data.description,
        matter_type: data.matter_type,
        urgency: data.urgency || 'standard',
        status: 'active', // ← Key difference from createMatterRequest
        client_name: data.client_name || data.instructing_attorney,
        client_email: data.instructing_attorney_email,
        instructing_attorney: data.instructing_attorney,
        instructing_attorney_email: data.instructing_attorney_email,
        instructing_attorney_phone: data.instructing_attorney_phone,
        instructing_firm: data.instructing_firm
      })
      .select()
      .single();
    
    if (matterError) {
      console.error('Error creating active matter:', matterError);
      toast.error('Failed to create matter');
      throw matterError;
    }
    
    toast.success('Matter created and activated successfully!');
    return matter as Matter;
  }
}

// Export singleton instance
export const matterApiService = new MatterApiService();
