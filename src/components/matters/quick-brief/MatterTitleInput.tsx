/**
 * MatterTitleInput Component (Step 2)
 * Select or create matter title with template support
 */

import React, { useState, useEffect } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { FormInput } from '../../ui/FormInput';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import type { QuickBriefMatterData } from '../../../types/quick-brief.types';
import type { QuickBriefTemplate } from '../../../services/api/quick-brief-template.service';
import { toast } from 'react-hot-toast';

export interface MatterTitleInputProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

export const MatterTitleInput: React.FC<MatterTitleInputProps> = ({
  formData,
  onChange,
  advocateId
}) => {
  const [templates, setTemplates] = useState<QuickBriefTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [customTitle, setCustomTitle] = useState(formData.title || '');

  useEffect(() => {
    loadTemplates();
  }, [advocateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await quickBriefTemplateService.getTemplatesByCategory(
        advocateId,
        'matter_title'
      );

      if (response.error) {
        console.error('Error loading templates:', response.error);
        toast.error('Failed to load matter title templates');
        return;
      }

      // Sort by usage (most used first), then show 5 most recent
      const sorted = response.data?.sort((a, b) => {
        if (a.usage_count !== b.usage_count) {
          return b.usage_count - a.usage_count;
        }
        return new Date(b.last_used_at || b.created_at).getTime() - 
               new Date(a.last_used_at || a.created_at).getTime();
      }).slice(0, 10) || [];

      setTemplates(sorted);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (value: string) => {
    setCustomTitle(value);
    onChange({ title: value });

    // Track usage
    await quickBriefTemplateService.upsertTemplate(advocateId, 'matter_title', value);
  };

  const handleCustomAdd = async (value: string) => {
    const result = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      'matter_title',
      value
    );

    if (result.error) {
      toast.error('Failed to save template');
      return;
    }

    await loadTemplates();
    toast.success('Template saved for future use');
  };

  const handleTitleChange = (value: string) => {
    setCustomTitle(value);
    onChange({ title: value });
  };

  const replacePlaceholders = (template: string): string => {
    let result = template;
    
    if (formData.firm_name) {
      result = result.replace(/\[Client Name\]/gi, formData.firm_name);
    }
    if (formData.attorney_name) {
      result = result.replace(/\[Attorney\]/gi, formData.attorney_name);
    }
    
    return result;
  };

  const convertToTemplateItems = (templates: QuickBriefTemplate[]) => {
    return templates.map(t => ({
      ...t,
      advocate_id: t.advocate_id || ''
    }));
  };

  const isValid = customTitle.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
          <FileText className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            What's the matter about?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Enter a descriptive title or select from your templates
          </p>
        </div>
      </div>

      {/* Template buttons */}
      {!loading && templates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Sparkles className="w-4 h-4 text-mpondo-gold-500" />
            <span>Your Frequently Used Titles</span>
          </div>

          <AnswerButtonGrid
            options={convertToTemplateItems(templates)}
            selectedValue={customTitle}
            onSelect={(value) => {
              const processed = replacePlaceholders(value);
              handleTemplateSelect(processed);
            }}
            onAddCustom={handleCustomAdd}
            maxColumns={2}
            showUsageIndicator={true}
            allowCustom={false}
          />
        </div>
      )}

      {/* Custom title input */}
      <div className="space-y-2">
        <FormInput
          label="Matter Title"
          value={customTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g., Contract Dispute - ABC Corporation"
          required
          helperText="Enter a clear, descriptive title for this matter"
        />

        {customTitle && !templates.find(t => t.value === customTitle) && (
          <button
            onClick={() => handleCustomAdd(customTitle)}
            className="text-sm text-mpondo-gold-600 dark:text-mpondo-gold-400 hover:underline"
          >
            💾 Save this as a template for future use
          </button>
        )}
      </div>

      {/* Validation indicator */}
      {isValid && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Title looks good
          </p>
        </div>
      )}
    </div>
  );
};

export default MatterTitleInput;
