import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { FirmCard, InviteAttorneyModal } from '../components/firms';

const FirmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [firmToInvite, setFirmToInvite] = useState<Firm | null>(null);

  const [firms, setFirms] = useState<Firm[]>([]);
  const [loadingFirms, setLoadingFirms] = useState(true);
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { confirm } = useConfirmation();

  // Load firms from database
  const fetchFirms = useCallback(async () => {
    if (loading || !isAuthenticated) return;
    setLoadingFirms(true);
    
    try {
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
      
      setFirms(data || []);
    } catch (err) {
      console.error('[FirmsPage] Unexpected error:', err);
      toast.error('Unexpected error loading firms. Please refresh the page.');
      setFirms([]);
    } finally {
      setLoadingFirms(false);
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

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
    // TODO: Implement create firm modal
    toast('Create firm functionality coming soon', { icon: 'ℹ️' });
  };

  const handleInviteAttorney = (firm: Firm) => {
    setFirmToInvite(firm);
    setShowInviteModal(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Firms</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage instructing law firms</p>
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
              attorneys={[]} // TODO: Fetch attorneys for each firm
              activeMattersCount={0} // TODO: Fetch active matters count
              onInviteAttorney={handleInviteAttorney}
              onManageFirm={handleManageFirm}
              onViewMatters={handleViewMatters}
            />
          ))}
        </div>
      )}

      {/* Invite Attorney Modal */}
      {firmToInvite && (
        <InviteAttorneyModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setFirmToInvite(null);
          }}
          firm={firmToInvite}
        />
      )}
    </div>
  );
};

export default FirmsPage;
