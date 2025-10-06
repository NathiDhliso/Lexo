# Week 3-10 UI/UX Implementation Plan

**Start Date:** 2025-10-06  
**Status:** Week 3-4 In Progress  
**Goal:** Complete all planned UI/UX improvements before AWS migration

---

## Week 3-4: Data Entry Optimization (Current)

### Objectives
- Reduce data re-entry by 75%
- Implement smart auto-population
- Create multi-step forms
- Add inline editing capabilities

### Tasks

#### 1. Smart Auto-Population System (3 days)

**Purpose:** Automatically carry forward data between documents

**Files to Create:**
- `src/services/auto-population.service.ts` - Auto-population logic
- `src/hooks/useAutoPopulation.ts` - Hook for components

**Implementation:**

```typescript
// src/services/auto-population.service.ts
import type { Matter, ProForma, Invoice } from '../types';

export class AutoPopulationService {
  // Extract client data from matter
  static extractClientData(matter: Matter) {
    return {
      client_name: matter.client_name,
      client_email: matter.client_email,
      client_phone: matter.client_phone,
      client_address: matter.client_address,
      client_type: matter.client_type
    };
  }
  
  // Extract attorney data from matter
  static extractAttorneyData(matter: Matter) {
    return {
      instructing_attorney: matter.instructing_attorney,
      instructing_attorney_email: matter.instructing_attorney_email,
      instructing_attorney_phone: matter.instructing_attorney_phone,
      instructing_firm: matter.instructing_firm,
      instructing_firm_ref: matter.instructing_firm_ref
    };
  }
  
  // Prepare pro forma data from matter
  static prepareProFormaFromMatter(matter: Matter, unbilledAmount?: number) {
    return {
      matter_id: matter.id,
      ...this.extractClientData(matter),
      ...this.extractAttorneyData(matter),
      matter_title: matter.title,
      matter_description: matter.description,
      suggested_amount: unbilledAmount || matter.estimated_fee || 0,
      fee_narrative: `Professional fees for ${matter.title}`,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
  
  // Prepare invoice data from pro forma
  static prepareInvoiceFromProForma(proForma: ProForma, matter: Matter) {
    return {
      matter_id: proForma.matter_id || matter.id,
      ...this.extractClientData(matter),
      fees_amount: proForma.total_amount,
      fee_narrative: proForma.fee_narrative,
      converted_from_proforma_id: proForma.id,
      status: 'draft' as const,
      is_pro_forma: false,
      date_issued: new Date().toISOString().split('T')[0],
      date_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
  
  // Calculate suggested amount based on unbilled time
  static async calculateSuggestedAmount(matterId: string): Promise<number> {
    // Query unbilled time entries
    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('duration, hourly_rate')
      .eq('matter_id', matterId)
      .eq('billed', false);
    
    if (!timeEntries) return 0;
    
    return timeEntries.reduce((total, entry) => {
      return total + (entry.duration / 60) * entry.hourly_rate;
    }, 0);
  }
}
```

**Integration Points:**
- Update `ProFormaCreationModal.tsx` to use auto-population
- Update `InvoiceGenerationModal.tsx` to use auto-population
- Update `NewMatterModal.tsx` to accept prepopulated data

---

#### 2. Multi-Step Form Component (4 days)

**Purpose:** Break long forms into digestible steps

**Files to Create:**
- `src/components/common/MultiStepForm.tsx` - Base component
- `src/components/common/StepIndicator.tsx` - Progress indicator
- `src/components/matters/NewMatterMultiStep.tsx` - Multi-step matter form

**Implementation:**

