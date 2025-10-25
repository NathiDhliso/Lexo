import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Clock, 
  AlertTriangle,
  AlertCircle,
  Eye,
  Search,
  Edit,
  Undo2,
  Trash2,
  Download,
  Archive,
  DollarSign,
  Bell,
  TrendingUp,
  FileText,
  Info,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, Button, CardHeader } from '../components/design-system/components';
import { SkeletonMatterCard } from '../components/design-system/components';
import { MatterDetailModal } from '../components/matters/MatterDetailModal';
import { EditMatterModal } from '../components/matters/EditMatterModal';
import { NewRequestCard } from '../components/matters/NewRequestCard';
import { RequestInfoModal, DeclineMatterModal } from '../components/matters/RequestActionModals';
import { AcceptBriefModal } from '../components/matters/AcceptBriefModal';
import { RequestScopeAmendmentModal } from '../components/matters/RequestScopeAmendmentModal';
import { SimpleFeeEntryModal } from '../components/matters/SimpleFeeEntryModal';
import { QuickAddMatterModal, type QuickAddMatterData } from '../components/matters/QuickAddMatterModal';
import { NotificationBadge } from '../components/navigation/NotificationBadge';
import { BulkActionToolbar, SelectionCheckbox } from '../components/ui/BulkActionToolbar';
import { matterApiService } from '../services/api';
import { matterConversionService } from '../services/api/matter-conversion.service';
import { useAuth } from '../hooks/useAuth';
import { useSelection } from '../hooks/useSelection';
import { useConfirmation } from '../hooks/useConfirmation';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { exportToCSV, exportToPDF } from '../utils/export.utils';
import type { Matter, Page } from '../types';
import { MatterStatus } from '../types';
import { useNavigate } from 'react-router-dom';

interface MattersPageProps {
  onNavigate?: (page: Page) => void;
}

