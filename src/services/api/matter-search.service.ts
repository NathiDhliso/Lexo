/**
 * Matter Search Service
 * Handles matter search, filtering, archiving, and export operations
 */

import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { Matter, MatterStatus } from '@/types';

export interface MatterSearchParams {
  query?: string;
  include_archived?: boolean;
  practice_area?: string;
  matter_type?: string;
  status?: MatterStatus[];
  date_from?: string;
  date_to?: string;
  attorney_firm?: string;
  fee_min?: number;
  fee_max?: number;
  sort_by?: 'deadline' | 'created_at' | 'total_fee' | 'wip' | 'last_activity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface MatterSearchResult {
  matters: Matter[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ArchivedMatter {
  id: string;
  reference_number: string;
  title: string;
  client_name: string;
  instructing_firm: string;
  matter_type: string;
  status: MatterStatus;
  archived_at: string;
  archive_reason?: string;
}

export class MatterSearchService {
  /**
   * Search matters with comprehensive filtering
   */
  async search(
    advocateId: string,
    params: MatterSearchParams = {}
  ): Promise<MatterSearchResult> {
    try {
      const {
        query,
        include_archived = false,
        practice_area,
        matter_type,
        status,
        date_from,
        date_to,
        attorney_firm,
        fee_min,
        fee_max,
        sort_by = 'created_at',
        sort_order = 'desc',
        page = 1,
        page_size = 50
      } = params;

      const offset = (page - 1) * page_size;

      // Call the database search function
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_matters', {
          p_advocate_id: advocateId,
          p_search_query: query || null,
          p_include_archived: include_archived,
          p_practice_area: practice_area || null,
          p_matter_type: matter_type || null,
          p_status: status || null,
          p_date_from: date_from || null,
          p_date_to: date_to || null,
          p_attorney_firm: attorney_firm || null,
          p_fee_min: fee_min || null,
          p_fee_max: fee_max || null,
          p_sort_by: sort_by,
          p_sort_order: sort_order,
          p_limit: page_size,
          p_offset: offset
        });

      if (searchError) {
        console.error('Error searching matters:', searchError);
        toast.error('Failed to search matters');
        throw searchError;
      }

      // Get total count
      const { data: totalCount, error: countError } = await supabase
        .rpc('count_search_matters', {
          p_advocate_id: advocateId,
          p_search_query: query || null,
          p_include_archived: include_archived,
          p_practice_area: practice_area || null,
          p_matter_type: matter_type || null,
          p_status: status || null,
          p_date_from: date_from || null,
          p_date_to: date_to || null,
          p_attorney_firm: attorney_firm || null,
          p_fee_min: fee_min || null,
          p_fee_max: fee_max || null
        });

      if (countError) {
        console.error('Error counting search results:', countError);
      }

      const total = totalCount || 0;
      const totalPages = Math.ceil(total / page_size);

      return {
        matters: (searchResults || []) as Matter[],
        total_count: total,
        page,
        page_size,
        total_pages: totalPages
      };
    } catch (error) {
      console.error('Error in matter search:', error);
      toast.error('An error occurred while searching matters');
      throw error;
    }
  }

