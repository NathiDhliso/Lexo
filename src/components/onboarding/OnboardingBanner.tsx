/**
 * OnboardingBanner — Persistent nudge for incomplete onboarding (Section 9.1)
 */
import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OnboardingBannerProps {
  onStartOnboarding: () => void;
}

const STEP_LABELS = [
  'Personal Profile', 'LPC Verification', 'Firm Details', 'VAT Registration',
  'Bank Details', 'Rate Card Setup', 'Invoice Branding', 'First Matter',
];

export const OnboardingBanner: React.FC<OnboardingBannerProps> = ({ onStartOnboarding }) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(8);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('advocates')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();

      if (data && !data.onboarding_completed) {
        setCurrentStep(data.onboarding_step ?? 0);
        setVisible(true);
      }
    } catch {
      // Silently fail — don't block the app for onboarding banner
    }
  };

  if (!visible || dismissed) return null;

  const remainingSteps = totalSteps - currentStep;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="relative bg-gradient-to-r from-mpondo-gold-600 via-mpondo-gold-500 to-amber-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Complete your setup — {remainingSteps} step{remainingSteps !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs text-white/80 truncate">
                Next: {STEP_LABELS[currentStep] ?? 'Setup'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium">{currentStep}/{totalSteps}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onStartOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-mpondo-gold-700 text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Continue Setup <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Dismiss (will reappear on next login)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingBanner;
