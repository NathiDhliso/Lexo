/**
 * Quick Brief Template Service
 * Handles CRUD operations for advocate quick brief templates
 */

import { BaseApiService, type ApiResponse } from './base-api.service';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import type { TemplateItem, TemplateCategory, TemplateExport, TemplateImportResult } from '../../types/quick-brief.types';

export class QuickBriefTemplateService extends BaseApiService<TemplateItem> {
  constructor() {
    super('advocate_quick_templates', '*');
  }

  /**
   * Get all templates for advocate by category, merged with system defaults
   * System templates are shown first (alphabetically), then custom templates (by usage count)
   */
  async getTemplatesByCategory(
    advocateId: string,
    category: TemplateCategory
  ): Promise<ApiResponse<TemplateItem[]>> {
    const requestId = this.generateRequestId();

    try {
      // Fetch advocate's custom templates
      const { data: customTemplates, error: customError } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('advocate_id', advocateId)
        .eq('category', category)
        .order('usage_count', { ascending: false });

      if (customError) {
        return {
          data: null,
          error: this.transformError(customError, requestId)
        };
      }

      // Fetch system defaults
      const { data: systemTemplates, error: systemError } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('advocate_id', 'system')
        .eq('category', category)
        .order('value', { ascending: true });

      if (systemError) {
        return {
          data: null,
          error: this.transformError(systemError, requestId)
        };
      }

      // Merge and deduplicate (custom templates take precedence)
      const customValues = new Set((customTemplates || []).map((t: any) => t.value.toLowerCase()));
      const uniqueSystemTemplates = (systemTemplates || []).filter(
        (t: any) => !customValues.has(t.value.toLowerCase())
      );

      // Combine: system templates first (alphabetically), then custom (by usage)
      const merged = [...uniqueSystemTemplates, ...(customTemplates || [])] as unknown as TemplateItem[];

      return {
        data: merged,
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
   * Get all templates for advocate across all categories
   */
  async getAllTemplates(advocateId: string): Promise<ApiResponse<Record<TemplateCategory, TemplateItem[]>>> {
    const categories: TemplateCategory[] = [
      'matter_title',
      'work_type',
      'practice_area',
      'urgency_preset',
      'issue_template'
    ];

    const requestId = this.generateRequestId();

    try {
      const result: Record<string, TemplateItem[]> = {};

      for (const category of categories) {
        const response = await this.getTemplatesByCategory(advocateId, category);
        if (response.error) {
          return {
            data: null,
            error: response.error
          };
        }
        result[category] = response.data || [];
      }

      return {
        data: result as Record<TemplateCategory, TemplateItem[]>,
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
   * Add or update template (upsert with usage count increment)
   */
  async upsertTemplate(
    advocateId: string,
    category: TemplateCategory,
    value: string
  ): Promise<ApiResponse<TemplateItem>> {
    const requestId = this.generateRequestId();

    try {
      // Check if template already exists
      const { data: existing, error: fetchError } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('advocate_id', advocateId)
        .eq('category', category)
        .eq('value', value)
        .maybeSingle();

      if (fetchError) {
        return {
          data: null,
          error: this.transformError(fetchError, requestId)
        };
      }

      if (existing) {
        // Increment usage count
        const { data: updated, error: updateError } = await supabase
          .from(this.tableName)
          .update({
            usage_count: (existing as unknown as TemplateItem).usage_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', (existing as unknown as TemplateItem).id)
          .select(this.selectFields)
          .single();

        if (updateError) {
          return {
            data: null,
            error: this.transformError(updateError, requestId)
          };
        }

        return {
          data: updated as unknown as TemplateItem,
          error: null
        };
      } else {
        // Create new template
        const { data: created, error: createError } = await supabase
          .from(this.tableName)
          .insert({
            advocate_id: advocateId,
            category,
            value,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
            is_custom: true
          })
          .select(this.selectFields)
          .single();

        if (createError) {
          return {
            data: null,
            error: this.transformError(createError, requestId)
          };
        }

        return {
          data: created as unknown as TemplateItem,
          error: null
        };
      }
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Update template (alias for upsertTemplate for backwards compatibility)
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateItem>
  ): Promise<ApiResponse<TemplateItem>> {
    const requestId = this.generateRequestId();

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', templateId)
        .select(this.selectFields)
        .single();

      if (error) {
        return {
          data: null,
          error: this.transformError(error, requestId)
        };
      }

      return {
        data: data as unknown as TemplateItem,
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
   * Delete custom template (system templates cannot be deleted)
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    const requestId = this.generateRequestId();

    try {
      // Verify it's a custom template
      const { data: template, error: fetchError } = await supabase
        .from(this.tableName)
        .select('is_custom, advocate_id')
        .eq('id', templateId)
        .single();

      if (fetchError) {
        return {
          data: null,
          error: this.transformError(fetchError, requestId)
        };
      }

      if (!template.is_custom || template.advocate_id === 'system') {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: 'Cannot delete system templates',
            timestamp: new Date(),
            requestId
          }
        };
      }

      // Delete the template
      const { error: deleteError } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', templateId);

      if (deleteError) {
        return {
          data: null,
          error: this.transformError(deleteError, requestId)
        };
      }

      return {
        data: undefined as void,
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
   * Export templates to JSON
   */
  async exportTemplates(advocateId: string): Promise<string> {
    const categories: TemplateCategory[] = [
      'matter_title',
      'work_type',
      'practice_area',
      'urgency_preset',
      'issue_template'
    ];

    const exportData: TemplateExport = {
      exported_at: new Date().toISOString(),
      advocate_id: advocateId
    };

    for (const category of categories) {
      const response = await this.getTemplatesByCategory(advocateId, category);
      if (response.data) {
        // Only export custom templates
        exportData[category] = response.data.filter(t => t.is_custom);
      }
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import templates from JSON
   */
  async importTemplates(
    advocateId: string,
    jsonData: string
  ): Promise<ApiResponse<TemplateImportResult>> {
    const requestId = this.generateRequestId();

    try {
      const importData: TemplateExport = JSON.parse(jsonData);
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      const categories: TemplateCategory[] = [
        'matter_title',
        'work_type',
        'practice_area',
        'urgency_preset',
        'issue_template'
      ];

      for (const category of categories) {
        const templates = importData[category];
        if (!templates || !Array.isArray(templates)) continue;

        for (const template of templates) {
          try {
            await this.upsertTemplate(advocateId, category, template.value);
            imported++;
          } catch (error) {
            console.error(`Failed to import template: ${template.value}`, error);
            errors.push(`Failed to import "${template.value}": ${(error as Error).message}`);
            skipped++;
          }
        }
      }

      return {
        data: { imported, skipped, errors: errors.length > 0 ? errors : undefined },
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
   * Get most used templates across all categories
   */
  async getMostUsedTemplates(
    advocateId: string,
    limit: number = 10
  ): Promise<ApiResponse<TemplateItem[]>> {
    return this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('advocate_id', advocateId)
        .eq('is_custom', true)
        .order('usage_count', { ascending: false })
        .limit(limit);
    });
  }

  /**
   * Get recently used templates
   */
  async getRecentlyUsedTemplates(
    advocateId: string,
    limit: number = 10
  ): Promise<ApiResponse<TemplateItem[]>> {
    return this.executeQuery(async () => {
      return supabase
        .from(this.tableName)
        .select(this.selectFields)
        .eq('advocate_id', advocateId)
        .eq('is_custom', true)
        .not('last_used_at', 'is', null)
        .order('last_used_at', { ascending: false })
        .limit(limit);
    });
  }

  /**
   * Update template value
   */
  async updateTemplateValue(
    templateId: string,
    newValue: string
  ): Promise<ApiResponse<TemplateItem>> {
    const requestId = this.generateRequestId();

    try {
      // Verify it's a custom template
      const { data: template, error: fetchError } = await supabase
        .from(this.tableName)
        .select('is_custom, advocate_id')
        .eq('id', templateId)
        .single();

      if (fetchError) {
        return {
          data: null,
          error: this.transformError(fetchError, requestId)
        };
      }

      if (!template.is_custom || template.advocate_id === 'system') {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as any,
            message: 'Cannot edit system templates',
            timestamp: new Date(),
            requestId
          }
        };
      }

      // Update the template
      const { data: updated, error: updateError } = await supabase
        .from(this.tableName)
        .update({ value: newValue })
        .eq('id', templateId)
        .select(this.selectFields)
        .single();

      if (updateError) {
        return {
          data: null,
          error: this.transformError(updateError, requestId)
        };
      }

      return {
        data: updated as unknown as TemplateItem,
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
   * Batch update template usage (for when multiple templates are used in one operation)
   */
  async batchUpdateUsage(
    advocateId: string,
    updates: { category: TemplateCategory; value: string }[]
  ): Promise<ApiResponse<void>> {
    const requestId = this.generateRequestId();

    try {
      const promises = updates.map(({ category, value }) =>
        this.upsertTemplate(advocateId, category, value)
      );

      await Promise.all(promises);

      return {
        data: undefined as void,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }
}

// Export singleton instance
export const quickBriefTemplateService = new QuickBriefTemplateService();

// Export type alias for backwards compatibility
export type QuickBriefTemplate = TemplateItem;
