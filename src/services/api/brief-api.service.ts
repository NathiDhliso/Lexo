import { BaseApiService, type ApiResponse, type FilterOptions, type PaginationOptions } from './base-api.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { Brief, BriefStatus, BriefType, BriefFilters, BriefStats } from '../../types';

export interface BriefSearchOptions {
  query: string;
  filters?: BriefFilters;
  pagination?: PaginationOptions;
}

export class BriefApiService extends BaseApiService<Brief> {
  constructor() {
    super('briefs', `
      *,
      matter:matters!matter_id(id, title, client_name),
      advocate:advocates!advocate_id(full_name, practice_number)
    `);
  }

  async getByMatter(
    matterId: string,
    options: {
      filters?: Omit<BriefFilters, 'matter_id'>;
      pagination?: PaginationOptions;
    } = {}
  ): Promise<ApiResponse<Brief[]>> {
    const filters: BriefFilters = {
      ...options.filters,
      matter_id: matterId
    };

    return this.getAll({
      filters,
      pagination: options.pagination,
      sort: { column: 'date_received', ascending: false }
    });
  }

  async getByAdvocate(
    advocateId: string,
    options: {
      filters?: BriefFilters;
      pagination?: PaginationOptions;
    } = {}
  ): Promise<ApiResponse<Brief[]>> {
    return this.executeQuery(async () => {
      let query = supabase
        .from(this.tableName)
        .select(this.selectClause)
        .eq('advocate_id', advocateId);

      if (options.filters) {
        if (options.filters.status) {
          if (Array.isArray(options.filters.status)) {
            query = query.in('status', options.filters.status);
          } else {
            query = query.eq('status', options.filters.status);
          }
        }

        if (options.filters.brief_type) {
          if (Array.isArray(options.filters.brief_type)) {
            query = query.in('brief_type', options.filters.brief_type);
          } else {
            query = query.eq('brief_type', options.filters.brief_type);
          }
        }

        if (options.filters.priority) {
          query = query.in('priority', options.filters.priority);
        }

        if (options.filters.date_received_from) {
          query = query.gte('date_received', options.filters.date_received_from);
        }

        if (options.filters.date_received_to) {
          query = query.lte('date_received', options.filters.date_received_to);
        }

        if (options.filters.deadline_from) {
          query = query.gte('deadline', options.filters.deadline_from);
        }

        if (options.filters.deadline_to) {
          query = query.lte('deadline', options.filters.deadline_to);
        }

        if (options.filters.search) {
          query = query.or(`brief_title.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`);
        }
      }

      if (options.pagination) {
        const { page = 1, pageSize = 10 } = options.pagination;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      query = query.order('date_received', { ascending: false });

      return query;
    });
  }

  async getActiveBriefs(advocateId: string): Promise<ApiResponse<Brief[]>> {
    return this.getByAdvocate(advocateId, {
      filters: {
        status: ['active', 'pending'] as BriefStatus[]
      }
    });
  }

  async getOverdueBriefs(advocateId: string): Promise<ApiResponse<Brief[]>> {
    return this.executeQuery(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      return supabase
        .from(this.tableName)
        .select(this.selectClause)
        .eq('advocate_id', advocateId)
        .in('status', ['active', 'pending'])
        .lt('deadline', today)
        .order('deadline', { ascending: true });
    });
  }

  async updateStatus(
    briefId: string,
    status: BriefStatus,
    metadata?: {
      date_accepted?: string;
      date_completed?: string;
    }
  ): Promise<ApiResponse<Brief>> {
    const updateData: Partial<Brief> = {
      status,
      ...metadata
    };

    return this.update(briefId, updateData);
  }

  async searchBriefs(options: BriefSearchOptions): Promise<ApiResponse<Brief[]>> {
    const searchColumns = [
      'brief_title',
      'description',
      'brief_number'
    ];

    return this.search(options.query, searchColumns, {
      filters: options.filters,
      pagination: options.pagination
    });
  }

  async getStats(advocateId: string): Promise<ApiResponse<BriefStats>> {
    const requestId = this.generateRequestId();

    try {
      const briefsResponse = await this.getByAdvocate(advocateId);
      
      if (briefsResponse.error) {
        return { data: null, error: briefsResponse.error };
      }

      const briefs = briefsResponse.data || [];
      const today = new Date().toISOString().split('T')[0];

      const stats: BriefStats = {
        total: briefs.length,
        pending: briefs.filter(b => b.status === 'pending').length,
        active: briefs.filter(b => b.status === 'active').length,
        completed: briefs.filter(b => b.status === 'completed').length,
        cancelled: briefs.filter(b => b.status === 'cancelled').length,
        totalWipValue: briefs.reduce((sum, b) => sum + (b.wip_value || 0), 0),
        totalBilledAmount: briefs.reduce((sum, b) => sum + (b.billed_amount || 0), 0),
        overdueCount: briefs.filter(b => 
          (b.status === 'active' || b.status === 'pending') && 
          b.deadline && 
          b.deadline < today
        ).length
      };

      return { data: stats, error: null };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  async linkToProForma(briefId: string, proformaId: string): Promise<ApiResponse<Brief>> {
    return this.update(briefId, { source_proforma_id: proformaId });
  }

  async getBriefsByStatus(
    advocateId: string,
    status: BriefStatus | BriefStatus[]
  ): Promise<ApiResponse<Brief[]>> {
    return this.getByAdvocate(advocateId, {
      filters: { status }
    });
  }

  async getBriefsByType(
    advocateId: string,
    briefType: BriefType | BriefType[]
  ): Promise<ApiResponse<Brief[]>> {
    return this.getByAdvocate(advocateId, {
      filters: { brief_type: briefType }
    });
  }

  async getUpcomingDeadlines(
    advocateId: string,
    days: number = 30
  ): Promise<ApiResponse<Brief[]>> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .select(this.selectClause)
        .eq('advocate_id', advocateId)
        .in('status', ['active', 'pending'])
        .gte('deadline', today.toISOString().split('T')[0])
        .lte('deadline', futureDate.toISOString().split('T')[0])
        .order('deadline', { ascending: true });
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

export const briefApiService = new BriefApiService();