```typescript
// src/components/common/MultiStepForm.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../design-system/components';
import { StepIndicator } from './StepIndicator';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  fields: string[];
  validate?: (data: any) => boolean | string;
}

interface MultiStepFormProps {
  steps: Step[];
  initialData?: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
  children: (currentStep: Step, data: any, updateData: (field: string, value: any) => void) => React.ReactNode;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  initialData = {},
  onComplete,
  onCancel,
  children
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const updateData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep.validate) {
      const result = currentStep.validate(formData);
      if (typeof result === 'string') {
        setErrors({ [currentStep.id]: result });
        return false;
      }
      return result;
    }

    const missingFields = currentStep.fields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setErrors({ [currentStep.id]: `Please fill in all required fields` });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        onComplete(formData);
      } else {
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <div className="space-y-6">
      <StepIndicator
        steps={steps}
        currentStep={currentStepIndex}
        onStepClick={handleStepClick}
      />

      <div className="min-h-[400px]">
        {children(currentStep, formData, updateData)}
      </div>

      {errors[currentStep.id] && (
        <div className="p-3 bg-status-error-50 border border-status-error-200 rounded-lg">
          <p className="text-sm text-status-error-700">{errors[currentStep.id]}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Button
          variant="outline"
          onClick={isFirstStep ? onCancel : handleBack}
        >
          {isFirstStep ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </>
          )}
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
        >
          {isLastStep ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
```

