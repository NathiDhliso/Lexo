import React, { useState } from 'react';
import { CheckCircle, Circle, Play, ChevronRight } from 'lucide-react';
import { Button, Card, CardContent } from '../../design-system/components';
import { WorkflowAutomationService, WorkflowTemplate } from '../../services/workflow-automation.service';

interface WorkflowTemplateSelectorProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  className?: string;
}

export const WorkflowTemplateSelector: React.FC<WorkflowTemplateSelectorProps> = ({
  onSelectTemplate,
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const templates = WorkflowAutomationService.WORKFLOW_TEMPLATES;

  const handleSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template.id);
    onSelectTemplate(template);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Choose a Workflow Template
        </h3>
        <p className="text-sm text-neutral-600">
          Select a pre-configured workflow to streamline your process
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-mpondo-gold-500 border-mpondo-gold-300'
                  : 'hover:border-mpondo-gold-300'
              }`}
              onClick={() => handleSelect(template)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? 'bg-mpondo-gold-500 border-mpondo-gold-500'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-neutral-900 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-700 uppercase tracking-wide">
                    Workflow Steps ({template.steps.length})
                  </p>
                  <div className="space-y-1">
                    {template.steps.slice(0, 3).map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 text-sm text-neutral-600"
                      >
                        <span className="text-mpondo-gold-600 font-medium">
                          {index + 1}.
                        </span>
                        <span>{step.action}</span>
                        {step.autoExecute && (
                          <span className="text-xs text-mpondo-gold-600">
                            (Auto)
                          </span>
                        )}
                      </div>
                    ))}
                    {template.steps.length > 3 && (
                      <p className="text-xs text-neutral-500 ml-5">
                        +{template.steps.length - 3} more steps
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workflow
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export const WorkflowStepProgress: React.FC<{
  template: WorkflowTemplate;
  currentStepId: string;
  completedStepIds: string[];
}> = ({ template, currentStepId, completedStepIds }) => {
  return (
    <div className="space-y-3">
      {template.steps.map((step, index) => {
        const isCompleted = completedStepIds.includes(step.id);
        const isCurrent = step.id === currentStepId;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-status-success-500 border-status-success-500 text-white'
                    : isCurrent
                    ? 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white'
                    : 'bg-white border-neutral-300 text-neutral-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < template.steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    isCompleted ? 'bg-status-success-500' : 'bg-neutral-300'
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-mpondo-gold-700'
                      : isCompleted
                      ? 'text-neutral-900'
                      : 'text-neutral-500'
                  }`}
                >
                  {step.action}
                </h4>
                {step.autoExecute && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-mpondo-gold-100 text-mpondo-gold-700">
                    Auto
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600">{step.description}</p>
              {isCurrent && (
                <div className="mt-2">
                  <Button variant="primary" size="sm">
                    Complete Step
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
