import { BaseApiService } from "./api/base-api.service";

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
  matter_types: string[];
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

export interface UpdateRateCardRequest extends Partial<CreateRateCardRequest> {
  is_active?: boolean;
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

export interface ProFormaEstimate {
  line_items: ProFormaLineItem[];
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  estimated_total_hours: number;
  matter_type?: string;
}

class RateCardService extends BaseApiService<RateCard> {
  constructor() {
    super('rate_cards');
  }

  /**
   * Get all rate cards for the current advocate
   */
  async getRateCards(filters?: {
    service_category?: ServiceCategory;
    matter_type?: string;
    is_active?: boolean;
  }): Promise<RateCard[]> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    if (userError || !user?.id) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('advocate_id', user.id)
      .order('service_category', { ascending: true })
      .order('service_name', { ascending: true });

    if (filters?.service_category) {
      query = query.eq('service_category', filters.service_category);
    }

    if (filters?.matter_type) {
      query = query.eq('matter_type', filters.matter_type);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rate cards:', error);
      throw new Error(`Failed to fetch rate cards: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get standard service templates
   */
  async getStandardServiceTemplates(filters?: {
    service_category?: ServiceCategory;
    matter_type?: string;
    bar_association?: string;
  }): Promise<StandardServiceTemplate[]> {
    let query = this.supabase
      .from('standard_service_templates')
      .select('*')
      .order('service_category', { ascending: true })
      .order('template_name', { ascending: true });

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

    if (error) {
      console.error('Error fetching standard service templates:', error);
      throw new Error(`Failed to fetch standard service templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new rate card
   */
  async createRateCard(rateCardData: CreateRateCardRequest): Promise<RateCard> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    if (userError || !user?.id) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    // Add advocate_id to the rate card data
    const rateCardWithAdvocate = {
      ...rateCardData,
      advocate_id: user.id
    };

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert([rateCardWithAdvocate])
      .select()
      .single();

    if (error) {
      console.error('Error creating rate card:', error);
      throw new Error(`Failed to create rate card: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing rate card
   */
  async updateRateCard(id: string, updates: UpdateRateCardRequest): Promise<RateCard> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    if (userError || !user?.id) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .eq('advocate_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating rate card:', error);
      throw new Error(`Failed to update rate card: ${error.message}`);
    }

    return data;
  }

  /**
   * Create rate card from template
   */
  async createFromTemplate(templateId: string, overrides?: Partial<CreateRateCardRequest>): Promise<RateCard> {
    // Get the template
    const { data: template, error: templateError } = await this.supabase
      .from('standard_service_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Create rate card from template
    const rateCardData: CreateRateCardRequest = {
      service_name: template.template_name,
      service_description: template.template_description || undefined,
      service_category: template.service_category,
      pricing_type: template.default_fixed_fee ? 'fixed' : 'hourly',
      hourly_rate: template.default_hourly_rate || undefined,
      fixed_fee: template.default_fixed_fee || undefined,
      estimated_hours_min: template.estimated_hours || undefined,
      estimated_hours_max: template.estimated_hours || undefined,
      ...overrides
    };

    return this.createRateCard(rateCardData);
  }

  /**
   * Generate pro forma estimate based on matter type and selected services
   */
  async generateProFormaEstimate(
    matterType: string,
    selectedServices?: string[],
    advocateHourlyRate?: number
  ): Promise<ProFormaEstimate> {
    // Get advocate's rate cards
    const rateCards = await this.getRateCards({ 
      is_active: true,
      matter_type: matterType 
    });

    // Get standard templates if no custom rate cards
    let servicesToInclude: (RateCard | StandardServiceTemplate)[] = rateCards;
    
    if (rateCards.length === 0) {
      const templates = await this.getStandardServiceTemplates({ 
        matter_type: matterType 
      });
      servicesToInclude = templates;
    }

    // Filter by selected services if provided
    if (selectedServices && selectedServices.length > 0) {
      servicesToInclude = servicesToInclude.filter(service => 
        selectedServices.includes('template_name' in service ? service.template_name : service.service_name)
      );
    }

    // If no specific services selected, include default consultation and research
    if (!selectedServices || selectedServices.length === 0) {
      const defaultCategories: ServiceCategory[] = ['consultation', 'research'];
      servicesToInclude = servicesToInclude.filter(service => 
        defaultCategories.includes(service.service_category)
      );
    }

    const lineItems: ProFormaLineItem[] = [];
    let totalHours = 0;

    for (const service of servicesToInclude) {
      const isTemplate = 'template_name' in service;
      const serviceName = isTemplate ? service.template_name : service.service_name;
      const description = isTemplate ? service.template_description : service.service_description;
      
      let unitPrice = 0;
      let estimatedHours = 0;

      if (isTemplate) {
        // Use template defaults
        unitPrice = service.default_fixed_fee || (service.default_hourly_rate || advocateHourlyRate || 2500);
        estimatedHours = service.estimated_hours || 1;
      } else {
        // Use rate card
        if (service.pricing_type === 'fixed' && service.fixed_fee) {
          unitPrice = service.fixed_fee;
        } else if (service.hourly_rate) {
          unitPrice = service.hourly_rate;
        } else {
          unitPrice = advocateHourlyRate || 2500;
        }
        estimatedHours = service.estimated_hours_min || 1;
      }

      // For hourly services, calculate total based on estimated hours
      const quantity = service.service_category === 'court_appearance' ? 1 : estimatedHours;
      const totalAmount = service.service_category === 'court_appearance' || 
                         (service as RateCard).pricing_type === 'fixed' 
                         ? unitPrice 
                         : unitPrice * estimatedHours;

      lineItems.push({
        service_name: serviceName,
        description: description || `${serviceName} services`,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        service_category: service.service_category,
        estimated_hours: estimatedHours
      });

      totalHours += estimatedHours;
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
    const vatAmount = subtotal * 0.15; // 15% VAT
    const totalAmount = subtotal + vatAmount;

    return {
      line_items: lineItems,
      subtotal,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      estimated_total_hours: totalHours,
      matter_type: matterType
    };
  }

  /**
   * Get service categories with counts
   */
  async getServiceCategorySummary(): Promise<Array<{
    category: ServiceCategory;
    count: number;
    avg_hourly_rate?: number;
  }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('service_category, hourly_rate')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching service category summary:', error);
      throw new Error(`Failed to fetch service category summary: ${error.message}`);
    }

    // Group by category and calculate averages
    const summary = new Map<ServiceCategory, { count: number; rates: number[] }>();
    
    data?.forEach(item => {
      const category = item.service_category as ServiceCategory;
      if (!summary.has(category)) {
        summary.set(category, { count: 0, rates: [] });
      }
      
      const categoryData = summary.get(category)!;
      categoryData.count++;
      
      if (item.hourly_rate) {
        categoryData.rates.push(item.hourly_rate);
      }
    });

    return Array.from(summary.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      avg_hourly_rate: data.rates.length > 0 
        ? data.rates.reduce((sum, rate) => sum + rate, 0) / data.rates.length 
        : undefined
    }));
  }

  /**
   * Delete a rate card (with authentication)
   */
  async delete(id: string): Promise<void> {
    // Get current user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    
    if (userError || !user?.id) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('advocate_id', user.id);

    if (error) {
      console.error('Error deleting rate card:', error);
      throw new Error(`Failed to delete rate card: ${error.message}`);
    }
  }
}

export const rateCardService = new RateCardService();