  /**
   * Archive a matter with audit trail
   */
  async archiveMatter(
    matterId: string,
    advocateId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('archive_matter', {
          p_matter_id: matterId,
          p_advocate_id: advocateId,
          p_reason: reason || null
        });

      if (error) {
        console.error('Error archiving matter:', error);
        toast.error('Failed to archive matter');
        return false;
      }

      if (data) {
        toast.success('Matter archived successfully');
        return true;
      } else {
        toast.error('Matter not found or already archived');
        return false;
      }
    } catch (error) {
      console.error('Error in archiveMatter:', error);
      toast.error('An error occurred while archiving the matter');
      return false;
    }
  }

  /**
   * Unarchive a matter
   */
  async unarchiveMatter(
    matterId: string,
    advocateId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('unarchive_matter', {
          p_matter_id: matterId,
          p_advocate_id: advocateId
        });

      if (error) {
        console.error('Error unarchiving matter:', error);
        toast.error('Failed to unarchive matter');
        return false;
      }

      if (data) {
        toast.success('Matter unarchived successfully');
        return true;
      } else {
        toast.error('Matter not found or not archived');
        return false;
      }
    } catch (error) {
      console.error('Error in unarchiveMatter:', error);
      toast.error('An error occurred while unarchiving the matter');
      return false;
    }
  }

  /**
   * Get all archived matters
   */
  async getArchivedMatters(
    advocateId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{
    matters: ArchivedMatter[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    try {
      const offset = (page - 1) * pageSize;

      const { data: archivedMatters, error } = await supabase
        .rpc('get_archived_matters', {
          p_advocate_id: advocateId,
          p_limit: pageSize,
          p_offset: offset
        });

      if (error) {
        console.error('Error fetching archived matters:', error);
        toast.error('Failed to fetch archived matters');
        throw error;
      }

      // Get total count of archived matters
      const { count, error: countError } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('advocate_id', advocateId)
        .eq('is_archived', true);

      if (countError) {
        console.error('Error counting archived matters:', countError);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        matters: (archivedMatters || []) as ArchivedMatter[],
        total_count: total,
        page,
        page_size: pageSize,
        total_pages: totalPages
      };
    } catch (error) {
      console.error('Error in getArchivedMatters:', error);
      toast.error('An error occurred while fetching archived matters');
      throw error;
    }
  }

  /**
   * Export matters to CSV
   */
  async exportToCSV(
    advocateId: string,
    params: MatterSearchParams = {}
  ): Promise<string> {
    try {
      // Get all matching matters (no pagination for export)
      const searchParams = { ...params, page_size: 10000 };
      const result = await this.search(advocateId, searchParams);

      // Create CSV header
      const headers = [
        'Reference Number',
        'Title',
        'Client Name',
        'Instructing Attorney',
        'Instructing Firm',
        'Matter Type',
        'Status',
        'WIP Value',
        'Estimated Fee',
        'Expected Completion',
        'Created At',
        'Archived'
      ];

      // Create CSV rows
      const rows = result.matters.map(matter => [
        matter.reference_number || '',
        matter.title || '',
        matter.client_name || '',
        matter.instructing_attorney || '',
        matter.instructing_firm || '',
        matter.matter_type || '',
        matter.status || '',
        matter.wip_value?.toString() || '0',
        matter.estimated_fee?.toString() || '',
        matter.expected_completion_date || '',
        new Date(matter.created_at).toLocaleDateString(),
        matter.is_archived ? 'Yes' : 'No'
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting matters to CSV:', error);
      toast.error('Failed to export matters');
      throw error;
    }
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent: string, filename: string = 'matters-export.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export downloaded successfully');
  }

  /**
   * Get unique values for filter dropdowns
   */
  async getFilterOptions(advocateId: string): Promise<{
    practice_areas: string[];
    matter_types: string[];
    attorney_firms: string[];
    statuses: MatterStatus[];
  }> {
    try {
      const { data: matters, error } = await supabase
        .from('matters')
        .select('matter_type, instructing_firm, status')
        .eq('advocate_id', advocateId)
        .eq('is_archived', false);

      if (error) {
        console.error('Error fetching filter options:', error);
        throw error;
      }

      // Extract unique values
      const practiceAreas = [...new Set(matters?.map(m => m.matter_type).filter(Boolean))] as string[];
      const matterTypes = [...new Set(matters?.map(m => m.matter_type).filter(Boolean))] as string[];
      const attorneyFirms = [...new Set(matters?.map(m => m.instructing_firm).filter(Boolean))] as string[];
      const statuses = [...new Set(matters?.map(m => m.status).filter(Boolean))] as MatterStatus[];

      return {
        practice_areas: practiceAreas.sort(),
        matter_types: matterTypes.sort(),
        attorney_firms: attorneyFirms.sort(),
        statuses: statuses.sort()
      };
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      return {
        practice_areas: [],
        matter_types: [],
        attorney_firms: [],
        statuses: []
      };
    }
  }
}

// Export singleton instance
export const matterSearchService = new MatterSearchService();
