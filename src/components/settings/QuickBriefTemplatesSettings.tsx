/**
 * QuickBriefTemplatesSettings Component
 * Manage Quick Brief templates with CRUD operations and import/export
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Star,
  AlertCircle,
  Check,
  X,
  Loader
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { quickBriefTemplateService, type QuickBriefTemplate, type TemplateCategory } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface QuickBriefTemplatesSettingsProps {
  advocateId: string;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  matter_title: 'Matter Titles',
  work_type: 'Work Types',
  practice_area: 'Practice Areas',
  urgency_preset: 'Urgency Presets',
  issue_template: 'Issue Templates'
};

const CATEGORY_ORDER: TemplateCategory[] = [
  'matter_title',
  'work_type',
  'practice_area',
  'urgency_preset',
  'issue_template'
];

export const QuickBriefTemplatesSettings: React.FC<QuickBriefTemplatesSettingsProps> = ({
  advocateId
}) => {
  const [templates, setTemplates] = useState<QuickBriefTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingCategory, setAddingCategory] = useState<TemplateCategory | null>(null);
  const [newTemplateValue, setNewTemplateValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [advocateId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await quickBriefTemplateService.getAllTemplates(advocateId);
      if (response.error) {
        toast.error('Failed to load templates');
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

  const groupedTemplates = () => {
    const grouped: Record<TemplateCategory, QuickBriefTemplate[]> = {
      matter_title: [],
      work_type: [],
      practice_area: [],
      urgency_preset: [],
      issue_template: []
    };

    templates.forEach(template => {
      if (grouped[template.category]) {
        grouped[template.category].push(template);
      }
    });

    // Sort each category by usage count (descending) then by value
    Object.keys(grouped).forEach(category => {
      grouped[category as TemplateCategory].sort((a, b) => {
        if (a.usage_count !== b.usage_count) {
          return b.usage_count - a.usage_count;
        }
        return a.value.localeCompare(b.value);
      });
    });

    return grouped;
  };

  const getTopThreeIds = (categoryTemplates: QuickBriefTemplate[]): string[] => {
    return categoryTemplates
      .filter(t => t.is_custom)
      .slice(0, 3)
      .map(t => t.id);
  };

  const handleStartEdit = (template: QuickBriefTemplate) => {
    setEditingId(template.id);
    setEditValue(template.value);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;

    const response = await quickBriefTemplateService.updateTemplate(editingId, editValue.trim());
    if (response.error) {
      toast.error('Failed to update template');
      return;
    }

    setEditingId(null);
    setEditValue('');
    await loadTemplates();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (templateId: string) => {
    setDeletingId(templateId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    const response = await quickBriefTemplateService.deleteTemplate(deletingId);
    if (response.error) {
      toast.error('Failed to delete template');
    }

    setDeletingId(null);
    await loadTemplates();
  };

  const handleStartAdd = (category: TemplateCategory) => {
    setAddingCategory(category);
    setNewTemplateValue('');
  };

  const handleSaveAdd = async () => {
    if (!addingCategory || !newTemplateValue.trim()) return;

    const response = await quickBriefTemplateService.upsertTemplate(
      advocateId,
      addingCategory,
      newTemplateValue.trim()
    );

    if (response.error) {
      toast.error('Failed to add template');
      return;
    }

    setAddingCategory(null);
    setNewTemplateValue('');
    await loadTemplates();
  };

  const handleExport = async () => {
    try {
      const response = await quickBriefTemplateService.exportTemplates(advocateId);
      if (response.error) {
        toast.error('Failed to export templates');
        return;
      }

      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quick-brief-templates-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Templates exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export templates');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      const response = await quickBriefTemplateService.importTemplates(advocateId, importData);
      if (response.error) {
        toast.error('Failed to import templates');
        return;
      }

      const result = response.data!;
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }

      await loadTemplates();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import templates. Please check the file format.');
    }

    // Reset file input
    event.target.value = '';
  };

  const grouped = groupedTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              My Quick Brief Templates
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage your custom templates for quick brief capture
            </p>
          </div>
        </div>

        {/* Import/Export Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="secondary" as="span">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </label>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">About Templates</p>
            <p>
              Templates marked with <Star className="w-3 h-3 inline text-mpondo-gold-500 fill-mpondo-gold-500" /> are
              your top 3 most frequently used. System defaults cannot be edited or deleted.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-judicial-blue-600" />
        </div>
      ) : (
        /* Template Categories */
        <div className="space-y-6">
          {CATEGORY_ORDER.map(category => {
            const categoryTemplates = grouped[category];
            const topThree = getTopThreeIds(categoryTemplates);

            return (
              <div
                key={category}
                className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-neutral-50 dark:bg-metallic-gray-700 px-6 py-4 border-b border-neutral-200 dark:border-metallic-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartAdd(category)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Templates List */}
                <div className="p-6 space-y-3">
                  {categoryTemplates.length === 0 ? (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-4">
                      No templates yet. Add your first one!
                    </p>
                  ) : (
                    categoryTemplates.map(template => {
                      const isEditing = editingId === template.id;
                      const isTopUsed = topThree.includes(template.id);

                      return (
                        <div
                          key={template.id}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                            template.is_custom
                              ? 'border-neutral-200 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900'
                              : 'border-neutral-300 dark:border-metallic-gray-500 bg-neutral-50 dark:bg-metallic-gray-700'
                          )}
                        >
                          {/* Usage Star */}
                          <div className="w-6 flex-shrink-0">
                            {isTopUsed && (
                              <Star className="w-5 h-5 text-mpondo-gold-500 fill-mpondo-gold-500" />
                            )}
                          </div>

                          {/* Template Value */}
                          <div className="flex-1">
                            {isEditing ? (
                              <FormInput
                                value={editValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                              />
                            ) : (
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {template.value}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                  <span>Used {template.usage_count} times</span>
                                  {template.last_used_at && (
                                    <span>
                                      Last used: {format(new Date(template.last_used_at), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                  {!template.is_custom && (
                                    <span className="px-2 py-0.5 bg-neutral-200 dark:bg-metallic-gray-600 rounded text-neutral-700 dark:text-neutral-300">
                                      System Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                {template.is_custom && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStartEdit(template)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(template.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add New Template Form */}
                  {addingCategory === category && (
                    <div className="p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/10 border-2 border-mpondo-gold-200 dark:border-mpondo-gold-800 rounded-lg">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        New Template
                      </label>
                      <div className="flex gap-2">
                        <FormInput
                          value={newTemplateValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplateValue(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter') handleSaveAdd();
                            if (e.key === 'Escape') setAddingCategory(null);
                          }}
                          placeholder="Enter template value..."
                          autoFocus
                          className="flex-1"
                        />
                        <Button variant="primary" onClick={handleSaveAdd} disabled={!newTemplateValue.trim()}>
                          Add
                        </Button>
                        <Button variant="ghost" onClick={() => setAddingCategory(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Delete Template?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Are you sure you want to delete this template? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setDeletingId(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickBriefTemplatesSettings;
