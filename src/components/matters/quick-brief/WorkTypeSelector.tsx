/**
 * WorkTypeSelector Component (Step 3)
 * Select type of work from templates
 */

import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import type { QuickBriefMatterData } from '../../../types/quick-brief.types';
import type { QuickBriefTemplate } from '../../../services/api/quick-brief-template.service';
import { toast } from 'react-hot-toast';

export interface WorkTypeSelectorProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

export const WorkTypeSelector: React.FC<WorkTypeSelectorProps> = ({
  formData,
  onChange,
  advocateId
}) => {
  const [templates, setTemplates] = useState<QuickBriefTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [advocateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await quickBriefTemplateService.getTemplatesByCategory(
        advocateId,
        'work_type'
      );

      if (response.error) {
        console.error('Error loading templates:', response.error);
        toast.error('Failed to load work type templates');
        return;
      }

      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (value: string) => {
    onChange({ work_type: value });
    await quickBriefTemplateService.upsertTemplate(advocateId, 'work_type', value);
  };

  const handleCustomAdd = async (value: string) => {
    const result = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      'work_type',
      value
    );

    if (result.error) {
      toast.error('Failed to save template');
      return;
    }

    await loadTemplates();
    toast.success('Work type saved to your templates');
  };

  const convertToTemplateItems = (templates: QuickBriefTemplate[]) => {
    return templates.map(t => ({
      ...t,
      advocate_id: t.advocate_id || ''
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            What type of work is required?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select the type of work you'll be doing
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">
          Loading work types...
        </div>
      ) : (
        <AnswerButtonGrid
          options={convertToTemplateItems(templates)}
          selectedValue={formData.work_type}
          onSelect={handleSelect}
          onAddCustom={handleCustomAdd}
          maxColumns={3}
          showUsageIndicator={true}
          allowCustom={true}
        />
      )}

      {formData.work_type && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Selected: <strong>{formData.work_type}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkTypeSelector;
