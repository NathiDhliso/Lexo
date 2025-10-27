/**
 * MobileDemo Component
 * 
 * Comprehensive demo component showcasing all mobile components and features.
 * Demonstrates the complete mobile workflow for billing modernization.
 * 
 * Features demonstrated:
 * - Mobile quick actions menu
 * - Mobile-optimized modals (payment, disbursement, invoice)
 * - Swipe gestures and navigation
 * - Voice input functionality
 * - Mobile matter creation wizard
 * - Optimized form inputs
 * - Mobile matter cards with swipe actions
 */
import React, { useState } from 'react';
import { MobileDashboard } from './MobileDashboard';
import { MobileMatterCreationWizard } from './MobileMatterCreationWizard';
import { MobilePageWrapper } from './MobileSwipeNavigation';
import { Button } from '../ui/Button';
import { Plus, Smartphone, Zap } from 'lucide-react';
import type { NewMatterForm } from '../../types';

export const MobileDemo: React.FC = () => {
  const [showMatterWizard, setShowMatterWizard] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'demo'>('dashboard');

  const handleMatterCreation = async (data: NewMatterForm) => {
    console.log('Creating matter:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Matter created successfully!');
  };

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-900">
        <MobileDashboard />
        
        {/* Demo Controls */}
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentView('demo')}
            icon={<Smartphone className="w-4 h-4" />}
          >
            Demo Features
          </Button>
        </div>

        {/* Matter Creation Wizard */}
        <MobileMatterCreationWizard
          isOpen={showMatterWizard}
          onClose={() => setShowMatterWizard(false)}
          onComplete={handleMatterCreation}
        />
      </div>
    );
  }

  return (
    <MobilePageWrapper
      title="Mobile Features Demo"
      subtitle="Billing workflow modernization"
      onRefresh={() => console.log('Refreshing demo...')}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Mobile Features Demo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Experience the complete mobile workflow for advocates
          </p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-6 border border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              ✨ Quick Actions Menu
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              3x2 grid of essential actions with large touch targets and haptic feedback.
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Record payments with quick amount buttons</li>
              <li>• Log disbursements with smart VAT suggestions</li>
              <li>• Send invoices via email or WhatsApp</li>
              <li>• Voice-to-text for descriptions</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-6 border border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              📱 Mobile Matter Creation
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Simplified 2-step wizard optimized for mobile input.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowMatterWizard(true)}
              icon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Try Matter Creation Wizard
            </Button>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-6 border border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              👆 Swipe Gestures
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Natural mobile navigation patterns for better UX.
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Swipe right to go back</li>
              <li>• Pull down to refresh</li>
              <li>• Swipe left on matter cards for actions</li>
              <li>• Touch-friendly animations</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-6 border border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              🎤 Voice Input
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Speech-to-text functionality for faster data entry.
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• South African English support</li>
              <li>• Real-time transcription</li>
              <li>• Error handling and recovery</li>
              <li>• Visual feedback during recording</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-6 border border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              📝 Optimized Form Inputs
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Mobile-first form inputs with proper types and validation.
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Currency input with Rand formatting</li>
              <li>• Phone input with SA number formatting</li>
              <li>• Email input with proper keyboard</li>
              <li>• Search input with suggestions</li>
            </ul>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Matter Creation Wizard */}
      <MobileMatterCreationWizard
        isOpen={showMatterWizard}
        onClose={() => setShowMatterWizard(false)}
        onComplete={handleMatterCreation}
      />
    </MobilePageWrapper>
  );
};