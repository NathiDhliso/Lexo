/**
 * BriefFeeTemplateManager Component
 * Manages brief fee templates with grid/list view, filters, and CRUD operations
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Star,
  Clock
} from 'lucide-react';
import { Button, Input } from '../design-system/components';
import { BriefFeeTemplateService } from '../../services/api/brief-fee-template.service';
import { TemplateEditor } from './TemplateEditor';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import type { BriefFeeTemplate } from '../../types';

interface BriefFeeTemplateManagerProps {
  className?: string;
  onSelectTemplate?: (template: BriefFeeTemplate) => void;
}

export const BriefFeeTemplateManager: React.FC<BriefFeeTemplateManagerProps> = ({
  className = '',
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<BriefFeeTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<BriefFeeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('usage');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BriefFeeTemplate | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [caseTypes, setCaseTypes] = useState<string[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await BriefFeeTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCaseTypes = useCallback(async () => {
    const types = await BriefFeeTemplateService.getCaseTypes();
    setCaseTypes(types);
  }, []);

  const filterAndSortTemplates = useCallback(() => {
    let filtered = [...templates];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.template_name.toLowerCase().includes(query) ||
          t.case_type.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    // Filter by case type
    if (selectedCaseType && selectedCaseType !== 'all') {
      filtered = filtered.filter(t => t.case_type === selectedCaseType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.template_name.localeCompare(b.template_name);
        case 'usage':
          return (b.times_used || 0) - (a.times_used || 0);
        case 'recent':
          return new Date(b.updated_at || b.created_at).getTime() - 
                 new Date(a.updated_at || a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCaseType, sortBy]);

  useEffect(() => {
    loadTemplates();
    loadCaseTypes();
  }, [loadTemplates, loadCaseTypes]);

  useEffect(() => {
    filterAndSortTemplates();
  }, [filterAndSortTemplates]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: BriefFeeTemplate) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
    setActiveDropdown(null);
  };

  const handleDuplicate = async (template: BriefFeeTemplate) => {
    const newName = prompt('Enter name for duplicated template:', `${template.template_name} (Copy)`);
    if (!newName) return;

    try {
      await BriefFeeTemplateService.duplicateTemplate(template.id, newName);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
    setActiveDropdown(null);
  };

  const handleDelete = async (template: BriefFeeTemplate) => {
    if (!confirm(`Delete template "${template.template_name}"?`)) return;

    try {
      await BriefFeeTemplateService.deleteTemplate(template.id);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
    setActiveDropdown(null);
  };

  const handleSetDefault = async (template: BriefFeeTemplate) => {
    try {
      await BriefFeeTemplateService.setDefaultTemplate(template.id, template.case_type);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to set default template:', error);
    }
    setActiveDropdown(null);
  };

  const handleEditorSave = async () => {
    setIsEditorOpen(false);
    setEditingTemplate(null);
    await loadTemplates();
  };

  const handleSelect = (template: BriefFeeTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const calculateTotalAmount = (template: BriefFeeTemplate): number => {
    const servicesTotal = template.included_services.reduce(
      (sum, service) => sum + (service.amount || 0),
      0
    );
    return template.base_fee + servicesTotal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Brief Fee Templates
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Manage reusable brief fee templates for quick matter creation
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>

        {/* Case Type Filter */}
        <select
          value={selectedCaseType}
          onChange={(e) => setSelectedCaseType(e.target.value)}
          className="px-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 
                   bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 
                   rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-judicial-blue-500"
        >
          <option value="all">All Case Types</option>
          {caseTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'recent')}
          className="px-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 
                   bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 
                   rounded-lg focus:ring-2 focus:ring-judicial-blue-500 focus:border-judicial-blue-500"
        >
          <option value="usage">Most Used</option>
          <option value="recent">Recently Updated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            {searchQuery || selectedCaseType !== 'all' ? 'No templates found' : 'No templates yet'}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {searchQuery || selectedCaseType !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first template to get started'}
          </p>
          {!searchQuery && selectedCaseType === 'all' && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 
                       dark:border-metallic-gray-700 p-6 hover:shadow-lg transition-shadow 
                       relative group"
            >
              {/* Default Badge */}
              {template.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-mpondo-gold-100 
                                 dark:bg-mpondo-gold-900/20 text-mpondo-gold-700 dark:text-mpondo-gold-400 
                                 text-xs font-medium rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                </div>
              )}

              {/* Actions Dropdown */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === template.id ? null : template.id)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 
                           rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeDropdown === template.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-metallic-gray-800 rounded-lg 
                                shadow-lg border border-neutral-200 dark:border-metallic-gray-700 py-1 z-10">
                    <button
                      onClick={() => handleEdit(template)}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 
                               hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 
                               hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    {!template.is_default && (
                      <button
                        onClick={() => handleSetDefault(template)}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 
                                 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(template)}
                      className="w-full px-4 py-2 text-left text-sm text-status-error-600 
                               hover:bg-status-error-50 dark:hover:bg-status-error-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Template Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1 pr-20">
                    {template.template_name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {template.case_type}
                  </p>
                </div>

                {template.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>{template.times_used || 0} uses</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                    <FileText className="w-4 h-4" />
                    <span>{template.included_services.length} services</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Total Fee
                    </span>
                    <span className="text-xl font-bold text-judicial-blue-600 dark:text-judicial-blue-400">
                      {formatRand(calculateTotalAmount(template))}
                    </span>
                  </div>
                  {template.estimated_hours && template.hourly_rate && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">
                        Est. {template.estimated_hours}h @ {formatRand(template.hourly_rate)}/h
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {onSelectTemplate && (
                  <Button
                    onClick={() => handleSelect(template)}
                    variant="outline"
                    className="w-full"
                  >
                    Use Template
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditorOpen && (
        <TemplateEditor
          template={editingTemplate}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
          }}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
};
