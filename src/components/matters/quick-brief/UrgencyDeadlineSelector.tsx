/**
 * UrgencyDeadlineSelector Component (Step 5)
 * Select urgency level and deadline for the brief
 */

import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { FormInput } from '../../ui/FormInput';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import type { QuickBriefMatterData, UrgencyLevel } from '../../../types/quick-brief.types';
import type { QuickBriefTemplate } from '../../../services/api/quick-brief-template.service';
import { toast } from 'react-hot-toast';
import { format, addDays, addWeeks, addMonths, startOfDay, isAfter } from 'date-fns';

export interface UrgencyDeadlineSelectorProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

// Map urgency presets to deadline calculation
const urgencyToDeadline: Record<string, () => Date> = {
  'Same Day': () => addDays(new Date(), 0),
  '1-2 Days': () => addDays(new Date(), 2),
  'Within a Week': () => addWeeks(new Date(), 1),
  'Within 2 Weeks': () => addWeeks(new Date(), 2),
  'Within a Month': () => addMonths(new Date(), 1)
};

export const UrgencyDeadlineSelector: React.FC<UrgencyDeadlineSelectorProps> = ({
  formData,
  onChange,
  advocateId
}) => {
  const [templates, setTemplates] = useState<QuickBriefTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [advocateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await quickBriefTemplateService.getTemplatesByCategory(
        advocateId,
        'urgency_preset'
      );

      if (response.error) {
        console.error('Error loading templates:', response.error);
        toast.error('Failed to load urgency templates');
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

  const calculateDeadline = (urgencyPreset: string): string => {
    if (urgencyToDeadline[urgencyPreset]) {
      return format(urgencyToDeadline[urgencyPreset](), 'yyyy-MM-dd');
    }
    return format(addWeeks(new Date(), 1), 'yyyy-MM-dd');
  };

  const handleSelect = async (value: string) => {
    if (value === 'Custom Date') {
      setShowCustomDate(true);
      return;
    }

    const deadline = calculateDeadline(value);
    onChange({
      urgency_level: value.toLowerCase().replace(/\s+/g, '_') as UrgencyLevel,
      deadline_date: deadline
    });

    await quickBriefTemplateService.upsertTemplate(advocateId, 'urgency_preset', value);
    setShowCustomDate(false);
  };

  const handleCustomDateChange = (date: string) => {
    setCustomDate(date);
    
    // Validate that date is in the future
    const selectedDate = new Date(date);
    const today = startOfDay(new Date());
    
    if (!isAfter(selectedDate, today) && selectedDate.getTime() !== today.getTime()) {
      toast.error('Deadline must be today or in the future');
      return;
    }

    onChange({
      urgency_level: 'custom' as UrgencyLevel,
      deadline_date: date
    });
  };

  const handleCustomAdd = async (value: string) => {
    const result = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      'urgency_preset',
      value
    );

    if (result.error) {
      toast.error('Failed to save template');
      return;
    }

    await loadTemplates();
    toast.success('Urgency preset saved to your templates');
  };

  const convertToTemplateItems = (templates: QuickBriefTemplate[]) => {
    return templates.map(t => ({
      ...t,
      advocate_id: t.advocate_id || ''
    }));
  };

  // Add custom date option
  const optionsWithCustom = [
    ...convertToTemplateItems(templates),
    {
      id: 'custom-date',
      advocate_id: '',
      category: 'urgency_preset' as const,
      value: 'Custom Date',
      usage_count: 0,
      last_used_at: null,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
          <Clock className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            How urgent is this matter?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select urgency level to calculate the deadline
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-neutral-500">
          Loading urgency options...
        </div>
      ) : (
        <AnswerButtonGrid
          options={optionsWithCustom}
          selectedValue={
            formData.urgency_level === 'custom' 
              ? 'Custom Date' 
              : templates.find(t => t.value.toLowerCase().replace(/\s+/g, '_') === formData.urgency_level)?.value
          }
          onSelect={handleSelect}
          onAddCustom={handleCustomAdd}
          maxColumns={2}
          showUsageIndicator={true}
          allowCustom={true}
        />
      )}

      {/* Custom date picker */}
      {showCustomDate && (
        <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <FormInput
            label="Select Custom Deadline Date"
            type="date"
            value={customDate}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            required
          />
        </div>
      )}

      {/* Display calculated deadline */}
      {formData.deadline_date && (
        <div className="p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400" />
            <div>
              <p className="text-sm font-medium text-judicial-blue-900 dark:text-judicial-blue-100">
                Deadline Date
              </p>
              <p className="text-lg font-semibold text-judicial-blue-600 dark:text-judicial-blue-400">
                {format(new Date(formData.deadline_date), 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrgencyDeadlineSelector;
