/**
 * Rate Card Service - Full implementation with database integration
 */

import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface RateCard {
  id: string;
  advocate_id: string;
  service_name: string;
  service_description?: string;
  service_category: ServiceCategory;
  matter_type?: string;
  pricing_type: PricingType;
  hourly_rate?: number;
  fixed_fee?: number;
  minimum_fee?: number;
  maximum_fee?: number;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
  is_default: boolean;
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface StandardServiceTemplate {
  id: string;
  template_name: string;
  template_description?: string;
  service_category: ServiceCategory;
  matter_types?: string[];
  default_hourly_rate?: number;
  default_fixed_fee?: number;
  estimated_hours?: number;
  is_system_template: boolean;
  bar_association?: string;
  created_at: string;
  updated_at: string;
}

export type ServiceCategory = 
  | 'consultation' 
  | 'research' 
  | 'drafting' 
  | 'court_appearance' 
  | 'negotiation'
  | 'document_review' 
  | 'correspondence' 
  | 'filing' 
  | 'travel' 
  | 'other';

export type PricingType = 'hourly' | 'fixed' | 'per_item' | 'percentage';

export interface CreateRateCardRequest {
  service_name: string;
  service_description?: string;
  service_category: ServiceCategory;
  matter_type?: string;
  pricing_type: PricingType;
  hourly_rate?: number;
  fixed_fee?: number;
  minimum_fee?: number;
  maximum_fee?: number;
  estimated_hours_min?: number;
  estimated_hours_max?: number;
  is_default?: boolean;
  requires_approval?: boolean;
}

export interface ProFormaEstimate {
  line_items: ProFormaLineItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  estimated_hours: number;
}

export interface ProFormaLineItem {
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  service_category: ServiceCategory;
  estimated_hours?: number;
}

export interface RateCardFilters {
  service_category?: ServiceCategory;
  matter_type?: string;
  pricing_type?: PricingType;
  is_active?: boolean;
  is_default?: boolean;
}

class RateCardService {
  /**
   * Get rate cards for the current advocate with optional filters
   */
  async getRateCards(filters?: RateCardFilters): Promise<RateCard[]> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user found');
        return [];
      }

      let query = supabase
        .from('rate_cards')
        .select('*')
        .eq('advocate_id', user.id) // ✅ CRITICAL: Only load current advocate's rate cards
        .order('service_name');

      // Apply filters
      if (filters?.service_category) {
        query = query.eq('service_category', filters.service_category);
      }
      if (filters?.matter_type) {
        query = query.eq('matter_type', filters.matter_type);
      }
      if (filters?.pricing_type) {
        query = query.eq('pricing_type', filters.pricing_type);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.is_default !== undefined) {
        query = query.eq('is_default', filters.is_default);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rate cards:', error);
      toast.error('Failed to load rate cards');
      return [];
    }
  }

  /**
   * Get standard service templates with optional filters
   */
  async getStandardServiceTemplates(filters?: { 
    service_category?: ServiceCategory;
    matter_type?: string;
    bar_association?: string;
  }): Promise<StandardServiceTemplate[]> {
    try {
      let query = supabase
        .from('standard_service_templates')
        .select('*')
        .order('template_name');

      if (filters?.service_category) {
        query = query.eq('service_category', filters.service_category);
      }
      if (filters?.matter_type) {
        query = query.contains('matter_types', [filters.matter_type]);
      }
      if (filters?.bar_association) {
        query = query.or(`bar_association.eq.${filters.bar_association},bar_association.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service templates:', error);
      toast.error('Failed to load service templates');
      return [];
    }
  }

  /**
   * Create a new rate card
   */
  async createRateCard(request: CreateRateCardRequest): Promise<RateCard> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('rate_cards')
        .insert({
          advocate_id: user.user.id,
          ...request,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Rate card created successfully');
      return data;
    } catch (error) {
      console.error('Error creating rate card:', error);
      const message = error instanceof Error ? error.message : 'Failed to create rate card';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Create rate card from template
   */
  async createFromTemplate(templateId: string): Promise<RateCard> {
    try {
      const template = await this.getTemplateById(templateId);
      if (!template) throw new Error('Template not found');

      const rateCardData: CreateRateCardRequest = {
        service_name: template.template_name,
        service_description: template.template_description,
        service_category: template.service_category,
        pricing_type: template.default_hourly_rate ? 'hourly' : 'fixed',
        hourly_rate: template.default_hourly_rate,
        fixed_fee: template.default_fixed_fee,
        estimated_hours_min: template.estimated_hours,
        estimated_hours_max: template.estimated_hours,
        is_default: false,
        requires_approval: false
      };

      return await this.createRateCard(rateCardData);
    } catch (error) {
      console.error('Error creating rate card from template:', error);
      throw error;
    }
  }

  /**
   * Update an existing rate card
   */
  async updateRateCard(id: string, updates: Partial<CreateRateCardRequest>): Promise<RateCard> {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Rate card updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating rate card:', error);
      const message = error instanceof Error ? error.message : 'Failed to update rate card';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Delete a rate card
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rate card deleted successfully');
    } catch (error) {
      console.error('Error deleting rate card:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete rate card';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Generate pro forma estimate based on matter type and selected services
   */
  async generateProFormaEstimate(
    matterType: string,
    selectedServices?: string[],
    fallbackHourlyRate: number = 2500
  ): Promise<ProFormaEstimate> {
    try {
      // Get relevant rate cards for the matter type
      const rateCards = await this.getRateCards({ 
        is_active: true,
        matter_type: matterType 
      });

      // If no specific rate cards, get general ones
      const generalCards = rateCards.length === 0 
        ? await this.getRateCards({ is_active: true })
        : rateCards;

      // TODO: Load service categories from user's rate cards instead of hardcoded defaults
      const defaultCategories: ServiceCategory[] = [];

      const lineItems: ProFormaLineItem[] = [];
      let totalHours = 0;

      for (const category of defaultCategories) {
        // Find rate card for this category
        const rateCard = generalCards.find(card => 
          card.service_category === category && 
          (!selectedServices || selectedServices.includes(card.id))
        );

        if (rateCard) {
          const hours = rateCard.estimated_hours_min || 1;
          const rate = rateCard.hourly_rate || rateCard.fixed_fee || fallbackHourlyRate;
          const amount = rateCard.pricing_type === 'hourly' ? rate * hours : rate;

          lineItems.push({
            service_name: rateCard.service_name,
            description: rateCard.service_description || `${category.replace('_', ' ')} services`,
            quantity: rateCard.pricing_type === 'hourly' ? hours : 1,
            unit_price: rate,
            total_amount: amount,
            service_category: category,
            estimated_hours: hours
          });

          totalHours += hours;
        } else {
          // Fallback for missing rate cards
          const hours = this.getDefaultHours(category);
          const amount = fallbackHourlyRate * hours;

          lineItems.push({
            service_name: this.getDefaultServiceName(category),
            description: `${category.replace('_', ' ')} services`,
            quantity: hours,
            unit_price: fallbackHourlyRate,
            total_amount: amount,
            service_category: category,
            estimated_hours: hours
          });

          totalHours += hours;
        }
      }

      const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
      const vatAmount = subtotal * 0.15;
      const totalAmount = subtotal + vatAmount;

      return {
        line_items: lineItems,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        estimated_hours: totalHours
      };
    } catch (error) {
      console.error('Error generating pro forma estimate:', error);
      throw error;
    }
  }

  /**
   * Get rate cards by service category
   */
  async getRateCardsByCategory(category: ServiceCategory): Promise<RateCard[]> {
    return this.getRateCards({ service_category: category, is_active: true });
  }

  /**
   * Get default rate card for a service category
   */
  async getDefaultRateCard(category: ServiceCategory): Promise<RateCard | null> {
    try {
      const { data, error } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('service_category', category)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching default rate card:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private async getTemplateById(id: string): Promise<StandardServiceTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('standard_service_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  private getDefaultHours(category: ServiceCategory): number {
    const defaultHours: Record<ServiceCategory, number> = {
      consultation: 1,
      research: 3,
      drafting: 4,
      court_appearance: 4,
      negotiation: 2,
      document_review: 2,
      correspondence: 0.5,
      filing: 1,
      travel: 2,
      other: 1
    };
    return defaultHours[category] || 1;
  }

  private getDefaultServiceName(category: ServiceCategory): string {
    const defaultNames: Record<ServiceCategory, string> = {
      consultation: 'Legal Consultation',
      research: 'Legal Research',
      drafting: 'Document Drafting',
      court_appearance: 'Court Appearance',
      negotiation: 'Negotiation Services',
      document_review: 'Document Review',
      correspondence: 'Legal Correspondence',
      filing: 'Court Filing',
      travel: 'Travel Time',
      other: 'Other Legal Services'
    };
    return defaultNames[category] || 'Legal Services';
  }
}

export const rateCardService = new RateCardService();
