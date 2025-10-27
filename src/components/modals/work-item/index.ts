/**
 * Work Item Modal - Consolidated Exports
 * 
 * Single entry point for all work item modal functionality
 */

// Main modal component
export { WorkItemModal } from './WorkItemModal';
export type { WorkItemModalProps, WorkItemType, WorkItemMode } from './WorkItemModal';

// Hook
export { useWorkItemModal } from './hooks/useWorkItemModal';
export type { UseWorkItemModalReturn, UseWorkItemModalOptions } from './hooks/useWorkItemModal';

// Form components (for advanced usage)
export { ServiceForm } from './forms/ServiceForm';
export type { ServiceFormProps } from './forms/ServiceForm';

export { TimeEntryForm } from './forms/TimeEntryForm';
export type { TimeEntryFormProps } from './forms/TimeEntryForm';

export { DisbursementForm } from './forms/DisbursementForm';
export type { DisbursementFormProps } from './forms/DisbursementForm';
