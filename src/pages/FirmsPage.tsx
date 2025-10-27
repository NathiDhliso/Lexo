import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Search,
  Trash2,
  Download,
  Archive
} from 'lucide-react';
import { Card, CardContent, Button } from '../components/design-system/components';
import { SkeletonFirmCard } from '../components/design-system/components';
import { BulkActionToolbar } from '../components/ui/BulkActionToolbar';
import { useAuth } from '../hooks/useAuth';
import { useSelection } from '../hooks/useSelection';
import { useConfirmation } from '../hooks/useConfirmation';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { exportToCSV, exportToPDF } from '../utils/export.utils';
import type { Firm } from '../types/financial.types';
import { useNavigate } from 'react-router-dom';
import { FirmCard, AddAttorneyModal, CreateFirmModal } from '../components/firms';

const FirmsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAttorneyModal, setShowAddAttorneyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFirmForAttorney, setSelectedFirmForAttorney] = useState<Firm | null>(null);

  const [firms, setFirms] = useState<Firm[]>([]);
  const [loadingFirms, setLoadingFirms] = useState(true);
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirmation();

  // Log component mount
  useEffect(() => {
    console.log('[FirmsPage] Component mounted/rendered');
    return () => console.log('[FirmsPage] Component unmounting');
  }, []);

  // Read URL parameters and apply view/action
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const actionParam = searchParams.get('action');
    
    // Apply view filter if provided
    if (viewParam === 'attorneys') {
      // Could filter to show only firms with attorneys
      toast('Viewing all attorneys across firms', { icon: '👥' });
    } else if (viewParam === 'pending') {
      // Could filter to show pending invitations
      toast('Viewing pending attorney invitations', { icon: '⏳' });
    }
    
    // Trigger add attorney modal if requested
    if (actionParam === 'invite') {
      setShowAddAttorneyModal(true);
      toast('Add a new attorney to your firms', { 
        duration: 4000,
        icon: '👋' 
      });
      // Remove the action param from URL
      searchParams.delete('action');
      window.history.replaceState({}, '', `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
    }
  }, [searchParams, firms]);

  // Load firms from database
  const fetchFirms = useCallback(async () => {
    console.log('[FirmsPage] fetchFirms called. loading:', loading, 'isAuthenticated:', isAuthenticated);
    if (loading || !isAuthenticated) {
      console.log('[FirmsPage] Skipping fetch - auth not ready');
      return;
    }
    setLoadingFirms(true);
    
    try {
      console.log('[FirmsPage] Fetching firms from database...');
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .order('firm_name', { ascending: true });
      
      if (error) {
        console.error('[FirmsPage] Error fetching firms:', error);
        toast.error('Failed to load firms. Please try again.');
        setFirms([]);
        return;
      }
      
      console.log('[FirmsPage] Successfully fetched firms:', data?.length || 0, 'firms');
      setFirms(data || []);
    } catch (err) {
      console.error('[FirmsPage] Unexpected error:', err);
      toast.error('Unexpected error loading firms. Please refresh the page.');
      setFirms([]);
    } finally {
      setLoadingFirms(false);
    }
  }, []); // Remove dependencies to prevent re-creation

  useEffect(() => {
    // Only fetch when auth is ready
    if (!loading && isAuthenticated) {
      fetchFirms();
    }
  }, [loading, isAuthenticated, fetchFirms]);

  // Filter firms based on search and tab
  const filteredFirms = useMemo(() => {
    return firms.filter(firm => {
      const matchesSearch = firm.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           firm.attorney_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (firm.email && firm.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && firm.status === 'active');
      return matchesSearch && matchesTab;
    });
  }, [firms, searchTerm, activeTab]);

  // Transform firm data to include attorney information
  const getAttorneysForFirm = (firm: Firm) => {
    if (!firm.attorney_name) return [];
    
    // Extract initials from attorney name
    const nameParts = firm.attorney_name.trim().split(' ');
    const initials = nameParts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
    
    return [{
      id: firm.id,
      initials: initials,
      name: firm.attorney_name,
      role: 'Attorney',
      isActive: firm.status === 'active'
    }];
  };

  // Selection management
  const {
    selectedItems,
    selectedCount,
    totalCount,
    clearSelection,
  } = useSelection({
    items: filteredFirms,
    getItemId: (firm) => firm.id,
  });

  const handleNewFirmClick = () => {
    console.log('[FirmsPage] New Firm button clicked');
    setShowCreateModal(true);
  };

  const handleAddAttorney = (firm: Firm) => {
    setSelectedFirmForAttorney(firm);
    setShowAddAttorneyModal(true);
  };

  const handleManageFirm = (firm: Firm) => {
    // TODO: Navigate to firm management page
    navigate(`/firms/${firm.id}/manage`);
  };

  const handleViewMatters = (firm: Firm) => {
    // Navigate to matters page filtered by firm
    navigate(`/matters?firm_id=${firm.id}`);
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Firms',
      message: `Are you sure you want to delete ${selectedCount} firm(s)? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    const loadingToast = toast.loading(`Deleting ${selectedCount} firm(s)...`);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const firm of selectedItems) {
        try {
          const { error } = await supabase
            .from('firms')
            .delete()
            .eq('id', firm.id);

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Failed to delete firm ${firm.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} firm(s)`, { id: loadingToast });
        await fetchFirms();
        clearSelection();
      } else {
        toast.error('Failed to delete firms', { id: loadingToast });
      }

      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} firm(s)`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('An error occurred during bulk delete', { id: loadingToast });
    }
  };

  const handleBulkArchive = async () => {
    const confirmed = await confirm({
      title: 'Archive Firms',
      message: `Archive ${selectedCount} firm(s)? They will be moved to inactive status.`,
      confirmText: 'Archive',
    });

    if (!confirmed) return;

    const loadingToast = toast.loading(`Archiving ${selectedCount} firm(s)...`);
    let successCount = 0;

    try {
      for (const firm of selectedItems) {
        try {
          const { error } = await supabase
            .from('firms')
            .update({ status: 'inactive' })
            .eq('id', firm.id);

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Failed to archive firm ${firm.id}:`, error);
        }
      }

      toast.success(`Successfully archived ${successCount} firm(s)`, { id: loadingToast });
      await fetchFirms();
      clearSelection();
    } catch (error) {
      console.error('Bulk archive error:', error);
      toast.error('An error occurred during bulk archive', { id: loadingToast });
    }
  };

  const handleBulkExport = async () => {
    try {
      const exportData = selectedItems.map(firm => ({
        'Firm Name': firm.firm_name,
        'Attorney': firm.attorney_name,
        'Email': firm.email,
        'Phone': firm.phone_number || '',
        'Practice Number': firm.practice_number || '',
        'Status': firm.status,
        'Created Date': new Date(firm.created_at).toLocaleDateString(),
      }));

      const format = await confirm({
        title: 'Export Format',
        message: 'Choose export format:',
        confirmText: 'CSV',
        cancelText: 'PDF',
      });

      if (format) {
        exportToCSV(exportData, 'firms-export');
        toast.success(`Exported ${selectedCount} firm(s) to CSV`);
      } else {
        await exportToPDF(exportData, 'firms-export', 'Firms Export');
        toast.success(`Exported ${selectedCount} firm(s) to PDF`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export firms');
    }
  };

  return (
    <div className="w-full space-y-6 min-h-screen bg-neutral-50 dark:bg-metallic-gray-950 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
          <Building className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Firms</h1>
      </div>

      {/* Firms Management Section */}
      <div data-section="firms-list" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Manage Firms</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Browse and manage your law firms</p>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleNewFirmClick}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Firm</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Search firms, attorneys, or emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-100 dark:bg-metallic-gray-800 rounded-lg p-1 w-fit">
        {(['active', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-metallic-gray-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            {tab === 'active' ? 'Active Firms' : 'All Firms'}
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
      {loadingFirms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonFirmCard key={i} />
          ))}
        </div>
      ) : filteredFirms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Firms Found</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {activeTab === 'active' ? 'No active firms' : 'No firms match your search criteria'}
            </p>
            <Button onClick={handleNewFirmClick} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Firm
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFirms.map((firm) => (
            <FirmCard
              key={firm.id}
              firm={firm}
              attorneys={getAttorneysForFirm(firm)}
              activeMattersCount={0} // TODO: Fetch active matters count
              onAddAttorney={handleAddAttorney}
              onManageFirm={handleManageFirm}
              onViewMatters={handleViewMatters}
            />
          ))}
        </div>
      )}

      {/* Create Firm Modal */}
      <CreateFirmModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchFirms(); // Reload firms list
          setShowCreateModal(false);
        }}
      />

      {/* Add Attorney Modal */}
      <AddAttorneyModal
        isOpen={showAddAttorneyModal}
        onClose={() => {
          setShowAddAttorneyModal(false);
          setSelectedFirmForAttorney(null);
        }}
        onSuccess={() => {
          fetchFirms(); // Reload firms list
          setShowAddAttorneyModal(false);
          setSelectedFirmForAttorney(null);
        }}
        initialFirmName={selectedFirmForAttorney?.firm_name}
      />
    </div>
  );
};

export default FirmsPage;
