/**
 * UI Components
 * 
 * Centralized export for all UI components following the LexoHub design system.
 * These components implement the Mpondo Gold and Judicial Blue theme with
 * metallic gray accents.
 */

export { Button } from './Button';
export type { ButtonProps, AsyncButtonProps } from './Button';

export { AsyncButton } from './AsyncButton';
export type { AsyncButtonProps as AsyncButtonComponentProps } from './AsyncButton';

export { Toast } from './Toast';
export type { ToastProps } from './Toast';

export { ToastContainer } from './ToastContainer';
export type { ToastContainerProps } from './ToastContainer';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export {
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalDescription,
} from './ModalComponents';
export type {
  ModalHeaderProps,
  ModalTitleProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalDescriptionProps,
} from './ModalComponents';

export { ConfirmationDialog } from './ConfirmationDialog';
export type { ConfirmationDialogProps } from './ConfirmationDialog';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { FormInput } from './FormInput';
export type { FormInputProps } from './FormInput';

export { FieldError } from './FieldError';
export type { FieldErrorProps } from './FieldError';

export { FormFieldGroup } from './FormFieldGroup';
export type { FormFieldGroupProps } from './FormFieldGroup';

export { InlineErrorAlert } from './InlineErrorAlert';
export type { InlineErrorAlertProps } from './InlineErrorAlert';

export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { HelpTooltip } from './HelpTooltip';
export type { HelpTooltipProps } from './HelpTooltip';

export { AccessibilityChecker } from './AccessibilityChecker';
export type { AccessibilityIssue } from './AccessibilityChecker';

export { ResponsiveTestHelper } from './ResponsiveTestHelper';

export { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export { ContrastChecker } from './ContrastChecker';

export { 
  LazyLoadWrapper, 
  PageLoader, 
  ComponentLoader, 
  lazyWithPreload,
  preloadImage,
  preloadImages,
  useIntersectionObserver,
  LazyImage
} from './LazyLoad';

export { VirtualScroll, useVirtualScroll, usePagination } from './VirtualScroll';
export { Pagination } from './VirtualScroll'; // Using VirtualScroll's Pagination

export { SkeletonLoader } from './SkeletonLoader';
export type { SkeletonLoaderProps } from './SkeletonLoader';

export { LoadingOverlay } from './LoadingOverlay';
export type { LoadingOverlayProps } from './LoadingOverlay';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { BulkActionToolbar, SelectionCheckbox } from './BulkActionToolbar';
export type { BulkActionToolbarProps, SelectionCheckboxProps, BulkAction } from './BulkActionToolbar';

export { MatterStatusBadge } from './MatterStatusBadge';
