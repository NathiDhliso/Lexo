/**
 * MobileDashboard Component
 * 
 * Complete mobile dashboard showcasing all mobile quick actions and components.
 * Demonstrates the full mobile workflow for billing modernization.
 * 
 * Requirements: 11.1, 11.2, 11.4
 */
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { MobileQuickActionsMenu } from './MobileQuickActionsMenu';
import { MobileRecordPaymentModal } from './MobileRecordPaymentModal';
import { MobileLogDisbursementModal } from './MobileLogDisbursementModal';
import { MobileSendInvoiceModal } from './MobileSendInvoiceModal';
import { MobilePageWrapper } from './MobileSwipeNavigation';
import { MobileMatterList } from './MobileMatterCard';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatRand } from '../../lib/currency';

interface MobileDashboardProps {
  className?: string;
}

// Mock data for demonstration
const mockStats = {
  totalRevenue: 125000,
  pendingInvoices: 8,
  activeMatters: 12,
  hoursLogged: 45.5,
};

const mockMatters = [
  {
    id: '1',
    title: 'Contract Review - Acme Corp',
    client: 'Wilson & Partners',
    status: 'active' as const,
    billingModel: 'brief-fee' as const,
    amount: 15000,
    dueDate: '2025-02-15',
    lastActivity: '2 hours ago',
    progress: 75,
  },
  {
    id: '2',
    title: 'Employment Dispute',
    client: 'Smith Attorneys',
    status: 'urgent' as const,
    billingModel: 'time-based' as const,
    amount: 8500,
    dueDate: '2025-01-30',
    lastActivity: '1 day ago',
    progress: 40,
  },
  {
    id: '3',
    title: 'Quick Opinion - Property Law',
    client: 'Johnson & Associates',
    status: 'pending' as const,
    billingModel: 'quick-opinion' as const,
    amount: 2500,
    lastActivity: '3 days ago',
  },
  {
    id: '4',
    title: 'Corporate Restructuring',
    client: 'Davis Legal',
    status: 'completed' as const,
    billingModel: 'brief-fee' as const,
    amount: 25000,
    lastActivity: '1 week ago',
  },
];

const mockInvoice = {
  id: 'inv-1',
  invoice_number: 'INV-2025-0043',
  total_amount: 15000,
  amount_paid: 0,
  outstanding_balance: 15000,
};

/**
 * MobileDashboard Component
 * 
 * Features:
 * - Quick stats overview
 * - Mobile quick actions menu
 * - Recent matters with swipe actions
 * - All mobile modals integrated
 * - Pull-to-refresh functionality
 * - Optimized for thumb navigation
 * 
 * @example
 * ```tsx
 * <MobileDashboard />
 * ```
 */
export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  className,
}) => {
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    // Simulate data refresh
    console.log('Refreshing dashboard data...');
  };

  // Quick action handlers
  const handleRecordPayment = () => {
    setShowPaymentModal(true);
  };

  const handleLogDisbursement = () => {
    setShowDisbursementModal(true);
  };

  const handleSendInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleLogTime = () => {
    // TODO: Implement time logging modal
    console.log('Log time action');
  };

  const handleLinkDocument = () => {
    // TODO: Implement document linking
    console.log('Link document action');
  };

  const handleQuickCall = () => {
    // TODO: Implement quick call functionality
    console.log('Quick call action');
  };

  // Matter action handlers
  const handleViewMatter = (matterId: string) => {
    console.log('View matter:', matterId);
  };

  const handleEditMatter = (matterId: string) => {
    console.log('Edit matter:', matterId);
  };

  const handleInvoiceMatter = (matterId: string) => {
    console.log('Invoice matter:', matterId);
    setShowInvoiceModal(true);
  };

  const handleMoreActions = (matterId: string) => {
    console.log('More actions for matter:', matterId);
  };

  return (
    <MobilePageWrapper
      title="Dashboard"
      subtitle="Welcome back"
      onRefresh={handleRefresh}
      className={className}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-4 border border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Revenue</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatRand(mockStats.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">+12% this month</p>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-4 border border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Invoices</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {mockStats.pendingInvoices}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">pending</p>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-4 border border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-mpondo-gold-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Matters</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {mockStats.activeMatters}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">active</p>
          </div>

          <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-4 border border-neutral-200 dark:border-metallic-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Hours</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {mockStats.hoursLogged}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">this week</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-metallic-gray-800 rounded-xl p-4 border border-neutral-200 dark:border-metallic-gray-700">
          <MobileQuickActionsMenu
            onRecordPayment={handleRecordPayment}
            onLogDisbursement={handleLogDisbursement}
            onSendInvoice={handleSendInvoice}
            onLogTime={handleLogTime}
            onLinkDocument={handleLinkDocument}
            onQuickCall={handleQuickCall}
          />
        </div>

        {/* Urgent Matters Alert */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Urgent Matter Requires Attention
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Employment Dispute - Due in 3 days
              </p>
            </div>
          </div>
        </div>

        {/* Recent Matters */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Matters
            </h2>
            <button className="text-sm text-mpondo-gold-600 dark:text-mpondo-gold-400 font-medium">
              View All
            </button>
          </div>

          <MobileMatterList
            matters={mockMatters}
            onView={handleViewMatter}
            onEdit={handleEditMatter}
            onInvoice={handleInvoiceMatter}
            onMoreActions={handleMoreActions}
          />
        </div>

        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                Payment Received
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                {formatRand(15000)} from Wilson & Partners
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modals */}
      <MobileRecordPaymentModal
        isOpen={showPaymentModal}
        invoice={mockInvoice}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          console.log('Payment recorded successfully');
        }}
      />

      <MobileLogDisbursementModal
        isOpen={showDisbursementModal}
        matterId="1"
        onClose={() => setShowDisbursementModal(false)}
        onSuccess={() => {
          console.log('Disbursement logged successfully');
        }}
      />

      <MobileSendInvoiceModal
        isOpen={showInvoiceModal}
        matterId="1"
        onClose={() => setShowInvoiceModal(false)}
        onSuccess={() => {
          console.log('Invoice sent successfully');
        }}
      />
    </MobilePageWrapper>
  );
};