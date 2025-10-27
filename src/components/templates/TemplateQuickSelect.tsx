/**
 * TemplateQuickSelect Component
 * Quick template selector for matter creation workflow
 */
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  ChevronDown,
  Check,
  Star
} from 'lucide-react';
import { BriefFeeTemplateService } from '../../services/api/brief-fee-template.service';
import { formatRand } from '../../lib/currency';
import type { BriefFeeTemplate } from '../../types';

interface TemplateQuickSelectProps {
  caseType?: string;
  onSelectTemplate: (template: BriefFeeTemplate) => void;
  className?: string;
}

export const TemplateQuickSelect: React.FC<TemplateQuickSelectProps> = ({
  caseType,
  onSelectTemplate,
  className = ''
}) => {
  const [templates, setTemplates] = useState<BriefFeeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BriefFeeTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTemplates = React.useCallback(async () => {
    try {
      setLoading(true);
      let data: BriefFeeTemplate[];
      
      if (caseType) {
        // Get templates for specific case type
        data = await BriefFeeTemplateService.getTemplatesByCaseType(caseType);
        
        // If no templates for this case type, try to get the default template
        if (data.length === 0) {
          const defaultTemplate = await BriefFeeTemplateService.getDefaultTemplate(caseType);
          data = defaultTemplate ? [defaultTemplate] : [];
        }
      } else {
        // Get all templates
        data = await BriefFeeTemplateService.getTemplates();
      }

      setTemplates(data);

      // Auto-select default template if available
      const defaultTemplate = data.find(t => t.is_default);
      if (defaultTemplate && !selectedTemplate) {
        setSelectedTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }, [caseType, selectedTemplate]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSelectTemplate = (template: BriefFeeTemplate) => {
    setSelectedTemplate(template);
    setIsOpen(false);
    onSelectTemplate(template);
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
      <div className={`p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-judicial-blue-600"></div>
          Loading templates...
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className={`p-4 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg ${className}`}>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          No templates available{caseType ? ` for ${caseType}` : ''}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Template Display / Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-white dark:bg-metallic-gray-900 rounded-lg border border-neutral-300 
                 dark:border-metallic-gray-600 hover:border-judicial-blue-500 dark:hover:border-judicial-blue-500 
                 transition-colors text-left"
      >
        {selectedTemplate ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-judicial-blue-600 dark:text-judicial-blue-400" />
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedTemplate.template_name}
                </span>
                {selectedTemplate.is_default && (
                  <Star className="w-3 h-3 text-mpondo-gold-600 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedTemplate.included_services.length} services
                </span>
                <span className="font-semibold text-judicial-blue-600 dark:text-judicial-blue-400">
                  {formatRand(calculateTotalAmount(selectedTemplate))}
                </span>
              </div>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-neutral-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">
              Select a template (optional)
            </span>
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white dark:bg-metallic-gray-900 rounded-lg 
                      shadow-lg border border-neutral-200 dark:border-metallic-gray-700 
                      max-h-96 overflow-y-auto">
          {/* Option: No Template */}
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(null);
              setIsOpen(false);
            }}
            className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 
                     transition-colors border-b border-neutral-200 dark:border-metallic-gray-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                No template (manual entry)
              </span>
              {!selectedTemplate && (
                <Check className="w-4 h-4 text-judicial-blue-600" />
              )}
            </div>
          </button>

          {/* Template Options */}
          {templates.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelectTemplate(template)}
              className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 
                       transition-colors border-b border-neutral-200 dark:border-metallic-gray-700 
                       last:border-b-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {template.template_name}
                    </span>
                    {template.is_default && (
                      <Star className="w-3 h-3 text-mpondo-gold-600 fill-current" />
                    )}
                  </div>
                  {template.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-1">
                      {template.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {template.included_services.length} services
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.times_used || 0} uses
                    </span>
                    <span className="font-semibold text-judicial-blue-600 dark:text-judicial-blue-400">
                      {formatRand(calculateTotalAmount(template))}
                    </span>
                  </div>
                </div>
                {selectedTemplate?.id === template.id && (
                  <Check className="w-5 h-5 text-judicial-blue-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
