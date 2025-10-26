/**
 * PracticeAreaSelector Component (Step 4)
 * Select practice area from templates
 */

import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import type { QuickBriefMatterData } from '../../../types/quick-brief.types';
import type { QuickBriefTemplate } from '../../../services/api/quick-brief-template.service';
import { toast } from 'react-hot-toast';

export interface PracticeAreaSelectorProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

export const PracticeAreaSelector: React.FC<PracticeAreaSelectorProps> = ({
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
        'practice_area'
      );

      if (response.error) {
        console.error('Error loading templates:', response.error);
        toast.error('Failed to load practice area templates');
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
    onChange({ practice_area: value });
    await quickBriefTemplateService.upsertTemplate(advocateId, 'practice_area', value);
  };

  const handleCustomAdd = async (value: string) => {
    const result = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      'practice_area',
      value
    );

    if (result.error) {
      toast.error('Failed to save template');
      return;
    }

    await loadTemplates();
    toast.success('Practice area saved to your templates');
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
          <Scale className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            What's the practice area?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select the relevant area of law
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">
          Loading practice areas...
        </div>
      ) : (
        <AnswerButtonGrid
          options={convertToTemplateItems(templates)}
          selectedValue={formData.practice_area}
          onSelect={handleSelect}
          onAddCustom={handleCustomAdd}
          maxColumns={3}
          showUsageIndicator={true}
          allowCustom={true}
        />
      )}

      {formData.practice_area && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Selected: <strong>{formData.practice_area}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default PracticeAreaSelector;
