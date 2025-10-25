import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Download,
  Archive,
  Eye,
  Mail
} from 'lucide-react';
import { Card, CardContent, Button, CardHeader } from '../components/design-system/components';
import { BulkActionToolbar, SelectionCheckbox } from '../components/ui/BulkActionToolbar';
import { useAuth } from '../hooks/useAuth';
import { useSelection } from '../hooks/useSelection';
import { useConfirmation } from '../hooks/useConfirmation';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { exportToCSV, exportToPDF } from '../utils/export.utils';
import type { Firm } from '../types/financial.types';
import { useNavigate } from 'react-router-dom';
import { InviteAttorneyModal } from '../components/firms/InviteAttorneyModal';

interface FirmsPageProps {
  onNavigate?: (page: string) => void;
}

const FirmsPage: React.FC<FirmsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [firmToInvite, setFirmToInvite] = useState<Firm | null>(null);

  const [firms, setFirms] = useState<Firm[]>([]);
  const [loadingFirms, setLoadingFirms] = useState(true);
  const { user, loading, isAuthenticated } = useAuth();
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
    isSelected,
    selectedCount,
    totalCount,
    toggleSelection,
    clearSelection,
  } = useSelection({
    items: filteredFirms,
    getItemId: (firm) => firm.id,
  });

  const handleNewFirmClick = () => {
    setShowCreateModal(true);
  };

  const handleViewFirm = (firm: Firm) => {
    setSelectedFirm(firm);
    setShowDetailModal(true);
  };

  const handleEditFirm = (firm: Firm) => {
    setSelectedFirm(firm);
    setShowEditModal(true);
  };

  const handleInviteAttorney = (firm: Firm) => {
    setFirmToInvite(firm);
    setShowInviteModal(true);
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
      <div className="space-y-4">
        {loadingFirms ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500 mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">Loading firms...</p>
            </CardContent>
          </Card>
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
          filteredFirms.map((firm) => (
            <Card key={firm.id} variant="default" hoverable>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <SelectionCheckbox
                    checked={isSelected(firm.id)}
                    onChange={() => toggleSelection(firm.id)}
                    label={`Select ${firm.firm_name}`}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{firm.firm_name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          firm.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
                        }`}>
                          {firm.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Attorney:</span>
                          <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{firm.attorney_name}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 dark:text-neutral-400">Email:</span>
                          <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{firm.email}</span>
                        </div>
                        {firm.phone_number && (
                          <div>
                            <span className="text-neutral-600 dark:text-neutral-400">Phone:</span>
                            <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{firm.phone_number}</span>
                          </div>
                        )}
                        {firm.practice_number && (
                          <div>
                            <span className="text-neutral-600 dark:text-neutral-400">Practice #:</span>
                            <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">{firm.practice_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleInviteAttorney(firm)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Invite Attorney
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewFirm(firm)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFirm(firm)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
