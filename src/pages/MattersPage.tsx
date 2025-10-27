import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Clock, 
  AlertTriangle,
  AlertCircle,
  Eye,
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
  CheckCircle,
  X,
  Phone
} from 'lucide-react';
import { Card, CardContent, Button, CardHeader } from '../components/design-system/components';
import { SkeletonMatterCard } from '../components/design-system/components';
import { MatterModal, type MatterMode } from '../components/modals/matter/MatterModal';
import { NewRequestCard } from '../components/matters/NewRequestCard';
import { RequestInfoModal, DeclineMatterModal } from '../components/matters/RequestActionModals';
import { RequestScopeAmendmentModal } from '../components/matters/RequestScopeAmendmentModal';
import { SimpleFeeEntryModal } from '../components/matters/SimpleFeeEntryModal';
import { QuickBriefCaptureModal } from '../components/matters/quick-brief/QuickBriefCaptureModal';
import { MatterSearchBar } from '../components/matters/MatterSearchBar';
import { AdvancedFiltersModal } from '../components/matters/AdvancedFiltersModal';
import { NotificationBadge } from '../components/navigation/NotificationBadge';
import { BulkActionToolbar, SelectionCheckbox } from '../components/ui/BulkActionToolbar';
import { matterApiService } from '../services/api';
import { matterConversionService } from '../services/api/matter-conversion.service';
import { matterSearchService, type MatterSearchParams } from '../services/api/matter-search.service';
import { useAuth } from '../hooks/useAuth';
import { useSelection } from '../hooks/useSelection';
import { useConfirmation } from '../hooks/useConfirmation';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
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
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  
  // Consolidated modal state
  const [matterModalMode, setMatterModalMode] = useState<MatterMode | null>(null);
  const [showMatterModal, setShowMatterModal] = useState(false);
  
  // Other modals (not yet consolidated)
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showQuickBriefModal, setShowQuickBriefModal] = useState(false);
  const [firms, setFirms] = useState<any[]>([]);
  
  // TIER 1 & TIER 2 Feature modals
  const [showScopeAmendmentModal, setShowScopeAmendmentModal] = useState(false);
  const [showSimpleFeeModal, setShowSimpleFeeModal] = useState(false);
  const [selectedMatterForAction, setSelectedMatterForAction] = useState<Matter | null>(null);
  const [archivingMatterId, setArchivingMatterId] = useState<string | null>(null);

  // Search and filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<MatterSearchParams>({
    sort_by: 'created_at',
    sort_order: 'desc',
    include_archived: false
  });
  const [filterOptions, setFilterOptions] = useState({
    practice_areas: [] as string[],
    matter_types: [] as string[],
    attorney_firms: [] as string[],
    statuses: [] as MatterStatus[]
  });
  const [searchResultCount, setSearchResultCount] = useState<number | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const [matters, setMatters] = useState<Matter[]>([]);
  const [loadingMatters, setLoadingMatters] = useState(true);
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  const { update: optimisticUpdate } = useOptimisticUpdate<Matter[]>();

  // Keyboard shortcuts (defined after handlers)
  const keyboardShortcutsEnabled = !showMatterModal && !showRequestInfoModal && !showDeclineModal;

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

  // Load filter options
  const loadFilterOptions = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const options = await matterSearchService.getFilterOptions(user.id);
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, [user?.id]);

  // Load matters from API based on current user and search filters
  const fetchMatters = React.useCallback(async () => {
    if (loading || !isAuthenticated || !user?.id) return;
    setLoadingMatters(true);
    setIsSearching(true);
    
    try {
      console.log('[MattersPage] Fetching matters for user:', user.id);
      
      // Use search service if filters are applied
      const hasFilters = searchFilters.query || 
                        searchFilters.practice_area || 
                        searchFilters.matter_type ||
                        searchFilters.status ||
                        searchFilters.date_from ||
                        searchFilters.date_to ||
                        searchFilters.attorney_firm ||
                        searchFilters.fee_min ||
                        searchFilters.fee_max ||
                        searchFilters.include_archived;

      if (hasFilters) {
        const searchResult = await matterSearchService.search(user.id, searchFilters);
        console.log('[MattersPage] Search results:', searchResult);
        setMatters(searchResult.matters);
        setSearchResultCount(searchResult.total_count);
      } else {
        // Use regular API for unfiltered results
        const { data, error } = await matterApiService.getByAdvocate(user.id);
        console.log('[MattersPage] Matters response:', { data, error, count: data?.length });
        
        if (error) {
          console.error('[MattersPage] Error fetching matters:', error);
          toast.error('Failed to load matters. Please try again.', { duration: 5000 });
          setMatters([]);
          setSearchResultCount(0);
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
        setSearchResultCount(mattersWithServices.length);
      }
    } catch (err) {
      console.error('[MattersPage] Unexpected error:', err);
      toast.error('Unexpected error loading matters. Please refresh the page.', { duration: 5000 });
      setMatters([]);
      setSearchResultCount(0);
    } finally {
      setLoadingMatters(false);
      setIsSearching(false);
    }
  }, [loading, isAuthenticated, user?.id, searchFilters]);

  // Load firms for Quick Brief Capture
  const loadFirms = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .eq('advocate_id', user.id)
        .order('name');
      
      if (!error && data) {
        setFirms(data);
      }
    } catch (error) {
      console.error('Error loading firms:', error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadFilterOptions();
    loadFirms();
  }, [loadFilterOptions, loadFirms]);

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

  // Search handlers
  const handleSearch = React.useCallback((query: string) => {
    setSearchFilters(prev => ({ ...prev, query: query || undefined }));
  }, []);

  const handleApplyFilters = React.useCallback((filters: MatterSearchParams) => {
    setSearchFilters(filters);
  }, []);

  const handleExportCSV = async () => {
    if (!user?.id) return;
    
    try {
      const csvContent = await matterSearchService.exportToCSV(user.id, searchFilters);
      matterSearchService.downloadCSV(csvContent, `matters-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting matters:', error);
    }
  };

  // Archive handlers
  const handleArchiveMatter = async (matter: Matter) => {
    if (!user?.id) {
      console.error('[handleArchiveMatter] No user ID available');
      toast.error('User not authenticated');
      return;
    }

    console.log('[handleArchiveMatter] Starting archive for matter:', matter.id);

    const confirmed = await confirm({
      title: 'Archive Matter',
      message: `Are you sure you want to archive "${matter.title}"? You can unarchive it later if needed.`,
      confirmText: 'Archive',
    });

    if (!confirmed) {
      console.log('[handleArchiveMatter] User cancelled archive');
      return;
    }

    const reason = window.prompt('Optional: Enter a reason for archiving this matter');
    console.log('[handleArchiveMatter] Archive reason:', reason || 'none');
    
    // Set loading state
    setArchivingMatterId(matter.id);

    // Optimistic update: immediately update UI
    const currentMatters = [...matters];
    const optimisticMatters = matters.map(m =>
      m.id === matter.id
        ? { ...m, is_archived: true, archived_at: new Date().toISOString(), archived_by: user.id }
        : m
    );

    try {
      await optimisticUpdate(
        currentMatters,
        optimisticMatters,
        setMatters,
        {
          onUpdate: async () => {
            const success = await matterSearchService.archiveMatter(matter.id, user.id, reason || undefined);
            if (!success) {
              throw new Error('Archive operation failed');
            }
          },
          successMessage: 'Matter archived successfully',
          errorMessage: 'Failed to archive matter',
          onSuccess: () => {
            console.log('[handleArchiveMatter] Archive successful');
          },
        }
      );
    } finally {
      setArchivingMatterId(null);
    }
  };

  const handleUnarchiveMatter = async (matter: Matter) => {
    if (!user?.id) {
      console.error('[handleUnarchiveMatter] No user ID available');
      toast.error('User not authenticated');
      return;
    }

    console.log('[handleUnarchiveMatter] Starting unarchive for matter:', matter.id);

    const confirmed = await confirm({
      title: 'Unarchive Matter',
      message: `Restore "${matter.title}" to active matters?`,
      confirmText: 'Unarchive',
    });

    if (!confirmed) {
      console.log('[handleUnarchiveMatter] User cancelled unarchive');
      return;
    }

    // Set loading state
    setArchivingMatterId(matter.id);

    // Optimistic update: immediately update UI
    const currentMatters = [...matters];
    const optimisticMatters = matters.map(m =>
      m.id === matter.id
        ? { ...m, is_archived: false, archived_at: undefined, archived_by: undefined }
        : m
    );

    try {
      await optimisticUpdate(
        currentMatters,
        optimisticMatters,
        setMatters,
        {
          onUpdate: async () => {
            const success = await matterSearchService.unarchiveMatter(matter.id, user.id);
            if (!success) {
              throw new Error('Unarchive operation failed');
            }
          },
          successMessage: 'Matter unarchived successfully',
          errorMessage: 'Failed to unarchive matter',
          onSuccess: () => {
            console.log('[handleUnarchiveMatter] Unarchive successful');
          },
        }
      );
    } finally {
      setArchivingMatterId(null);
    }
  };

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
      // Search is now handled by MatterSearchBar component via searchFilters
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && matter.status === MatterStatus.ACTIVE) ||
                        (activeTab === 'new_requests' && matter.status === MatterStatus.NEW_REQUEST);
      return matchesTab;
    });
  }, [matters, activeTab]);
  
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
    setMatterModalMode('quick-add');
    setSelectedMatter(null);
    setShowMatterModal(true);
  };

  // Setup keyboard shortcuts after handlers are defined
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COMMON_SHORTCUTS.NEW,
        handler: handleNewMatterClick,
        description: 'Create new matter',
      },
      {
        ...COMMON_SHORTCUTS.REFRESH,
        handler: () => fetchMatters(),
        description: 'Refresh matters list',
      },
      {
        ...COMMON_SHORTCUTS.SEARCH,
        handler: () => {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          searchInput?.focus();
        },
        description: 'Focus search',
      },
    ],
    enabled: keyboardShortcutsEnabled,
  });

  const handleMatterModalSuccess = async (matter: Matter) => {
    setShowMatterModal(false);
    setMatterModalMode(null);
    setSelectedMatter(null);
    await fetchMatters(); // Refresh the list
    
    // Navigate to workbench for newly created matters
    if (matterModalMode === 'quick-add' || matterModalMode === 'create') {
      navigate(`/matter-workbench/${matter.id}`);
    }
  };

  const handleViewMatter = (matter: Matter) => {
    // If matter is active, route to workbench; otherwise show detail modal
    if (matter.status === 'active') {
      navigate(`/matter-workbench/${matter.id}`);
    } else {
      setSelectedMatter(matter);
      setMatterModalMode('detail');
      setShowMatterModal(true);
    }
  };

  const handleEditMatter = (matter: Matter) => {
    setSelectedMatter(matter);
    setMatterModalMode('edit');
    setShowMatterModal(true);
  };

  const handleMatterModalEdit = (matter: Matter) => {
    // Called when user clicks edit from within the detail view
    setSelectedMatter(matter);
    setMatterModalMode('edit');
    // Modal stays open, just switches mode
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
  const handleAcceptBriefClick = (matter: Matter) => {
    setSelectedMatter(matter);
    setMatterModalMode('accept-brief');
    setShowMatterModal(true);
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowQuickBriefModal(true)}
            className="flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>Quick Brief</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={handleNewMatterClick}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Matter</span>
          </Button>
        </div>
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

      {/* Search Bar with Advanced Filters */}
      <MatterSearchBar
        onSearch={handleSearch}
        onAdvancedFilters={() => setShowAdvancedFilters(true)}
        resultCount={searchResultCount}
        isLoading={isSearching}
      />

      {/* Active Filter Chips */}
      {(searchFilters.practice_area || searchFilters.matter_type || searchFilters.status || 
        searchFilters.attorney_firm || searchFilters.date_from || searchFilters.date_to ||
        searchFilters.fee_min || searchFilters.fee_max || searchFilters.include_archived) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchFilters.practice_area && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Practice: {searchFilters.practice_area}
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, practice_area: undefined }))}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchFilters.matter_type && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Type: {searchFilters.matter_type}
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, matter_type: undefined }))}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchFilters.status && searchFilters.status.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Status: {searchFilters.status.join(', ')}
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, status: undefined }))}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchFilters.attorney_firm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Firm: {searchFilters.attorney_firm}
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, attorney_firm: undefined }))}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchFilters.include_archived && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Including Archived
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, include_archived: false }))}
                className="ml-2 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => setSearchFilters({ sort_by: 'created_at', sort_order: 'desc', include_archived: false })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      )}

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
                  handleAcceptBriefClick(m);
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
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          matter.status === MatterStatus.NEW_REQUEST ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 animate-pulse' :
                          matter.status === MatterStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          matter.status === MatterStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          matter.status === MatterStatus.SETTLED ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
                        }`}>
                          {matter.status === MatterStatus.NEW_REQUEST ? 'NEW REQUEST' : matter.status}
                        </span>
                        {matter.is_archived && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
                            <Archive className="w-3 h-3 mr-1" />
                            ARCHIVED
                          </span>
                        )}
                      </div>
                      
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

                  {/* Archive/Unarchive Button */}
                  {matter.is_archived ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnarchiveMatter(matter)}
                      disabled={archivingMatterId === matter.id}
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                      title="Unarchive this matter"
                    >
                      {archivingMatterId === matter.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          Unarchiving...
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4" />
                          Unarchive
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchiveMatter(matter)}
                      disabled={archivingMatterId === matter.id}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950/30"
                      title="Archive this matter"
                    >
                      {archivingMatterId === matter.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4" />
                          Archive
                        </>
                      )}
                    </Button>
                  )}

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

      {/* Consolidated Matter Modal */}
      {showMatterModal && matterModalMode && (
        <MatterModal
          mode={matterModalMode}
          isOpen={showMatterModal}
          onClose={() => {
            setShowMatterModal(false);
            setMatterModalMode(null);
            setSelectedMatter(null);
          }}
          matter={selectedMatter}
          matterId={selectedMatter?.id}
          onSuccess={handleMatterModalSuccess}
          onEdit={handleMatterModalEdit}
        />
      )}

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

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={searchFilters}
        filterOptions={filterOptions}
      />

      {/* Quick Brief Capture Modal (Path B) */}
      <QuickBriefCaptureModal
        isOpen={showQuickBriefModal}
        onClose={() => setShowQuickBriefModal(false)}
        onSuccess={(matterId) => {
          fetchMatters();
          navigate(`/matter-workbench/${matterId}`);
        }}
        firms={firms}
      />
    </div>
  );
};

export default MattersPage;