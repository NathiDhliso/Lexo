import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Clock, 
  AlertTriangle,
  Eye,
  Search,
  Edit
} from 'lucide-react';
import { Card, CardContent, Button, CardHeader } from '../design-system/components';
import { NewMatterMultiStep } from '../components/matters/NewMatterMultiStep';
import { matterApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Matter, Page } from '../types';
import { MatterStatus } from '../types';

interface MattersPageProps {
  onNavigate?: (page: Page) => void;
}

const MattersPage: React.FC<MattersPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loadingMatters, setLoadingMatters] = useState(true);
  const { user, loading, isAuthenticated } = useAuth();

  // Load matters from API based on current user
  React.useEffect(() => {
    const fetchMatters = async () => {
      if (loading || !isAuthenticated || !user?.id) return;
      setLoadingMatters(true);
      try {
        const { data, error } = await matterApiService.getByAdvocate(user.id);
        if (error) {
          toast.error('Failed to load matters');
          setMatters([]);
        } else {
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
                return {
                  ...matter,
                  associatedServices: []
                };
              }
            })
          );
          
          setMatters(mattersWithServices);
        }
      } catch (err) {
        toast.error('Unexpected error loading matters');
        setMatters([]);
      } finally {
        setLoadingMatters(false);
      }
    };
    fetchMatters();
  }, [loading, isAuthenticated, user?.id]);

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
    if (onNavigate) {
      onNavigate('matter-workbench');
    } else {
      // Fallback to modal if navigation is not available
      setShowNewMatterModal(true);
    }
  };

  const handleViewMatter = (matter: Matter) => {
    // Navigate to matter details or show details modal
    toast.info(`Viewing details for ${matter.title}`);
  };

  const handleEditMatter = (matter: Matter) => {
    // Navigate to matter edit or show edit modal
    toast.info(`Editing ${matter.title}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Matters</h1>
          <p className="text-neutral-600 mt-1">Manage your legal matters and cases</p>
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search matters, clients, or attorneys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {(['active', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
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
              <p className="text-neutral-600">Loading matters...</p>
            </CardContent>
          </Card>
        ) : filteredMatters.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Matters Found</h3>
              <p className="text-neutral-600 mb-4">
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
                      <h3 className="text-lg font-semibold text-neutral-900">{matter.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        matter.status === MatterStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                        matter.status === MatterStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        matter.status === MatterStatus.SETTLED ? 'bg-blue-100 text-blue-800' :
                        'bg-neutral-100 text-neutral-800'
                      }`}>
                        {matter.status}
                      </span>
                      
                      {/* Health Check Warning Icons */}
                      <div className="flex items-center gap-2">
                        {isHighWipInactive(matter) && (
                          <div className="group relative">
                            <AlertTriangle 
                              className="w-5 h-5 text-amber-500 cursor-help" 
                              title="High WIP Inactive Matter"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800">High WIP Inactive</div>
                              <div className="text-xs text-amber-700">
                                WIP: R{(matter.wip_value || 0).toLocaleString()} • No recent activity
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isApproachingPrescription(matter) && (
                          <div className="group relative">
                            <Clock 
                              className="w-5 h-5 text-amber-600 cursor-help" 
                              title="Approaching Prescription"
                            />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-800">Prescription Warning</div>
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
                        <span className="text-neutral-600">Client:</span>
                        <span className="ml-2 font-medium text-neutral-900">{matter.client_name}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Attorney:</span>
                        <span className="ml-2 font-medium text-neutral-900">{matter.instructing_attorney}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Type:</span>
                        <span className="ml-2 font-medium text-neutral-900">{matter.brief_type}</span>
                      </div>
                    </div>
                    
                    {/* Associated Services */}
                    {(matter as any).associatedServices && (matter as any).associatedServices.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <span className="text-sm font-medium text-neutral-700">Services:</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(matter as any).associatedServices.map((service: any, index: number) => (
                            <span
                              key={service.id || index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                  <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-neutral-900">
                        R{(matter.wip_value || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-600">Work in Progress</div>
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Matter Modal */}
      <NewMatterMultiStep
        isOpen={showNewMatterModal}
        onClose={() => setShowNewMatterModal(false)}
        onComplete={async (data) => {
          try {
            const newMatter = await matterApiService.createMatter(data);
            setMatters(prev => [newMatter, ...prev]);
            setShowNewMatterModal(false);
            toast.success(`Matter "${newMatter.title}" created successfully`);
          } catch (error) {
            console.error('Error creating matter:', error);
            toast.error('Failed to create matter');
          }
        }}
      />
    </div>
  );
};

export default MattersPage;