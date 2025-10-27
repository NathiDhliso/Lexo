/**
 * Brief Fee Template Service
 * Requirements: 11.1, 11.2, 11.3
 * Purpose: CRUD operations for brief fee templates
 */

import { supabase } from '../../lib/supabase';
import { toastService } from '../toast.service';

export interface TemplateIncludedService {
  name: string;
  hours: number;
  rate: number;
  amount?: number; // Auto-calculated
}

export interface BriefFeeTemplate {
  id: string;
  advocate_id: string;
  template_name: string;
  case_type: string;
  description?: string;
  is_default: boolean;
  base_fee: number;
  hourly_rate?: number;
  estimated_hours?: number;
  included_services: TemplateIncludedService[];
  payment_terms?: string;
  cancellation_policy?: string;
  additional_notes?: string;
  times_used: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateRequest {
  template_name: string;
  case_type: string;
  description?: string;
  base_fee: number;
  hourly_rate?: number;
  estimated_hours?: number;
  included_services: TemplateIncludedService[];
  payment_terms?: string;
  cancellation_policy?: string;
  additional_notes?: string;
  is_default?: boolean;
}

export interface TemplateStats {
  template_id: string;
  template_name: string;
  case_type: string;
  base_fee: number;
  times_used: number;
  last_used_at?: string;
  is_default: boolean;
  matter_count: number;
  total_estimated_value: number;
  avg_matter_value: number;
}

export class BriefFeeTemplateService {
  /**
   * Get all templates for current user
   */
  static async getTemplates(): Promise<BriefFeeTemplate[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brief_fee_templates')
        .select('*')
        .eq('advocate_id', user.id)
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('times_used', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toastService.error('Failed to load templates');
      return [];
    }
  }

  /**
   * Get templates by case type
   */
  static async getTemplatesByCaseType(caseType: string): Promise<BriefFeeTemplate[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brief_fee_templates')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('case_type', caseType)
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('times_used', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching templates by case type:', error);
      return [];
    }
  }

  /**
   * Get default template for a case type
   */
  static async getDefaultTemplate(caseType: string): Promise<BriefFeeTemplate | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brief_fee_templates')
        .select('*')
        .eq('advocate_id', user.id)
        .eq('case_type', caseType)
        .eq('is_default', true)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
      return data;
    } catch (error: any) {
      console.error('Error fetching default template:', error);
      return null;
    }
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplateById(templateId: string): Promise<BriefFeeTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('brief_fee_templates')
        .select('*')
        .eq('id', templateId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  /**
   * Create a new template
   */
  static async createTemplate(request: CreateTemplateRequest): Promise<BriefFeeTemplate | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      // Calculate total from services
      const servicesWithAmounts = request.included_services.map(service => ({
        ...service,
        amount: service.hours * service.rate
      }));

      const { data, error } = await supabase
        .from('brief_fee_templates')
        .insert({
          advocate_id: user.id,
          template_name: request.template_name,
          case_type: request.case_type,
          description: request.description,
          base_fee: request.base_fee,
          hourly_rate: request.hourly_rate,
          estimated_hours: request.estimated_hours,
          included_services: servicesWithAmounts,
          payment_terms: request.payment_terms,
          cancellation_policy: request.cancellation_policy,
          additional_notes: request.additional_notes,
          is_default: request.is_default || false
        })
        .select()
        .single();

      if (error) throw error;

      // If this is a default template, unset others
      if (request.is_default && data) {
        await this.setDefaultTemplate(data.id, request.case_type);
      }

      toastService.success('Template created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toastService.error(error.message || 'Failed to create template');
      return null;
    }
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<CreateTemplateRequest>
  ): Promise<BriefFeeTemplate | null> {
    try {
      // Calculate amounts if services provided
      if (updates.included_services) {
        updates.included_services = updates.included_services.map(service => ({
          ...service,
          amount: service.hours * service.rate
        }));
      }

      const { data, error } = await supabase
        .from('brief_fee_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // If setting as default, unset others
      if (updates.is_default && data) {
        await this.setDefaultTemplate(data.id, data.case_type);
      }

      toastService.success('Template updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toastService.error('Failed to update template');
      return null;
    }
  }

  /**
   * Delete a template (soft delete)
   */
  static async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('brief_fee_templates')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', templateId);

      if (error) throw error;

      toastService.success('Template deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toastService.error('Failed to delete template');
      return false;
    }
  }

  /**
   * Set a template as the default for its case type
   */
  static async setDefaultTemplate(templateId: string, caseType: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('set_default_template', {
        p_template_id: templateId,
        p_advocate_id: user.id,
        p_case_type: caseType
      });

      if (error) throw error;

      toastService.success('Default template set');
      return true;
    } catch (error: any) {
      console.error('Error setting default template:', error);
      toastService.error('Failed to set default template');
      return false;
    }
  }

  /**
   * Duplicate a template
   */
  static async duplicateTemplate(templateId: string, newName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('duplicate_template', {
        p_template_id: templateId,
        p_new_name: newName
      });

      if (error) throw error;

      toastService.success(`Template "${newName}" created`);
      return data;
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toastService.error('Failed to duplicate template');
      return null;
    }
  }

  /**
   * Get template usage statistics
   */
  static async getTemplateStats(): Promise<TemplateStats[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brief_fee_template_stats')
        .select('*')
        .eq('advocate_id', user.id)
        .order('times_used', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching template stats:', error);
      return [];
    }
  }

  /**
   * Get popular case types (for suggestions)
   */
  static getCaseTypes(): string[] {
    return [
      'Motion',
      'Appeal',
      'Trial',
      'Consultation',
      'Opinion',
      'Heads of Argument',
      'Bail Application',
      'Divorce',
      'Contract Review',
      'Litigation',
      'Arbitration',
      'Other'
    ];
  }
}

export const briefFeeTemplateService = new BriefFeeTemplateService();
