import React from 'react';
import { Briefcase, FileText, Receipt, DollarSign, ChevronRight } from 'lucide-react';
import type { Page } from '../../types';

interface PipelineStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  page: Page;
  count?: number;
}

interface WorkflowPipelineProps {
  matterCount?: number;
  proFormaCount?: number;
  invoiceCount?: number;
  unpaidCount?: number;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  matterCount = 0,
  proFormaCount = 0,
  invoiceCount = 0,
  unpaidCount = 0,
  currentPage = 'dashboard',
  onNavigate
}) => {

  const steps: PipelineStep[] = [
    {
      id: 'matters',
      label: 'Matters',
      icon: Briefcase,
      page: 'matters',
      count: matterCount
    },
    {
      id: 'proforma',
      label: 'Pro Forma',
      icon: FileText,
      page: 'proforma',
      count: proFormaCount
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: Receipt,
      page: 'invoices',
      count: invoiceCount
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: DollarSign,
      page: 'invoices', // Note: payments uses invoices page
      count: unpaidCount
    }
  ];

  const isStepActive = (step: PipelineStep) => {
    return currentPage === step.page || 
           (step.id === 'payments' && currentPage === 'invoices');
  };

  const getStepStatus = (step: PipelineStep) => {
    if (isStepActive(step)) return 'active';
    if (step.count && step.count > 0) return 'pending';
    return 'completed';
  };

  return (
    <div className="bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 sticky top-0 z-40 theme-shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step);
              const isActive = status === 'active';
              const hasPending = status === 'pending';

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => onNavigate?.(step.page)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-mpondo-gold-100 text-mpondo-gold-700 font-medium' 
                        : hasPending
                        ? 'bg-judicial-blue-50 text-judicial-blue-700 hover:bg-judicial-blue-100'
                        : 'text-neutral-600 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-mpondo-gold-600' : ''}`} />
                    <span className="text-sm whitespace-nowrap">{step.label}</span>
                    {step.count !== undefined && step.count > 0 && (
                      <span className={`
                        inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium
                        ${isActive 
                          ? 'bg-mpondo-gold-600 text-white' 
                          : 'bg-judicial-blue-600 text-white'
                        }
                      `}>
                        {step.count}
                      </span>
                    )}
                  </button>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
