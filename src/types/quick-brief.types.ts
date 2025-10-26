/**
 * Quick Brief Capture Types
 * Types for the Quick Brief Capture feature including templates and form data
 */

export type TemplateCategory = 
  | 'matter_title'
  | 'work_type'
  | 'practice_area'
  | 'urgency_preset'
  | 'issue_template';

export interface TemplateItem {
  id: string;
  advocate_id: string;
  category: TemplateCategory;
  value: string;
  usage_count: number;
  last_used_at: string | null;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvocateTemplates {
  matter_titles: TemplateItem[];
  work_types: TemplateItem[];
  practice_areas: TemplateItem[];
  urgency_presets: TemplateItem[];
  issue_templates: TemplateItem[];
}

export type UrgencyLevel = 
  | 'same_day'
  | '1-2_days'
  | 'within_week'
  | 'within_2_weeks'
  | 'within_month'
  | 'custom';

export interface QuickBriefMatterData {
  // Step 1: Attorney & Firm
  firm_id?: string;
  firm_name: string;
  attorney_id?: string;
  attorney_name: string;
  attorney_email: string;
  attorney_phone?: string;
  
  // Step 2: Matter Title
  title: string;
  
  // Step 3: Type of Work
  work_type: string;
  
  // Step 4: Practice Area
  practice_area: string;
  
  // Step 5: Urgency & Deadline
  urgency_level: UrgencyLevel;
  deadline_date: string;
  
  // Step 6: Brief Summary
  brief_summary?: string;
  issue_template?: string;
  
  // Optional: Reference Materials
  reference_links?: string[];
}

export interface QuickBriefFormState {
  currentStep: number;
  totalSteps: number;
  formData: Partial<QuickBriefMatterData>;
  templates: Partial<AdvocateTemplates>;
  errors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface TemplateExport {
  matter_title?: TemplateItem[];
  work_type?: TemplateItem[];
  practice_area?: TemplateItem[];
  urgency_preset?: TemplateItem[];
  issue_template?: TemplateItem[];
  exported_at: string;
  advocate_id: string;
}

export interface TemplateImportResult {
  imported: number;
  skipped: number;
  errors?: string[];
}
