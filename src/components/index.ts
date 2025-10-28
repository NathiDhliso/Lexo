/**
 * Attorney Selection & Matter Description Exports
 * 
 * Centralized exports for the new feature components
 */

// Attorney Selection
export { AttorneySelectionField } from './attorneys/AttorneySelectionField';
export type { Attorney, AttorneySelectionFieldProps } from './attorneys/AttorneySelectionField';

// Matter Description Recording
export { MatterDescriptionModal } from './matters/MatterDescriptionModal';
export type { MatterDescriptionModalProps, MatterTypeTemplate } from './matters/MatterDescriptionModal';

// Voice Recording Hook
export { useVoiceRecording } from '../hooks/useVoiceRecording';
export type { VoiceRecordingState, UseVoiceRecordingOptions } from '../hooks/useVoiceRecording';

// AI Summarization Service
export {
  formatMatterDescription,
  calculatePlaceholderPercentage,
  validateDescriptionQuality,
  aiSummarizationService
} from '../services/ai-summarization.service';
export type { MatterType } from '../services/ai-summarization.service';