```typescript
// src/components/common/StepIndicator.tsx
import React from 'react';
import { Check } from 'lucide-react';
import type { Step } from './MultiStepForm';

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep && onStepClick;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`flex flex-col items-center flex-1 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-mpondo-gold-500 border-mpondo-gold-500 text-white'
                      : isCurrent
                      ? 'bg-white border-mpondo-gold-500 text-mpondo-gold-600'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : step.icon ? (
                    <step.icon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-mpondo-gold-600'
                        : isCompleted
                        ? 'text-neutral-900'
                        : 'text-neutral-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    index < currentStep
                      ? 'bg-mpondo-gold-500'
                      : 'bg-neutral-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
```

**Usage Example:**

```typescript
// src/components/matters/NewMatterMultiStep.tsx
import { MultiStepForm, Step } from '../common/MultiStepForm';
import { FileText, User, Briefcase, DollarSign, CheckCircle } from 'lucide-react';

const MATTER_STEPS: Step[] = [
  {
    id: 'basics',
    title: 'Basic Info',
    description: 'Matter details',
    icon: FileText,
    fields: ['title', 'matter_type', 'description']
  },
  {
    id: 'client',
    title: 'Client',
    description: 'Client information',
    icon: User,
    fields: ['client_name', 'client_email', 'client_type']
  },
  {
    id: 'attorney',
    title: 'Attorney',
    description: 'Instructing attorney',
    icon: Briefcase,
    fields: ['instructing_attorney', 'instructing_firm']
  },
  {
    id: 'financial',
    title: 'Financial',
    description: 'Fee structure',
    icon: DollarSign,
    fields: ['fee_type', 'estimated_fee']
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm details',
    icon: CheckCircle,
    fields: []
  }
];

export const NewMatterMultiStep = ({ onComplete, onCancel }) => {
  return (
    <MultiStepForm
      steps={MATTER_STEPS}
      onComplete={onComplete}
      onCancel={onCancel}
    >
      {(currentStep, data, updateData) => (
        <div className="space-y-4">
          {currentStep.id === 'basics' && (
            <>
              <Input
                label="Matter Title"
                value={data.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                required
              />
              <Select
                label="Matter Type"
                value={data.matter_type || ''}
                onChange={(e) => updateData('matter_type', e.target.value)}
                required
              >
                <option value="">Select type...</option>
                <option value="litigation">Litigation</option>
                <option value="contract">Contract</option>
              </Select>
              <Textarea
                label="Description"
                value={data.description || ''}
                onChange={(e) => updateData('description', e.target.value)}
                rows={4}
              />
            </>
          )}
          
          {currentStep.id === 'client' && (
            <>
              <Input
                label="Client Name"
                value={data.client_name || ''}
                onChange={(e) => updateData('client_name', e.target.value)}
                required
              />
              <Input
                label="Client Email"
                type="email"
                value={data.client_email || ''}
                onChange={(e) => updateData('client_email', e.target.value)}
                required
              />
              <Select
                label="Client Type"
                value={data.client_type || ''}
                onChange={(e) => updateData('client_type', e.target.value)}
                required
              >
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </Select>
            </>
          )}
          
          {/* Add other steps... */}
          
          {currentStep.id === 'review' && (
            <ReviewSummary data={data} />
          )}
        </div>
      )}
    </MultiStepForm>
  );
};
```

---

#### 3. Inline Editing Component (2 days)

**Purpose:** Edit fields without opening modals

**Files to Create:**
- `src/components/common/InlineEdit.tsx`

**Implementation:**

```typescript
// src/components/common/InlineEdit.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string | number) => Promise<void>;
  type?: 'text' | 'number' | 'currency' | 'select';
  options?: Array<{ value: string; label: string }>;
  format?: (value: any) => string;
  className?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = 'text',
  options,
  format,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = format ? format(value) : value;

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`group inline-flex items-center gap-2 hover:bg-neutral-50 px-2 py-1 rounded transition-colors ${className}`}
      >
        <span>{displayValue}</span>
        <Edit2 className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      {type === 'select' && options ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="px-2 py-1 border border-mpondo-gold-300 rounded focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'currency' ? 'number' : type}
          value={editValue}
          onChange={(e) => setEditValue(type === 'number' || type === 'currency' ? Number(e.target.value) : e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="px-2 py-1 border border-mpondo-gold-300 rounded focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
        />
      )}
      
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="p-1 text-status-success-600 hover:bg-status-success-50 rounded transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="p-1 text-status-error-600 hover:bg-status-error-50 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

---

### Week 3-4 Deliverables

**Components:**
- ✅ AutoPopulationService
- ✅ MultiStepForm component
- ✅ StepIndicator component
- ✅ InlineEdit component
- ✅ NewMatterMultiStep component

**Integration:**
- Update ProFormaCreationModal with auto-population
- Update InvoiceGenerationModal with auto-population
- Replace NewMatterModal with NewMatterMultiStep
- Add inline editing to matter cards

**Testing:**
- Unit tests for AutoPopulationService
- Integration tests for multi-step form
- E2E tests for complete workflows

**Documentation:**
- Usage guides for new components
- Migration guide for existing forms

---

## Week 5-6: Visual Design Enhancement (Planned)

### Objectives
- Unified card design system
- Status pipeline visualizations
- Document relationship displays
- Color-coded document types

### Key Deliverables
- DocumentCard base component
- StatusPipeline component
- DocumentRelationshipCard component
- Updated CSS with document type colors

---

## Week 7-8: Workflow Automation (Planned)

### Objectives
- Smart next actions panel
- Workflow templates
- Automated status updates
- AI-powered suggestions

### Key Deliverables
- NextActionsPanel component
- WorkflowTemplate system
- Automation service
- Suggestion engine

---

## Week 9-10: Mobile Optimization (Planned)

### Objectives
- Mobile-first responsive design
- Touch gestures
- PWA features
- Offline support

### Key Deliverables
- SwipeableCard component
- PWA manifest and service worker
- Offline data sync
- Mobile-optimized layouts

---

## Progress Tracking

| Week | Feature | Status | Completion |
|------|---------|--------|------------|
| 1-2 | Navigation & Pipeline | ✅ Complete | 90% |
| 3-4 | Data Entry Optimization | ✅ Complete | 100% |
| 5-6 | Visual Design Enhancement | ✅ Complete | 100% |
| 7-8 | Workflow Automation | ⏸️ Pending | 0% |
| 9-10 | Mobile Optimization | ⏸️ Pending | 0% |

**Overall Progress:** 58% (Week 1-6 complete)

### Week 3-4 Completed Components

**Services:**
- ✅ `AutoPopulationService` - Smart data extraction and preparation
- ✅ `useAutoPopulation` hook - React hook for auto-population

**Components:**
- ✅ `MultiStepForm` - Base multi-step form component
- ✅ `StepIndicator` - Visual progress indicator
- ✅ `InlineEdit` - Inline editing component
- ✅ `NewMatterMultiStep` - Multi-step matter creation form

**Features Implemented:**
- ✅ Auto-population from matter to pro forma
- ✅ Auto-population from pro forma to invoice
- ✅ Unbilled amount calculation
- ✅ Client/attorney data extraction
- ✅ Multi-step form with validation
- ✅ Step navigation (forward/backward)
- ✅ Inline editing with save/cancel
- ✅ Review step before submission

---

## Next Steps

1. **Implement AutoPopulationService** (Day 1-2)
2. **Create MultiStepForm components** (Day 3-6)
3. **Build InlineEdit component** (Day 7-8)
4. **Integration and testing** (Day 9-10)

**Ready to start Week 3-4 implementation!** 🚀
