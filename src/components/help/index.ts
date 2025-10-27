/**
 * Help System Components Index
 * Exports all help and onboarding related components
 */

// Context & Hooks
export { HelpProvider } from '../../contexts/HelpContext';
export { useHelp } from '../../hooks/useHelp';

// Help Components
export { HelpCenter } from './HelpCenter';
export { ContextualTooltip, FeatureSpotlight } from './ContextualTooltip';

// Onboarding Components
export { EnhancedOnboardingWizard } from '../onboarding/EnhancedOnboardingWizard';
export { OnboardingChecklist } from '../onboarding/OnboardingChecklist';

// Services
export { featureDiscoveryService } from '../../services/feature-discovery.service';

// Types
export type {
  FeatureTour,
  TooltipConfig,
  Feature,
  HelpArticle,
  OnboardingPhase,
  FeatureSuggestion,
} from '../../types/help.types';
