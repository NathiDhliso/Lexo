/**
 * BriefSummaryEditor Component (Step 6)
 * Enter brief summary with issue templates and reference links
 */

import React, { useState, useEffect } from 'react';
import { FileText, Link as LinkIcon, Plus, X, Sparkles } from 'lucide-react';
import { FormInput } from '../../ui/FormInput';
import { Button } from '../../ui/Button';
import { AnswerButtonGrid } from './AnswerButtonGrid';
import { quickBriefTemplateService } from '../../../services/api/quick-brief-template.service';
import { cn } from '../../../lib/utils';
import type { QuickBriefMatterData } from '../../../types/quick-brief.types';
import type { QuickBriefTemplate } from '../../../services/api/quick-brief-template.service';
import { toast } from 'react-hot-toast';

export interface BriefSummaryEditorProps {
  formData: Partial<QuickBriefMatterData>;
  onChange: (data: Partial<QuickBriefMatterData>) => void;
  advocateId: string;
}

export const BriefSummaryEditor: React.FC<BriefSummaryEditorProps> = ({
  formData,
  onChange,
  advocateId
}) => {
  const [templates, setTemplates] = useState<QuickBriefTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(formData.brief_summary || '');
  const [referenceLinks, setReferenceLinks] = useState<string[]>(formData.reference_links || []);
  const [newLink, setNewLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [advocateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await quickBriefTemplateService.getTemplatesByCategory(
        advocateId,
        'issue_template'
      );

      if (response.error) {
        console.error('Error loading templates:', response.error);
        toast.error('Failed to load issue templates');
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

  const handleTemplateSelect = async (value: string) => {
    // Use template as starting point, user can edit
    setSummary(value);
    onChange({ 
      brief_summary: value,
      issue_template: value
    });

    await quickBriefTemplateService.upsertTemplate(advocateId, 'issue_template', value);
  };

  const handleCustomAdd = async (value: string) => {
    const result = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      'issue_template',
      value
    );

    if (result.error) {
      toast.error('Failed to save template');
      return;
    }

    await loadTemplates();
    toast.success('Issue template saved for future use');
  };

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    onChange({ brief_summary: value });
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    if (!newLink.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(newLink)) {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const updatedLinks = [...referenceLinks, newLink];
    setReferenceLinks(updatedLinks);
    onChange({ reference_links: updatedLinks });
    setNewLink('');
    setShowLinkInput(false);
    toast.success('Reference link added');
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = referenceLinks.filter((_, i) => i !== index);
    setReferenceLinks(updatedLinks);
    onChange({ reference_links: updatedLinks });
  };

  const convertToTemplateItems = (templates: QuickBriefTemplate[]) => {
    return templates.map(t => ({
      ...t,
      advocate_id: t.advocate_id || ''
    }));
  };

  const charCount = summary.length;
  const isValid = summary.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
          <FileText className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Describe the brief
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Provide a summary of what you need to do (optional but recommended)
          </p>
        </div>
      </div>

      {/* Issue template buttons */}
      {!loading && templates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Sparkles className="w-4 h-4 text-mpondo-gold-500" />
            <span>Start with an Issue Template</span>
          </div>

          <AnswerButtonGrid
            options={convertToTemplateItems(templates)}
            selectedValue={formData.issue_template}
            onSelect={handleTemplateSelect}
            onAddCustom={handleCustomAdd}
            maxColumns={2}
            showUsageIndicator={true}
            allowCustom={false}
          />
        </div>
      )}

      {/* Brief summary textarea */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Brief Summary
        </label>
        <textarea
          value={summary}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSummaryChange(e.target.value)}
          placeholder="Describe the key issues, facts, and what you need to address..."
          rows={6}
          className={cn(
            'w-full px-3 py-2.5',
            'border rounded-lg',
            'bg-white dark:bg-metallic-gray-800',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'border-neutral-300 dark:border-metallic-gray-600',
            'focus:border-mpondo-gold-500 focus:ring-mpondo-gold-500',
            'hover:border-neutral-400 dark:hover:border-metallic-gray-500',
            'resize-y'
          )}
        />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Provide as much detail as possible to help with case tracking and analysis
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">
            {charCount} characters
          </span>
          {!isValid && summary.length > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              ⚠️ Summary is too short
            </span>
          )}
        </div>

        {summary && !templates.find(t => t.value === summary) && (
          <button
            onClick={() => handleCustomAdd(summary)}
            className="text-sm text-mpondo-gold-600 dark:text-mpondo-gold-400 hover:underline"
          >
            💾 Save this as an issue template for future use
          </button>
        )}
      </div>

      {/* Reference links section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Reference Materials (Optional)
          </label>
          {!showLinkInput && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkInput(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Link
            </Button>
          )}
        </div>

        {/* Existing links */}
        {referenceLinks.length > 0 && (
          <div className="space-y-2">
            {referenceLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700"
              >
                <LinkIcon className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-judicial-blue-600 dark:text-judicial-blue-400 hover:underline truncate"
                >
                  {link}
                </a>
                <button
                  onClick={() => handleRemoveLink(index)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                  aria-label="Remove link"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new link input */}
        {showLinkInput && (
          <div className="p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Enter reference URL
            </label>
            <div className="flex gap-2">
              <FormInput
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setNewLink('');
                  }
                }}
                placeholder="https://example.com/document.pdf"
                type="url"
                className="flex-1"
                autoFocus
              />
              <Button
                variant="primary"
                onClick={handleAddLink}
                disabled={!newLink.trim()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowLinkInput(false);
                  setNewLink('');
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Add links to relevant documents, case law, or other reference materials
            </p>
          </div>
        )}
      </div>

      {/* Validation warning */}
      {!summary && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ <strong>No summary provided.</strong> While optional, adding a brief summary helps with matter tracking and organization.
          </p>
        </div>
      )}
    </div>
  );
};

export default BriefSummaryEditor;
