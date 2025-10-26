/**
 * Quick Brief Template Service
 * Manages advocate-specific templates for Quick Brief Capture feature
 * Handles template CRUD, usage tracking, and import/export functionality
 */

import { BaseApiService, type ApiResponse } from './base-api.service';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export type TemplateCategory = 
  | 'matter_title'
  | 'work_type'
  | 'practice_area'
  | 'urgency_preset'
  | 'issue_template';

export interface QuickBriefTemplate {
  id: string;
  advocate_id: string | null;
  category: TemplateCategory;
  value: string;
  usage_count: number;
  last_used_at: string | null;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateExportData {
  version: string;
  exported_at: string;
  templates: QuickBriefTemplate[];
}

export interface TemplateImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Quick Brief Template Service
 * Extends BaseApiService for consistent error handling
 */
export class QuickBriefTemplateService extends BaseApiService<QuickBriefTemplate> {
  constructor() {
    super('advocate_quick_templates', '*');
  }

  /**
   * Get templates by category for the current advocate
   * Merges system defaults with custom templates
   * Sorts by usage count (most used first)
   */
  async getTemplatesByCategory(
    advocateId: string,
    category: TemplateCategory
  ): Promise<ApiResponse<QuickBriefTemplate[]>> {
    const requestId = this.generateRequestId();

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(this.selectFields)
        .or(`advocate_id.eq.${advocateId},advocate_id.is.null`)
        .eq('category', category)
        .order('usage_count', { ascending: false })
        .order('value', { ascending: true });

      if (error) {
        return {
          data: null,
          error: this.transformError(error, requestId)
        };
      }

      return {
        data: data as QuickBriefTemplate[],
        error: null,
        count: data?.length
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Upsert a template (add new or increment usage count for existing)
   * Used when advocate selects a template during Quick Brief Capture
   */
  async upsertTemplate(
    advocateId: string,
    category: TemplateCategory,
    value: string
  ): Promise<ApiResponse<QuickBriefTemplate>> {
    const requestId = this.generateRequestId();

    try {
      // Check if template already exists for this advocate
      const { data: existing, error: selectError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('category', category)
        .eq('value', value)
        .maybeSingle();

      if (selectError) {
        return {
          data: null,
          error: this.transformError(selectError, requestId)
        };
      }

      if (existing) {
        // Update existing template: increment usage count and update last_used_at
        const { data: updated, error: updateError } = await supabase
          .from(this.tableName)
          .update({
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          return {
            data: null,
            error: this.transformError(updateError, requestId)
          };
        }

        return {
          data: updated as QuickBriefTemplate,
          error: null
        };
      } else {
        // Create new custom template
        const { data: created, error: insertError } = await supabase
          .from(this.tableName)
          .insert({
            advocate_id: advocateId,
            category,
            value,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
            is_custom: true
          })
          .select()
          .single();

        if (insertError) {
          return {
            data: null,
            error: this.transformError(insertError, requestId)
          };
        }

        return {
          data: created as QuickBriefTemplate,
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
   * Delete a custom template
   * Only allows deletion of custom templates (not system defaults)
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    const requestId = this.generateRequestId();

    try {
      // Verify it's a custom template before deleting
      const { data: template, error: selectError } = await supabase
        .from(this.tableName)
        .select('is_custom')
        .eq('id', templateId)
        .single();

      if (selectError) {
        return {
          data: null,
          error: this.transformError(selectError, requestId)
        };
      }

      if (!template.is_custom) {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as const,
            message: 'Cannot delete system default templates',
            timestamp: new Date(),
            requestId
          }
        };
      }

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

      toast.success('Template deleted successfully');
      return {
        data: null,
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
   * Export all custom templates for an advocate to JSON
   * Excludes system defaults (advocate_id is null)
   */
  async exportTemplates(advocateId: string): Promise<ApiResponse<TemplateExportData>> {
    const requestId = this.generateRequestId();

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('is_custom', true)
        .order('category', { ascending: true })
        .order('value', { ascending: true });

      if (error) {
        return {
          data: null,
          error: this.transformError(error, requestId)
        };
      }

      const exportData: TemplateExportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        templates: data as QuickBriefTemplate[]
      };

      return {
        data: exportData,
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
   * Import templates from JSON file
   * Validates structure and merges with existing templates
   * Handles conflicts by keeping existing templates (no overwrite)
   */
  async importTemplates(
    advocateId: string,
    importData: TemplateExportData
  ): Promise<ApiResponse<TemplateImportResult>> {
    const requestId = this.generateRequestId();
    const result: TemplateImportResult = {
      imported: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Validate import data structure
      if (!importData.version || !importData.templates || !Array.isArray(importData.templates)) {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as const,
            message: 'Invalid import data structure',
            timestamp: new Date(),
            requestId
          }
        };
      }

      // Validate version compatibility (currently only v1.0)
      if (importData.version !== '1.0') {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as const,
            message: `Unsupported import version: ${importData.version}`,
            timestamp: new Date(),
            requestId
          }
        };
      }

      // Get existing templates for conflict detection
      const { data: existingTemplates } = await supabase
        .from(this.tableName)
        .select('category, value')
        .eq('advocate_id', advocateId);

      const existingSet = new Set(
        existingTemplates?.map(t => `${t.category}:${t.value}`) || []
      );

      // Process each template
      for (const template of importData.templates) {
        try {
          // Validate required fields
          if (!template.category || !template.value) {
            result.errors.push(`Skipped invalid template: ${JSON.stringify(template)}`);
            result.skipped++;
            continue;
          }

          // Check for conflicts
          const key = `${template.category}:${template.value}`;
          if (existingSet.has(key)) {
            result.skipped++;
            continue;
          }

          // Insert new template
          const { error: insertError } = await supabase
            .from(this.tableName)
            .insert({
              advocate_id: advocateId,
              category: template.category,
              value: template.value,
              usage_count: 0,
              is_custom: true
            });

          if (insertError) {
            result.errors.push(`Failed to import "${template.value}": ${insertError.message}`);
            result.skipped++;
          } else {
            result.imported++;
          }
        } catch (error) {
          result.errors.push(`Error processing template: ${(error as Error).message}`);
          result.skipped++;
        }
      }

      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} template(s)`);
      }
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} duplicate/invalid template(s)`);
      }
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }

      return {
        data: result,
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
   * Get all templates for an advocate (for settings page)
   * Includes both custom and system defaults
   */
  async getAllTemplates(advocateId: string): Promise<ApiResponse<QuickBriefTemplate[]>> {
    const requestId = this.generateRequestId();

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`advocate_id.eq.${advocateId},advocate_id.is.null`)
        .order('category', { ascending: true })
        .order('usage_count', { ascending: false })
        .order('value', { ascending: true });

      if (error) {
        return {
          data: null,
          error: this.transformError(error, requestId)
        };
      }

      return {
        data: data as QuickBriefTemplate[],
        error: null,
        count: data?.length
      };
    } catch (error) {
      return {
        data: null,
        error: this.transformError(error as Error, requestId)
      };
    }
  }

  /**
   * Update a template's value
   * Only allows updating custom templates
   */
  async updateTemplate(
    templateId: string,
    value: string
  ): Promise<ApiResponse<QuickBriefTemplate>> {
    const requestId = this.generateRequestId();

    try {
      // Verify it's a custom template
      const { data: template, error: selectError } = await supabase
        .from(this.tableName)
        .select('is_custom')
        .eq('id', templateId)
        .single();

      if (selectError) {
        return {
          data: null,
          error: this.transformError(selectError, requestId)
        };
      }

      if (!template.is_custom) {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR' as const,
            message: 'Cannot edit system default templates',
            timestamp: new Date(),
            requestId
          }
        };
      }

      const { data: updated, error: updateError } = await supabase
        .from(this.tableName)
        .update({ value })
        .eq('id', templateId)
        .select()
        .single();

      if (updateError) {
        return {
          data: null,
          error: this.transformError(updateError, requestId)
        };
      }

      toast.success('Template updated successfully');
      return {
        data: updated as QuickBriefTemplate,
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