const MattersPage: React.FC<MattersPageProps> = ({ onNavigate }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'active' | 'new_requests' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // New request action modals
  const [showAcceptBriefModal, setShowAcceptBriefModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  
  // TIER 1 & TIER 2 Feature modals
  const [showScopeAmendmentModal, setShowScopeAmendmentModal] = useState(false);
  const [showSimpleFeeModal, setShowSimpleFeeModal] = useState(false);
  const [selectedMatterForAction, setSelectedMatterForAction] = useState<Matter | null>(null);

  const [matters, setMatters] = useState<Matter[]>([]);
  const [loadingMatters, setLoadingMatters] = useState(true);
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirmation();

  // Read URL parameters and apply tab/view
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const viewParam = searchParams.get('view');
    
    // Apply tab filter if provided
    if (tabParam === 'active') {
      setActiveTab('active');
    } else if (tabParam === 'new_requests') {
      setActiveTab('new_requests');
      toast('Viewing new matter requests', { icon: '📋' });
    } else if (viewParam === 'time') {
      toast('Time tracking view - showing matters with time entries', { icon: '⏱️' });
    } else if (viewParam === 'documents') {
      toast('Documents view - showing matters with documents', { icon: '📁' });
    }
  }, [searchParams]);

  const navigatePage = (page: Page) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'proforma-requests':
        navigate('/proforma-requests');
        break;
      case 'matters':
        navigate('/matters');
        break;
      case 'matter-workbench':
        // This should include a matterId, but if called directly, go to matters list
        navigate('/matters');
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'partner-approval':
        navigate('/partner-approval');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  // Load matters from API based on current user
  const fetchMatters = React.useCallback(async () => {
    if (loading || !isAuthenticated || !user?.id) return;
    setLoadingMatters(true);
    
    try {
      console.log('[MattersPage] Fetching matters for user:', user.id);
      const { data, error } = await matterApiService.getByAdvocate(user.id);
      console.log('[MattersPage] Matters response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('[MattersPage] Error fetching matters:', error);
        toast.error('Failed to load matters. Please try again.', { duration: 5000 });
        setMatters([]);
        return;
      }
      
      // Fetch associated services for each matter
      const mattersWithServices = await Promise.all(
        (data || []).map(async (matter) => {
          try {
            const { data: matterServices } = await supabase
              .from('matter_services')
              .select(`
                service_id,
                services (
                  id,
                  name,
                  description,
                  service_categories (
                    id,
                    name
                  )
                )
              `)
              .eq('matter_id', matter.id);
            
            return {
              ...matter,
              associatedServices: matterServices?.map(ms => ms.services) || []
            };
          } catch (serviceError) {
            console.error('Error fetching services for matter:', matter.id, serviceError);
            // Don't fail the whole operation, just skip services for this matter
            return {
              ...matter,
              associatedServices: []
            };
          }
        })
      );
      
      console.log('[MattersPage] Successfully loaded', mattersWithServices.length, 'matters');
      setMatters(mattersWithServices);
      
      // if (mattersWithServices.length > 0) {
      //   toast.success(`Loaded ${mattersWithServices.length} matter${mattersWithServices.length > 1 ? 's' : ''}`, { duration: 2000 });
      // }
    } catch (err) {
      console.error('[MattersPage] Unexpected error:', err);
      toast.error('Unexpected error loading matters. Please refresh the page.', { duration: 5000 });
      setMatters([]);
    } finally {
      setLoadingMatters(false);
    }
  }, [loading, isAuthenticated, user?.id]);

  React.useEffect(() => {
    fetchMatters();
  }, [fetchMatters]);

  // Refresh matters when window regains focus (user comes back from creating a matter)
  React.useEffect(() => {
    const handleFocus = () => {
      fetchMatters();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchMatters]);

  // Function to determine if a matter is high WIP inactive
  const isHighWipInactive = (matter: Matter) => {
    const wipValue = matter.wip_value || 0;
    const createdDate = new Date(matter.created_at);
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Consider high WIP if WIP > R50,000 and matter is older than 30 days
    return wipValue > 50000 && daysSinceCreation > 30;
  };

  // Function to check if matter is approaching prescription
  const isApproachingPrescription = (matter: Matter) => {
    if (!matter.created_at) return false;
    
    const createdDate = new Date(matter.created_at);
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Warn if matter is approaching 3 years (prescription period)
    // Alert when within 6 months (180 days) of prescription
    return daysSinceCreation > (3 * 365 - 180);
  };

  const filteredMatters = useMemo(() => {
    return matters.filter(matter => {
      const matchesSearch = matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           matter.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           matter.instructing_attorney.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && matter.status === MatterStatus.ACTIVE) ||
                        (activeTab === 'new_requests' && matter.status === MatterStatus.NEW_REQUEST);
      return matchesSearch && matchesTab;
    });
  }, [matters, searchTerm, activeTab]);
  
  // Count new requests
  const newRequestsCount = useMemo(() => {
    return matters.filter(m => m.status === MatterStatus.NEW_REQUEST).length;
  }, [matters]);

  // Selection management
  const {
    selectedItems,
    isSelected,
    selectedCount,
    totalCount,
    toggleSelection,
    clearSelection,
  } = useSelection({
    items: filteredMatters,
    getItemId: (matter) => matter.id,
  });

  const handleNewMatterClick = () => {
    // Open quick add modal for matters accepted over phone/email
    setShowQuickAddModal(true);
  };

  const handleQuickAddMatter = async (matterData: QuickAddMatterData) => {
    try {
      const newMatter = await matterApiService.createActiveMatter(matterData);
      setShowQuickAddModal(false);
      await fetchMatters(); // Refresh the list
      // Navigate to the matter workbench
      navigate(`/matter-workbench/${newMatter.id}`);
    } catch (error) {
      console.error('Error creating matter:', error);
      // Error toast is shown by the service
    }
  };

  const handleViewMatter = (matter: Matter) => {
    // If matter is active, route to workbench; otherwise show detail modal
    if (matter.status === 'active') {
      navigate(`/matter-workbench/${matter.id}`);
    } else {
      setSelectedMatter(matter);
      setShowDetailModal(true);
    }
  };

  const handleEditMatter = (matter: Matter) => {
    setSelectedMatter(matter);
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleSaveMatter = async () => {
    toast.success('Matter updated successfully', { duration: 3000 });
    await fetchMatters();
  };

  const handleReverseConversion = async (matter: Matter) => {
    if (!(matter as any).source_proforma_id) {
      toast.error('This matter was not created from a pro forma conversion', { duration: 4000 });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reverse the conversion for "${matter.title}"?\n\n` +
      'This will:\n' +
      '• Delete this matter permanently\n' +
      '• Restore the original pro forma request to "accepted" status\n' +
      '• Allow the pro forma to be converted again\n\n' +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    const loadingToast = toast.loading('Reversing conversion...');
    
    try {
      await matterConversionService.reverseConversion(matter.id);
      // Remove the matter from the local state
      setMatters(prev => prev.filter(m => m.id !== matter.id));
      toast.success(`Successfully reversed conversion for "${matter.title}"`, { 
        id: loadingToast,
        duration: 4000 
      });
    } catch (error) {
      console.error('Error reversing conversion:', error);
      toast.error('Failed to reverse conversion. Please try again.', { 
        id: loadingToast,
        duration: 5000 
      });
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Matters',
      message: `Are you sure you want to delete ${selectedCount} matter(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    const loadingToast = toast.loading(`Deleting ${selectedCount} matter(s)...`);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const matter of selectedItems) {
        try {
          const { error } = await supabase
            .from('matters')
            .delete()
            .eq('id', matter.id);

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Failed to delete matter ${matter.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} matter(s)`, { id: loadingToast });
        await fetchMatters();
        clearSelection();
      } else {
        toast.error('Failed to delete matters', { id: loadingToast });
      }

      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} matter(s)`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('An error occurred during bulk delete', { id: loadingToast });
    }
  };

  const handleBulkArchive = async () => {
    const confirmed = await confirm({
      title: 'Archive Matters',
      message: `Archive ${selectedCount} matter(s)? They will be moved to closed status.`,
      confirmText: 'Archive',
    });

    if (!confirmed) return;

    const loadingToast = toast.loading(`Archiving ${selectedCount} matter(s)...`);
    let successCount = 0;

    try {
      for (const matter of selectedItems) {
        try {
          await matterApiService.updateStatus(matter.id, MatterStatus.CLOSED);
          successCount++;
        } catch (error) {
          console.error(`Failed to archive matter ${matter.id}:`, error);
        }
      }

      toast.success(`Successfully archived ${successCount} matter(s)`, { id: loadingToast });
      await fetchMatters();
      clearSelection();
    } catch (error) {
      console.error('Bulk archive error:', error);
      toast.error('An error occurred during bulk archive', { id: loadingToast });
    }
  };

  const handleBulkExport = async () => {
    try {
      const exportData = selectedItems.map(matter => ({
        Title: matter.title,
        Client: matter.client_name,
        Attorney: matter.instructing_attorney,
        Status: matter.status,
        'WIP Value': matter.wip_value || 0,
        'Created Date': new Date(matter.created_at).toLocaleDateString(),
        Type: (matter as any).brief_type || '',
      }));

      const format = await confirm({
        title: 'Export Format',
        message: 'Choose export format:',
        confirmText: 'CSV',
        cancelText: 'PDF',
      });

      if (format) {
        exportToCSV(exportData, 'matters-export');
        toast.success(`Exported ${selectedCount} matter(s) to CSV`);
      } else {
        await exportToPDF(exportData, 'matters-export', 'Matters Export');
        toast.success(`Exported ${selectedCount} matter(s) to PDF`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export matters');
    }
  };

  // New Request Action Handlers
  const handleRequestInfo = async (matterId: string, message: string) => {
    try {
      // TODO: Implement email notification to attorney
      console.log('Requesting info for matter:', matterId, 'Message:', message);
      toast.success('Information request sent to attorney');
      setShowRequestInfoModal(false);
      setSelectedMatter(null);
    } catch (error) {
      console.error('Failed to request info:', error);
      toast.error('Failed to send information request');
    }
  };

  const handleDeclineMatter = async (matterId: string, reason: string) => {
    try {
      // TODO: Implement email notification to attorney
      await matterApiService.updateStatus(matterId, MatterStatus.CLOSED);
      console.log('Declining matter:', matterId, 'Reason:', reason);
      toast.success('Matter request declined');
      await fetchMatters();
      setShowDeclineModal(false);
      setSelectedMatter(null);
    } catch (error) {
      console.error('Failed to decline matter:', error);
      toast.error('Failed to decline matter request');
    }
  };

  // Path B: Accept Brief (Quick Start) Handler
  const handleAcceptBrief = async (matterId: string) => {
    try {
      await matterApiService.acceptBrief(matterId);
      toast.success('Brief accepted! Matter is now active.');
      await fetchMatters();
      setShowAcceptBriefModal(false);
      setSelectedMatter(null);
    } catch (error) {
      console.error('Failed to accept brief:', error);
      toast.error('Failed to accept brief');
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const newRequestCount = matters.filter(m => m.status === MatterStatus.NEW_REQUEST).length;
    const activeCount = matters.filter(m => m.status === MatterStatus.ACTIVE).length;
    const settledCount = matters.filter(m => m.status === MatterStatus.SETTLED).length;
    const closedCount = matters.filter(m => m.status === MatterStatus.CLOSED).length;
    const totalWIP = matters.reduce((sum, m) => sum + (m.wip_value || 0), 0);
    
    return {
      newRequestCount,
      activeCount,
      settledCount,
      closedCount,
      totalWIP
    };
  }, [matters]);

  return (
    <div className="w-full space-y-6 min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Matters</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your legal matters and cases</p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleNewMatterClick}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Matter</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {!loadingMatters && matters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">New Requests</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {stats.newRequestCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active Matters</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {stats.activeCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total WIP</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    R{stats.totalWIP.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Settled</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {stats.settledCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search matters, clients, or attorneys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-1 w-fit">
        {(['active', 'new_requests', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 theme-shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {tab === 'active' ? 'Active Matters' : tab === 'new_requests' ? 'New Requests' : 'All Matters'}
            {tab === 'new_requests' && newRequestsCount > 0 && (
              <NotificationBadge count={newRequestsCount} variant="error" size="sm" />
            )}
          </button>
        ))}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedCount}
        totalCount={totalCount}
        onClearSelection={clearSelection}
        actions={[
          {
            id: 'archive',
            label: 'Archive',
            icon: <Archive className="w-4 h-4" />,
            variant: 'secondary',
            onClick: handleBulkArchive,
          },
          {
            id: 'export',
            label: 'Export',
            icon: <Download className="w-4 h-4" />,
            variant: 'ghost',
            onClick: handleBulkExport,
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: handleBulkDelete,
            requiresConfirmation: true,
          },
        ]}
      />

      {/* Content */}
      <div className="space-y-4">
        {loadingMatters ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonMatterCard key={i} />
            ))}
          </div>
        ) : filteredMatters.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
            <Info className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {matters.length === 0 ? 'No Matters Yet' : 'No Matters Found'}
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4 max-w-lg mx-auto">
              {matters.length === 0 
                ? 'New matters will appear here when attorneys submit briefs via the firm portal.'
                : activeTab === 'active' 
                  ? 'No active matters found. Try adjusting your search or filters.' 
                  : activeTab === 'new_requests' 
                    ? 'No new matter requests at this time.' 
                    : 'No matters match your search criteria.'}
            </p>
            {matters.length === 0 && (
              <div className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-4 py-2 rounded-lg">
                <Info className="w-4 h-4" />
                <span>Tip: Share attorney registration links from the Firms page</span>
              </div>
            )}
          </div>
        ) : activeTab === 'new_requests' ? (
          // Render New Request Cards
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatters.map((matter) => (
              <NewRequestCard
                key={matter.id}
                matter={matter}
                onView={handleViewMatter}
                onSendProForma={(m) => {
                  // Path A: Send Pro Forma (navigate to pro forma page)
                  setSelectedMatter(m);
                  navigatePage('proforma-requests');
                }}
                onAcceptBrief={(m) => {
                  // Path B: Accept Brief (quick start)
                  setSelectedMatter(m);
                  setShowAcceptBriefModal(true);
                }}
                onRequestInfo={(m) => {
                  setSelectedMatter(m);
                  setShowRequestInfoModal(true);
                }}
                onDecline={(m) => {
                  setSelectedMatter(m);
                  setShowDeclineModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          // Render Regular Matter Cards
          filteredMatters.map((matter) => (
            <Card key={matter.id} variant="default" hoverable>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <SelectionCheckbox
                    checked={isSelected(matter.id)}
                    onChange={() => toggleSelection(matter.id)}
                    label={`Select ${matter.title}`}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{matter.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        matter.status === MatterStatus.NEW_REQUEST ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 animate-pulse' :
                        matter.status === MatterStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        matter.status === MatterStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        matter.status === MatterStatus.SETTLED ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
                      }`}>
                        {matter.status === MatterStatus.NEW_REQUEST ? 'NEW REQUEST' : matter.status}
                      </span>
                      
                      {/* Health Check Warning Icons */}
                      <div className="flex items-center gap-2">
                        {isHighWipInactive(matter) && (
                          <div className="group relative" title="High WIP Inactive Matter">
                            <AlertTriangle 
                              className="w-5 h-5 text-amber-500 cursor-help"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg theme-theme-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">High WIP Inactive</div>
                              <div className="text-xs text-amber-700 dark:text-amber-400">
                                WIP: R{(matter.wip_value || 0).toLocaleString()} • No recent activity
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isApproachingPrescription(matter) && (
                          <div className="group relative" title="Approaching Prescription">
                            <Clock 
                              className="w-5 h-5 text-amber-600 cursor-help"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg theme-theme-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Prescription Warning</div>
                              <div className="text-xs text-amber-700 dark:text-amber-400">
                                Matter approaching 3-year prescription period
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{matter.client_name}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Attorney:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{matter.instructing_attorney}</span>
                      </div>
                      {matter.status === MatterStatus.NEW_REQUEST && (matter as any).instructing_firm && (
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Firm:</span>
                          <span className="ml-2 font-medium text-purple-700 dark:text-purple-300">{(matter as any).instructing_firm}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{(matter as any).brief_type}</span>
                      </div>
                    </div>
                    
                    {/* Associated Services */}
                    {(matter as any).associatedServices && (matter as any).associatedServices.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-metallic-gray-700">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Services:</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(matter as any).associatedServices.map((service: any, index: number) => (
                            <span
                              key={service.id || index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                              title={service.description || service.name}
                            >
                              {service.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Basic Financial Info */}
                {matter.wip_value && matter.wip_value > 0 && (
                  <div className="mb-4 p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        R{(matter.wip_value || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Work in Progress</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewMatter(matter)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMatter(matter)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  {/* Reverse Conversion Button - only show for matters converted from pro forma */}
                  {(matter as any).source_proforma_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReverseConversion(matter)}
                      className="flex items-center gap-2 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 dark:hover:border-amber-600"
                      title="Reverse conversion back to pro forma"
                    >
                      <Undo2 className="w-4 h-4" />
                      Reverse
                    </Button>
                  )}

                  {/* 🆕 TIER 2: Scope Amendment Button - for Path A matters (from pro forma) */}
                  {matter.status === MatterStatus.ACTIVE && (matter as any).source_proforma_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMatterForAction(matter);
                        setShowScopeAmendmentModal(true);
                      }}
                      className="flex items-center gap-2 text-judicial-blue-700 dark:text-judicial-blue-400 border-judicial-blue-300 dark:border-judicial-blue-700 hover:bg-judicial-blue-50 dark:hover:bg-judicial-blue-950/30"
                      title="Request scope amendment for additional work"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Scope Amendment
                    </Button>
                  )}

                  {/* 🆕 TIER 2: Simple Fee Entry Button - for Path B matters (accepted brief) */}
                  {matter.status === MatterStatus.ACTIVE && !(matter as any).source_proforma_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMatterForAction(matter);
                        setShowSimpleFeeModal(true);
                      }}
                      className="flex items-center gap-2 text-mpondo-gold-700 dark:text-mpondo-gold-400 border-mpondo-gold-300 dark:border-mpondo-gold-700 hover:bg-mpondo-gold-50 dark:hover:bg-mpondo-gold-950/30"
                      title="Quick fee entry for brief work"
                    >
                      <DollarSign className="w-4 h-4" />
                      Fee Entry
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MatterDetailModal
        matter={selectedMatter}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditMatter}
      />

      <EditMatterModal
        matter={selectedMatter}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveMatter}
      />

      {/* New Request Action Modals */}
      <QuickAddMatterModal
        isOpen={showQuickAddModal}
        onConfirm={handleQuickAddMatter}
        onClose={() => setShowQuickAddModal(false)}
      />

      <AcceptBriefModal
        isOpen={showAcceptBriefModal}
        matter={selectedMatter}
        onConfirm={handleAcceptBrief}
        onClose={() => {
          setShowAcceptBriefModal(false);
          setSelectedMatter(null);
        }}
      />

      <RequestInfoModal
        isOpen={showRequestInfoModal}
        matter={selectedMatter}
        onSubmit={handleRequestInfo}
        onClose={() => {
          setShowRequestInfoModal(false);
          setSelectedMatter(null);
        }}
      />

      <DeclineMatterModal
        isOpen={showDeclineModal}
        matter={selectedMatter}
        onConfirm={handleDeclineMatter}
        onClose={() => {
          setShowDeclineModal(false);
          setSelectedMatter(null);
        }}
      />

      {/* 🆕 TIER 2: Scope Amendment Modal */}
      <RequestScopeAmendmentModal
        isOpen={showScopeAmendmentModal}
        matter={selectedMatterForAction}
        onClose={() => {
          setShowScopeAmendmentModal(false);
          setSelectedMatterForAction(null);
        }}
        onSuccess={() => {
          fetchMatters();
          toast.success('Scope amendment request sent to attorney');
        }}
      />

      {/* 🆕 TIER 2: Simple Fee Entry Modal */}
      <SimpleFeeEntryModal
        isOpen={showSimpleFeeModal}
        matter={selectedMatterForAction}
        onClose={() => {
          setShowSimpleFeeModal(false);
          setSelectedMatterForAction(null);
        }}
        onSuccess={() => {
          fetchMatters();
          toast.success('Fee note created successfully');
        }}
      />
    </div>
  );
};

export default MattersPage;