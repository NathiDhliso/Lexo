import React, { useState, useEffect } from 'react';
import { Zap, Package, Star, Clock, DollarSign, Check, ChevronRight } from 'lucide-react';
import { rateCardService, RateCard } from '../../services/rate-card.service';
import { toast } from 'react-hot-toast';

interface SmartServiceSelectorProps {
  matterId?: string;
  matterType?: string;
  onServicesSelected: (services: SelectedService[]) => void;
  onClose?: () => void;
}

export interface SelectedService {
  rateCard: RateCard;
  hours: number;
  total: number;
}

interface ServiceBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  matterTypes: string[];
  services: {
    serviceCategory: string;
    defaultHours: number;
  }[];
  estimatedTotal: number;
  estimatedHours: number;
}

// TODO: Replace with real service bundles from database/API
const SERVICE_BUNDLES: ServiceBundle[] = [];

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  matterId,
  matterType,
  onServicesSelected,
  onClose
}) => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'bundles' | 'suggestions' | 'manual'>('bundles');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  useEffect(() => {
    loadRateCards();
  }, []);

  const loadRateCards = async () => {
    try {
      setLoading(true);
      const cards = await rateCardService.getRateCards({ is_active: true });
      setRateCards(cards);
    } catch (error) {
      console.error('Error loading rate cards:', error);
      toast.error('Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  };

  const getRelevantBundles = () => {
    if (!matterType) return SERVICE_BUNDLES;
    return SERVICE_BUNDLES.filter(bundle => 
      bundle.matterTypes.includes(matterType.toLowerCase())
    );
  };

  const applyBundle = (bundle: ServiceBundle) => {
    const services: SelectedService[] = [];
    
    bundle.services.forEach(bundleService => {
      const matchingCard = rateCards.find(card => 
        card.service_category === bundleService.serviceCategory &&
        card.is_active
      );
      
      if (matchingCard) {
        const hours = bundleService.defaultHours;
        const rate = matchingCard.hourly_rate || matchingCard.fixed_fee || 0;
        services.push({
          rateCard: matchingCard,
          hours,
          total: rate * hours
        });
      }
    });

    setSelectedServices(services);
    toast.success(`${bundle.name} applied with ${services.length} services`);
  };

  const getSuggestedServices = () => {
    if (!matterType || rateCards.length === 0) return [];

    const suggestions: SelectedService[] = [];
    const categories = ['consultation', 'research', 'drafting', 'court_appearance'];

    categories.forEach(category => {
      const card = rateCards.find(c => 
        c.service_category === category && 
        c.is_active
      );
      
      if (card) {
        const defaultHours = card.estimated_hours_min || 1;
        const rate = card.hourly_rate || card.fixed_fee || 0;
        suggestions.push({
          rateCard: card,
          hours: defaultHours,
          total: rate * defaultHours
        });
      }
    });

    return suggestions;
  };

  const applySuggestions = () => {
    const suggestions = getSuggestedServices();
    setSelectedServices(suggestions);
    toast.success(`${suggestions.length} suggested services added`);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateTotalHours = () => {
    return selectedServices.reduce((sum, service) => sum + service.hours, 0);
  };

  const handleConfirm = () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }
    onServicesSelected(selectedServices);
    onClose?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const relevantBundles = getRelevantBundles();
  const suggestions = getSuggestedServices();

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setSelectedMode('bundles')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            selectedMode === 'bundles'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Service Bundles
        </button>
        <button
          onClick={() => setSelectedMode('suggestions')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            selectedMode === 'suggestions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Smart Suggestions
        </button>
        <button
          onClick={() => setSelectedMode('manual')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            selectedMode === 'manual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Manual Select
        </button>
      </div>

      {/* Service Bundles Mode */}
      {selectedMode === 'bundles' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">
            {matterType ? `Recommended for ${matterType} matters` : 'Available Service Bundles'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantBundles.map(bundle => (
              <button
                key={bundle.id}
                onClick={() => applyBundle(bundle)}
                className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{bundle.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                        {bundle.name}
                      </h4>
                      <p className="text-xs text-gray-600">{bundle.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
                <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {bundle.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      {bundle.services.length} services
                    </span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    ~R{bundle.estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions Mode */}
      {selectedMode === 'suggestions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recommended Services</h3>
            <button
              onClick={applySuggestions}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Apply All Suggestions
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{service.rateCard.service_name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {service.rateCard.service_category.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {service.hours}h × R{service.rateCard.hourly_rate?.toFixed(2)}
                  </div>
                  <div className="font-semibold text-gray-900">
                    R{service.total.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Selection Mode */}
      {selectedMode === 'manual' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Select Services Manually</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {rateCards.map(card => (
              <label
                key={card.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.some(s => s.rateCard.id === card.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const hours = card.estimated_hours_min || 1;
                      const rate = card.hourly_rate || card.fixed_fee || 0;
                      setSelectedServices([...selectedServices, {
                        rateCard: card,
                        hours,
                        total: rate * hours
                      }]);
                    } else {
                      setSelectedServices(selectedServices.filter(s => s.rateCard.id !== card.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{card.service_name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {card.service_category.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {card.pricing_type === 'hourly' && card.hourly_rate && `R${card.hourly_rate.toFixed(2)}/hr`}
                    {card.pricing_type === 'fixed' && card.fixed_fee && `R${card.fixed_fee.toFixed(2)}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Selected Services ({selectedServices.length})</h4>
          <div className="space-y-2 mb-4">
            {selectedServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-blue-800">{service.rateCard.service_name}</span>
                <span className="text-blue-900 font-medium">R{service.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-300">
            <div className="flex items-center gap-4 text-sm text-blue-800">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {calculateTotalHours()}h total
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">Total Estimate</div>
              <div className="text-2xl font-bold text-blue-900">
                R{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          disabled={selectedServices.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Apply {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};
