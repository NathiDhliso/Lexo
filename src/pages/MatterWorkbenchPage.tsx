/**
 * Matter Workbench Page - True WIP workspace for active matters
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, Receipt, Briefcase, AlertCircle, FolderOpen, DollarSign, CheckCircle } from 'lucide-react';
import { Button, Card } from '../components/design-system/components';
import { matterApiService } from '../services/api';
import { proformaRequestService } from '../services/api/proforma-request.service';
import { useMatterBillingStrategy } from '../hooks/useBillingStrategy';
import { BillingModel } from '../types/billing-strategy.types';
import { toast } from 'react-hot-toast';
import type { Matter } from '../types';

// Workbench Components
import { WorkbenchOverview } from '../components/matters/workbench/WorkbenchOverview';
import { WorkbenchTimeTab } from '../components/matters/workbench/WorkbenchTimeTab';
import { WorkbenchExpensesTab } from '../components/matters/workbench/WorkbenchExpensesTab';
import { WorkbenchServicesTab } from '../components/matters/workbench/WorkbenchServicesTab';
import { WorkbenchAmendmentsTab } from '../components/matters/workbench/WorkbenchAmendmentsTab';
import { WorkbenchInvoicingTab } from '../components/matters/workbench/WorkbenchInvoicingTab';
import { PathAActions } from '../components/matters/workbench/PathAActions';
import { PathBActions } from '../components/matters/workbench/PathBActions';
import { DocumentsTab } from '../components/documents/DocumentsTab';
import { FeeMilestonesWidget } from '../components/matters/workbench/FeeMilestonesWidget';
import { AdvancedTimeTrackingSection } from '../components/matters/workbench/AdvancedTimeTrackingSection';

// Modals
import { TimeEntryModal } from '../components/time-entries/TimeEntryModal';
import { QuickDisbursementModal } from '../components/expenses/QuickDisbursementModal';
import { LogServiceModal } from '../components/services/LogServiceModal';
import { SimpleFeeEntryModal } from '../components/matters/SimpleFeeEntryModal';
import { BudgetComparisonWidget } from '../components/matters/workbench/BudgetComparisonWidget';

type TabType = 'overview' | 'time' | 'expenses' | 'services' | 'milestones' | 'amendments' | 'documents' | 'invoicing';

const MatterWorkbenchPage: React.FC = () => {
  const { matterId } = useParams<{ matterId: string }>();
  const navigate = useNavigate();

  const [matter, setMatter] = useState<Matter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPathA, setIsPathA] = useState(false);
  const [originalBudget, setOriginalBudget] = useState(0);
  // TODO: Fetch and calculate these from amendments table when viewing amendments tab
  const [amendmentTotal] = useState(0);
  const [amendmentCount] = useState(0);

  // Get billing strategy for adaptive UI
  const billingStrategy = useMatterBillingStrategy(matter);
  const billingModel = (matter as any)?.billing_model || BillingModel.BRIEF_FEE;

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSimpleFeeModal, setShowSimpleFeeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  useEffect(() => {
    if (matterId) {
      loadMatterData();
    }
  }, [matterId]);

  const loadMatterData = async () => {
    if (!matterId) return;
    try {
      setLoading(true);
      const { data, error } = await matterApiService.getById(matterId);
      if (error || !data) {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Matter not found';
        throw new Error(errorMessage);
      }
      setMatter(data);
      const sourceProFormaId = (data as any).source_proforma_id;
      setIsPathA(!!sourceProFormaId);
      if (sourceProFormaId) {
        await loadProFormaData(sourceProFormaId);
      }
    } catch (error) {
      console.error('Error loading matter:', error);
      toast.error('Failed to load matter');
      navigate('/matters');
    } finally {
      setLoading(false);
    }
  };

  const loadProFormaData = async (proFormaId: string) => {
    try {
      const proforma = await proformaRequestService.getById(proFormaId);
      if (proforma) setOriginalBudget(proforma.estimated_amount || 0);
    } catch (error) {
      console.error('Error loading pro forma:', error);
    }
  };

  const handleModalSuccess = () => {
    loadMatterData();
  };

  const handleCloseBudgetModal = () => {
    setShowBudgetModal(false);
    // Refresh data in case budget calculations need updating
    loadMatterData();
  };

  if (loading || !matter) return <div>Loading...</div>;

  // Determine which tabs to show based on billing model and strategy
  const shouldShowTimeTracking = billingStrategy.shouldShowTimeTracking();
  const shouldShowMilestones = billingModel === BillingModel.BRIEF_FEE;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    // Show time tab based on billing strategy
    ...(shouldShowTimeTracking ? [{ id: 'time', label: 'Time', icon: Clock }] : []),
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'services', label: 'Services', icon: FileText },
    // Show milestones for brief fee matters
    ...(shouldShowMilestones ? [{ id: 'milestones', label: 'Milestones', icon: CheckCircle }] : []),
    ...(isPathA ? [{ id: 'amendments', label: 'Amendments', icon: AlertCircle }] : []),
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'invoicing', label: 'Invoicing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-metallic-gray-900">
      <div className="bg-white dark:bg-metallic-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/matters')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{matter.title}</h1>
                <span className="text-sm px-2 py-1 rounded bg-blue-100">
                  {isPathA ? 'Path A' : 'Path B'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs">WIP</p>
              <p className="text-lg font-bold">R{(matter.wip_value || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
        {isPathA ? (
          <PathAActions
            matterId={matter.id}
            onLogTime={() => setShowTimeModal(true)}
            onLogExpense={() => setShowExpenseModal(true)}
            onLogService={() => setShowServiceModal(true)}
            onRequestAmendment={() => setActiveTab('amendments')}
            onViewBudget={() => setShowBudgetModal(true)}
          />
        ) : (
          <PathBActions
            matterId={matter.id}
            onSimpleFeeEntry={() => setShowSimpleFeeModal(true)}
            onLogTime={() => setShowTimeModal(true)}
            onLogExpense={() => setShowExpenseModal(true)}
          />
        )}

        <div className="flex gap-4 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={activeTab === tab.id ? 'border-b-2 border-blue-600 pb-2' : 'pb-2'}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <Card>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <WorkbenchOverview matter={matter} isPathA={isPathA} originalBudget={originalBudget} amendmentTotal={amendmentTotal} amendmentCount={amendmentCount} />
                
                {/* Show milestones for brief fee matters */}
                {shouldShowMilestones && (
                  <FeeMilestonesWidget 
                    matter={matter} 
                    onMilestoneComplete={handleModalSuccess}
                  />
                )}
                
                {/* Show collapsible time tracking for brief fee matters */}
                {shouldShowMilestones && (
                  <AdvancedTimeTrackingSection 
                    matter={matter}
                    onTimeEntryAdded={handleModalSuccess}
                  />
                )}
              </div>
            )}
            {activeTab === 'time' && shouldShowTimeTracking && <WorkbenchTimeTab matterId={matter.id} matterTitle={matter.title} />}
            {activeTab === 'expenses' && <WorkbenchExpensesTab matterId={matter.id} />}
            {activeTab === 'services' && <WorkbenchServicesTab matterId={matter.id} />}
            {activeTab === 'milestones' && shouldShowMilestones && (
              <FeeMilestonesWidget 
                matter={matter} 
                onMilestoneComplete={handleModalSuccess}
              />
            )}
            {activeTab === 'amendments' && isPathA && <WorkbenchAmendmentsTab matter={matter} />}
            {activeTab === 'documents' && <DocumentsTab matterId={matter.id} />}
            {activeTab === 'invoicing' && <WorkbenchInvoicingTab matter={matter} />}
          </div>
        </Card>
      </div>

      {showTimeModal && <TimeEntryModal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)} matterId={matter.id} matterTitle={matter.title} onSave={handleModalSuccess} />}
      {showExpenseModal && <QuickDisbursementModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} matterId={matter.id} onSuccess={handleModalSuccess} />}
      {showServiceModal && <LogServiceModal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} matterId={matter.id} matterTitle={matter.title} onSave={handleModalSuccess} />}
      {showSimpleFeeModal && <SimpleFeeEntryModal isOpen={showSimpleFeeModal} onClose={() => setShowSimpleFeeModal(false)} matter={matter} onSuccess={handleModalSuccess} />}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-metallic-gray-900 rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Budget Comparison</h2>
            <BudgetComparisonWidget originalBudget={originalBudget} amendmentTotal={amendmentTotal} wipValue={matter.wip_value || 0} amendmentCount={amendmentCount} />
            <Button onClick={handleCloseBudgetModal} className="mt-4">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatterWorkbenchPage;
