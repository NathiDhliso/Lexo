/**
 * Matter Modal - Consolidated Exports
 * 
 * Single entry point for all matter modal functionality
 */

// Main modal component
export { MatterModal } from './MatterModal';
export type { MatterModalProps, MatterMode } from './MatterModal';

// Hook
export { useMatterModal } from './hooks/useMatterModal';
export type { UseMatterModalReturn, UseMatterModalOptions } from './hooks/useMatterModal';

// Form components (for advanced usage)
export { CreateMatterForm } from './forms/CreateMatterForm';
export type { CreateMatterFormProps } from './forms/CreateMatterForm';

export { EditMatterForm } from './forms/EditMatterForm';
export type { EditMatterFormProps } from './forms/EditMatterForm';

export { QuickAddMatterForm } from './forms/QuickAddMatterForm';
export type { QuickAddMatterFormProps } from './forms/QuickAddMatterForm';

export { AcceptBriefForm } from './forms/AcceptBriefForm';
export type { AcceptBriefFormProps } from './forms/AcceptBriefForm';

// View components (for advanced usage)
export { ViewMatterDetails } from './views/ViewMatterDetails';
export type { ViewMatterDetailsProps } from './views/ViewMatterDetails';

export { MatterDetailView } from './views/MatterDetailView';
export type { MatterDetailViewProps } from './views/MatterDetailView';
