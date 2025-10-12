import React, { useState, useEffect } from 'react';
import { Check, DollarSign, Clock, Package, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StandardServiceTemplate {
  id: string;
  template_name: string;
  template_description: string;
  service_category: string;
  matter_types: string[];
  default_hourly_rate: number | null;
  default_fixed_fee: number | null;
  estimated_hours: number | null;
}

interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: StandardServiceTemplate[];
  totalEstimate: number;
  totalHours: number;
}

interface AttorneyServiceSelectorProps {
  matterType: string;
  advocateId: string;
  onServicesSelected: (services: StandardServiceTemplate[], total: number, narrative: string) => void;
}

export const AttorneyServiceSelector: React.FC<AttorneyServiceSelectorProps> = ({
  matterType,
  advocateId,
  onServicesSelected
}) => {
  const [templates, setTemplates] = useState<StandardServiceTemplate[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bundles' | 'browse'>('bundles');

  useEffect(() => {
    if (advocateId) {
      loadTemplates();
    }
  }, [advocateId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      if (!advocateId) {
        console.error('No advocate ID provided');
        setLoading(false);
        return;
      }
      
      // Load the specific advocate's active rate cards
      const { data, error } = await supabase
        .from('rate_cards')
        .select('*')
        .eq('advocate_id', advocateId)
        .eq('is_active', true)
        .order('service_category')
        .order('service_name');

      if (error) throw error;
      
      // Transform rate_cards to match StandardServiceTemplate interface
      const transformedData = (data || []).map(card => ({
        id: card.id,
        template_name: card.service_name,
        template_description: card.service_description || '',
        service_category: card.service_category,
        matter_types: card.matter_type ? [card.matter_type] : [],
        default_hourly_rate: card.hourly_rate,
        default_fixed_fee: card.fixed_fee,
        estimated_hours: card.estimated_hours_min || card.estimated_hours_max || 1
      }));
      
      setTemplates(transformedData);
    } catch (error) {
      console.error('Error loading rate cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelevantTemplates = () => {
    if (!matterType || matterType === 'general') return templates;
    return templates.filter(t => 
      !t.matter_types || 
      t.matter_types.length === 0 || 
      t.matter_types.includes(matterType) ||
      t.matter_types.includes('general')
    );
  };

  const getBundles = (): ServiceBundle[] => {
    const relevantTemplates = getRelevantTemplates();
    
    const bundles: ServiceBundle[] = [];

    if (matterType === 'litigation' || matterType === 'commercial') {
      const consultation = relevantTemplates.find(t => t.service_category === 'consultation');
      const research = relevantTemplates.find(t => t.service_category === 'research');
      const drafting = relevantTemplates.find(t => t.service_category === 'drafting');
      const court = relevantTemplates.find(t => t.service_category === 'court_appearance');

      if (consultation && research && drafting && court) {
        const services = [consultation, research, drafting, court];
        const total = services.reduce((sum, s) => {
          const rate = s.default_hourly_rate || s.default_fixed_fee || 0;
          const hours = s.estimated_hours || 1;
          return sum + (rate * hours);
        }, 0);
        const hours = services.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

        bundles.push({
          id: 'litigation-package',
          name: 'Complete Litigation Package',
          description: 'Full service package for court matters',
          icon: '⚖️',
          services,
          totalEstimate: total,
          totalHours: hours
        });
      }
    }

    if (matterType === 'criminal') {
      const consultation = relevantTemplates.find(t => 
        t.service_category === 'consultation' && t.template_name.toLowerCase().includes('criminal')
      );
      const research = relevantTemplates.find(t => t.service_category === 'research');
      const court = relevantTemplates.find(t => 
        t.service_category === 'court_appearance' && t.template_name.toLowerCase().includes('criminal')
      );

      if (consultation && research && court) {
        const services = [consultation, research, court];
        const total = services.reduce((sum, s) => {
          const rate = s.default_hourly_rate || s.default_fixed_fee || 0;
          const hours = s.estimated_hours || 1;
          return sum + (rate * hours);
        }, 0);
        const hours = services.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

        bundles.push({
          id: 'criminal-package',
          name: 'Criminal Defense Package',
          description: 'Essential services for criminal matters',
          icon: '🛡️',
          services,
          totalEstimate: total,
          totalHours: hours
        });
      }
    }

    const quickOpinion = relevantTemplates.filter(t => 
      ['consultation', 'research', 'drafting'].includes(t.service_category)
    ).slice(0, 3);

    if (quickOpinion.length === 3) {
      const total = quickOpinion.reduce((sum, s) => {
        const rate = s.default_hourly_rate || s.default_fixed_fee || 0;
        const hours = s.estimated_hours || 1;
        return sum + (rate * hours);
      }, 0);
      const hours = quickOpinion.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);

      bundles.push({
        id: 'quick-opinion',
        name: 'Quick Legal Opinion',
        description: 'Fast turnaround legal advice',
        icon: '📝',
        services: quickOpinion,
        totalEstimate: total,
        totalHours: hours
      });
    }

    return bundles;
  };

  const groupByCategory = () => {
    const relevant = getRelevantTemplates();
    return relevant.reduce((acc, template) => {
      const category = template.service_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {} as Record<string, StandardServiceTemplate[]>);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const selectBundle = (bundle: ServiceBundle) => {
    const serviceIds = bundle.services.map(s => s.id);
    setSelectedServices(serviceIds);
  };

  const calculateTotal = () => {
    const selected = templates.filter(t => selectedServices.includes(t.id));
    return selected.reduce((sum, service) => {
      const rate = service.default_hourly_rate || service.default_fixed_fee || 0;
      const hours = service.estimated_hours || 1;
      return sum + (rate * hours);
    }, 0);
  };

  const calculateHours = () => {
    const selected = templates.filter(t => selectedServices.includes(t.id));
    return selected.reduce((sum, service) => sum + (service.estimated_hours || 0), 0);
  };

  const generateNarrative = () => {
    const selected = templates.filter(t => selectedServices.includes(t.id));
    const grouped = selected.reduce((acc, service) => {
      const category = service.service_category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, StandardServiceTemplate[]>);

    let narrative = 'Professional legal services requested:\n\n';
    
    Object.entries(grouped).forEach(([category, services]) => {
      narrative += `${category}:\n`;
      services.forEach(service => {
        const rate = service.default_hourly_rate || service.default_fixed_fee || 0;
        const hours = service.estimated_hours || 1;
        const total = rate * hours;
        
        narrative += `• ${service.template_name}`;
        if (service.default_hourly_rate) {
          narrative += ` (R${rate.toFixed(2)}/hr × ${hours}h = R${total.toFixed(2)})`;
        } else if (service.default_fixed_fee) {
          narrative += ` (Fixed fee: R${total.toFixed(2)})`;
        }
        narrative += '\n';
      });
      narrative += '\n';
    });

    return narrative;
  };

  const handleApply = () => {
    const selected = templates.filter(t => selectedServices.includes(t.id));
    const total = calculateTotal();
    const narrative = generateNarrative();
    onServicesSelected(selected, total, narrative);
  };

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const bundles = getBundles();
  const categorizedServices = groupByCategory();
  const total = calculateTotal();
  const hours = calculateHours();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Select Services & See Pricing</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Choose from pre-configured packages or browse individual services. Pricing is estimated and may be adjusted by the advocate.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-metallic-gray-800 rounded-lg">
        <button
          onClick={() => setViewMode('bundles')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            viewMode === 'bundles'
              ? 'bg-white text-blue-600 theme-shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Service Packages
        </button>
        <button
          onClick={() => setViewMode('browse')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            viewMode === 'browse'
              ? 'bg-white text-blue-600 theme-shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Browse All Services
        </button>
      </div>

      {/* Service Bundles View */}
      {viewMode === 'bundles' && (
        <div className="space-y-3">
          {bundles.length > 0 ? (
            bundles.map(bundle => (
              <div
                key={bundle.id}
                className="border-2 border-gray-200 dark:border-metallic-gray-700 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => selectBundle(bundle)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{bundle.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-neutral-100">{bundle.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">{bundle.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectBundle(bundle);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Select Package
                  </button>
                </div>
                
                <div className="space-y-2 mb-3">
                  {bundle.services.map(service => (
                    <div key={service.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-metallic-gray-900 rounded p-2">
                      <span className="text-gray-700 dark:text-neutral-300">• {service.template_name}</span>
                      <span className="text-gray-600 dark:text-neutral-400">
                        {service.default_hourly_rate && `R${service.default_hourly_rate.toFixed(0)}/hr`}
                        {service.default_fixed_fee && `R${service.default_fixed_fee.toFixed(0)}`}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-metallic-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ~{bundle.totalHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {bundle.services.length} services
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-neutral-500">Estimated Total</div>
                    <div className="text-xl font-bold text-blue-600">
                      R{bundle.totalEstimate.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-neutral-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-neutral-500" />
              <p>No pre-configured packages available for this matter type.</p>
              <p className="text-sm mt-1">Switch to "Browse All Services" to select individual services.</p>
            </div>
          )}
        </div>
      )}

      {/* Browse Services View */}
      {viewMode === 'browse' && (
        <div className="space-y-3">
          {Object.entries(categorizedServices).map(([category, services]) => (
            <div key={category} className="border border-gray-200 dark:border-metallic-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-metallic-gray-900 hover:bg-gray-100 dark:bg-metallic-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-neutral-100">{formatCategoryName(category)}</h4>
                  <span className="text-sm text-gray-500 dark:text-neutral-500">({services.length} services)</span>
                </div>
                {expandedCategory === category ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                )}
              </button>
              
              {expandedCategory === category && (
                <div className="p-4 space-y-2">
                  {services.map(service => {
                    const isSelected = selectedServices.includes(service.id);
                    const rate = service.default_hourly_rate || service.default_fixed_fee || 0;
                    const hours = service.estimated_hours || 1;
                    const serviceTotal = rate * hours;

                    return (
                      <label
                        key={service.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleService(service.id)}
                            className="w-5 h-5 text-blue-600 border-gray-300 dark:border-metallic-gray-600 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-neutral-100">{service.template_name}</h5>
                              {service.template_description && (
                                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">{service.template_description}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm text-gray-600 dark:text-neutral-400">
                                {service.default_hourly_rate && `R${rate.toFixed(0)}/hr × ${hours}h`}
                                {service.default_fixed_fee && `Fixed fee`}
                              </div>
                              <div className="font-semibold text-gray-900 dark:text-neutral-100">
                                R{serviceTotal.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sticky bottom-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-blue-900">
                {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''} Selected
              </h4>
              <p className="text-sm text-blue-700">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated {hours} hours total
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">Estimated Total</div>
              <div className="text-3xl font-bold text-blue-900">
                R{total.toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={handleApply}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Apply Selected Services to Request
          </button>
          <p className="text-xs text-blue-600 text-center mt-2">
            * Final pricing will be confirmed by the advocate
          </p>
        </div>
      )}

      {selectedServices.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-neutral-500">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-neutral-500" />
          <p>Select services above to see pricing estimate</p>
        </div>
      )}
    </div>
  );
};
