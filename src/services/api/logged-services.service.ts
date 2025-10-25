import { supabase } from '@/lib/supabase';
import type { LoggedService, LoggedServiceCreate, LoggedServiceUpdate } from '@/types/financial.types';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Validation schemas
const LoggedServiceValidation = z.object({
  matter_id: z.string().uuid('Invalid matter ID'),
  service_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((date) => {
      const serviceDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return serviceDate <= today;
    }, 'Service date cannot be in the future'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  service_type: z.enum(['consultation', 'drafting', 'research', 'court_appearance', 'negotiation', 'review', 'other']),
  estimated_hours: z.number().positive().optional(),
  rate_card_id: z.string().uuid().optional(),
  unit_rate: z.number().positive('Unit rate must be positive'),
  quantity: z.number().positive('Quantity must be positive').default(1),
  is_estimate: z.boolean().optional(),
  pro_forma_id: z.string().uuid().optional(),
});

export class LoggedServicesService {
  /**
   * Create a new logged service
   */
  static async createService(data: LoggedServiceCreate): Promise<LoggedService> {
    try {
      // Validate input
      const validated = LoggedServiceValidation.parse(data);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Verify matter ownership
      const { data: matter, error: matterError } = await supabase
        .from('matters')
        .select('advocate_id, title')
        .eq('id', validated.matter_id)
        .single();

      if (matterError || !matter) {
        throw new Error('Matter not found');
      }

      if (matter.advocate_id !== user.id) {
        throw new Error('Unauthorized: You can only add services to your own matters');
      }
      
      const { data: service, error } = await supabase
        .from('logged_services')
        .insert({
          matter_id: validated.matter_id,
          advocate_id: user.id,
          service_date: validated.service_date,
          description: validated.description,
          service_type: validated.service_type,
          estimated_hours: validated.estimated_hours,
          rate_card_id: validated.rate_card_id,
          unit_rate: validated.unit_rate,
          quantity: validated.quantity || 1,
          is_estimate: validated.is_estimate || false,
          pro_forma_id: validated.pro_forma_id,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create service: ${error.message}`);
      }

      // Update matter WIP value if this is actual work (not estimate)
      if (!validated.is_estimate) {
        await this.updateMatterWIP(validated.matter_id);
      }
      
      toast.success('Service logged successfully');
      return service as LoggedService;
      
    } catch (error) {
      console.error('Error creating service:', error);
      const message = error instanceof Error ? error.message : 'Failed to create service';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Update a logged service
   */
  static async updateService(
    serviceId: string,
    updates: LoggedServiceUpdate
  ): Promise<LoggedService> {
    try {
      // Get current service
      const { data: currentService, error: fetchError } = await supabase
        .from('logged_services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (fetchError || !currentService) {
        throw new Error('Service not found');
      }

      // Check if already invoiced
      if (currentService.invoice_id) {
        throw new Error('Cannot update invoiced services');
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {};

      if (updates.service_date) updateData.service_date = updates.service_date;
      if (updates.description) updateData.description = updates.description;
      if (updates.service_type) updateData.service_type = updates.service_type;
      if (updates.estimated_hours !== undefined) updateData.estimated_hours = updates.estimated_hours;
      if (updates.rate_card_id !== undefined) updateData.rate_card_id = updates.rate_card_id;
      if (updates.unit_rate !== undefined) updateData.unit_rate = updates.unit_rate;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;

      const { data: updatedService, error } = await supabase
        .from('logged_services')
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update service: ${error.message}`);
      }

      // Update matter WIP value if this is actual work (not estimate)
      if (!currentService.is_estimate) {
        await this.updateMatterWIP(currentService.matter_id);
      }

      toast.success('Service updated successfully');
      return updatedService as LoggedService;

    } catch (error) {
      console.error('Error updating service:', error);
      const message = error instanceof Error ? error.message : 'Failed to update service';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get services by matter with optional filtering
   */
  static async getServicesByMatter(
    matterId: string,
    isEstimate?: boolean
  ): Promise<LoggedService[]> {
    try {
      let query = supabase
        .from('logged_services')
        .select('*')
        .eq('matter_id', matterId)
        .order('service_date', { ascending: false });

      // Filter by estimate/actual if specified
      if (isEstimate !== undefined) {
        query = query.eq('is_estimate', isEstimate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch services: ${error.message}`);
      }

      return (data || []) as LoggedService[];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Get services with filtering and pagination
   */
  static async getServices(options: {
    page?: number;
    pageSize?: number;
    matterId?: string;
    isEstimate?: boolean;
    invoiced?: boolean;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      pageSize = 50,
      matterId,
      isEstimate,
      invoiced,
      dateFrom,
      dateTo,
      sortBy = 'service_date',
      sortOrder = 'desc'
    } = options;
    
    try {
      let query = supabase
        .from('logged_services')
        .select(`
          *,
          matters!inner(title, client_name)
        `, { count: 'exact' });
      
      // Apply filters
      if (matterId) {
        query = query.eq('matter_id', matterId);
      }

      if (isEstimate !== undefined) {
        query = query.eq('is_estimate', isEstimate);
      }

      if (invoiced !== undefined) {
        if (invoiced) {
          query = query.not('invoice_id', 'is', null);
        } else {
          query = query.is('invoice_id', null);
        }
      }

      if (dateFrom) {
        query = query.gte('service_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('service_date', dateTo);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch services: ${error.message}`);
      }
      
      return {
        data: (data || []) as LoggedService[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
      
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
      throw error;
    }
  }

  /**
   * Delete a logged service
   */
  static async deleteService(serviceId: string): Promise<void> {
    try {
      // Get current service
      const { data: currentService, error: fetchError } = await supabase
        .from('logged_services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (fetchError || !currentService) {
        throw new Error('Service not found');
      }

      // Check if already invoiced
      if (currentService.invoice_id) {
        throw new Error('Cannot delete invoiced services');
      }

      // Delete the service
      const { error } = await supabase
        .from('logged_services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        throw new Error(`Failed to delete service: ${error.message}`);
      }

      // Update matter WIP value if this was actual work (not estimate)
      if (!currentService.is_estimate) {
        await this.updateMatterWIP(currentService.matter_id);
      }

      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete service';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Get unbilled services for a matter
   */
  static async getUnbilledServices(matterId: string): Promise<LoggedService[]> {
    try {
      const { data, error } = await supabase
        .from('logged_services')
        .select('*')
        .eq('matter_id', matterId)
        .eq('is_estimate', false)
        .is('invoice_id', null)
        .order('service_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch unbilled services: ${error.message}`);
      }

      return (data || []) as LoggedService[];
    } catch (error) {
      console.error('Error fetching unbilled services:', error);
      throw error;
    }
  }

  /**
   * Helper: Update matter WIP value
   */
  private static async updateMatterWIP(matterId: string): Promise<void> {
    try {
      // Calculate total unbilled services
      const { data: services, error: servicesError } = await supabase
        .from('logged_services')
        .select('amount')
        .eq('matter_id', matterId)
        .eq('is_estimate', false)
        .is('invoice_id', null);

      if (servicesError) {
        console.error('Error calculating services WIP:', servicesError);
        return;
      }

      const servicesWIP = services?.reduce((total, service) => total + (service.amount || 0), 0) || 0;

      // Calculate total unbilled time entries
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('amount')
        .eq('matter_id', matterId)
        .is('invoice_id', null);

      if (timeError) {
        console.error('Error calculating time WIP:', timeError);
        return;
      }

      const timeWIP = timeEntries?.reduce((total, entry) => total + (entry.amount || 0), 0) || 0;

      // Calculate total unbilled expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('matter_id', matterId)
        .is('invoice_id', null);

      if (expensesError) {
        console.error('Error calculating expenses WIP:', expensesError);
        return;
      }

      const expensesWIP = expenses?.reduce((total, expense) => total + (expense.amount || 0), 0) || 0;

      // Total WIP is sum of all three sources
      const totalWIP = servicesWIP + timeWIP + expensesWIP;

      // Update matter WIP value
      await supabase
        .from('matters')
        .update({ wip_value: totalWIP })
        .eq('id', matterId);

    } catch (error) {
      console.error('Error updating matter WIP:', error);
      // Don't throw - WIP update failure shouldn't break the main operation
    }
  }
}
