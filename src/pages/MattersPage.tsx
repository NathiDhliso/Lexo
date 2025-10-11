import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Clock, 
  AlertTriangle,
  Eye,
  Search,
  Edit,
  Undo2,
  Zap,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, Button, CardHeader } from '../components/design-system/components';
import { MatterDetailModal } from '../components/matters/MatterDetailModal';
import { EditMatterModal } from '../components/matters/EditMatterModal';
import { QuickCreateMatterModal } from '../components/matters/QuickCreateMatterModal';
import { matterApiService } from '../services/api';
import { matterConversionService } from '../services/api/matter-conversion.service';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Matter, Page } from '../types';
import { MatterStatus } from '../types';
import { useNavigate } from 'react-router-dom';

interface MattersPageProps {
  onNavigate?: (page: Page) => void;
}

const MattersPage: React.FC<MattersPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  const [matters, setMatters] = useState<Matter[]>([]);
  const [loadingMatters, setLoadingMatters] = useState(true);
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
        navigate('/matter-workbench');
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
      
      if (mattersWithServices.length > 0) {
        toast.success(`Loaded ${mattersWithServices.length} matter${mattersWithServices.length > 1 ? 's' : ''}`, { duration: 2000 });
      }
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
                        (activeTab === 'active' && matter.status === MatterStatus.ACTIVE);
      return matchesSearch && matchesTab;
    });
  }, [matters, searchTerm, activeTab]);

  const handleNewMatterClick = () => {
    navigatePage('matter-workbench');
  };

  const handleViewMatter = (matter: Matter) => {
    setSelectedMatter(matter);
    setShowDetailModal(true);
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
            {tab === 'active' ? 'Active Matters' : 'All Matters'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loadingMatters ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500 mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">Loading matters...</p>
            </CardContent>
          </Card>
        ) : filteredMatters.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Matters Found</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {activeTab === 'active' ? 'No active matters' : 'No matters match your search criteria'}
              </p>
              <Button onClick={handleNewMatterClick} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Matter
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMatters.map((matter) => (
            <Card key={matter.id} variant="default" hoverable>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{matter.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        matter.status === MatterStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        matter.status === MatterStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        matter.status === MatterStatus.SETTLED ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300'
                      }`}>
                        {matter.status}
                      </span>
                      
                      {/* Health Check Warning Icons */}
                      <div className="flex items-center gap-2">
                        {isHighWipInactive(matter) && (
                          <div className="group relative" title="High WIP Inactive Matter">
                            <AlertTriangle 
                              className="w-5 h-5 text-amber-500 cursor-help"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">High WIP Inactive</div>
                              <div className="text-xs text-amber-700">
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
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Prescription Warning</div>
                              <div className="text-xs text-amber-700">
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
    </div>
  );
};

export default MattersPage;