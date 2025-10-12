import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Label, Badge, Separator, Select } from '../design-system/components';
import { 
  Calculator, 
  Clock, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  rateCardService, 
  RateCard, 
  StandardServiceTemplate, 
  ServiceCategory, 
  PricingType,
  ProFormaEstimate,
  ProFormaLineItem
} from '../../services/rate-card.service';
import { toast } from 'react-hot-toast';

interface RateCardSelectorProps {
  matterType?: string;
  onEstimateChange?: (estimate: ProFormaEstimate) => void;
  onServicesChange?: (services: SelectedService[]) => void;
  initialServices?: SelectedService[];
  showEstimate?: boolean;
  className?: string;
  compact?: boolean;
}

export interface SelectedService {
  id: string;
  service_name: string;
  service_description?: string;
  service_category: ServiceCategory;
  pricing_type: PricingType;
  hourly_rate?: number;
  fixed_fee?: number;
  quantity: number;
  estimated_hours?: number;
  custom_description?: string;
  is_custom?: boolean;
}

const RateCardSelector: React.FC<RateCardSelectorProps> = ({
  matterType,
  onEstimateChange,
  onServicesChange,
  initialServices = [],
  showEstimate = true,
  className = '',
  compact = false
}) => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [templates, setTemplates] = useState<StandardServiceTemplate[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(initialServices);
  const [estimate, setEstimate] = useState<ProFormaEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [customService, setCustomService] = useState({
    service_name: '',
    service_description: '',
    service_category: 'consultation' as ServiceCategory,
    pricing_type: 'hourly' as PricingType,
    hourly_rate: 2500,
    fixed_fee: 0,
    quantity: 1,
    estimated_hours: 1
  });

  const serviceCategories: { value: ServiceCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'research', label: 'Research' },
    { value: 'drafting', label: 'Drafting' },
    { value: 'court_appearance', label: 'Court Appearance' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'filing', label: 'Filing' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadData();
  }, [matterType, selectedCategory]);

  useEffect(() => {
    calculateEstimate();
  }, [selectedServices]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load rate cards with filters
      const filters = {
        is_active: true,
        ...(matterType && { matter_type: matterType }),
        ...(selectedCategory !== 'all' && { service_category: selectedCategory })
      };
      
      const [rateCardsData, templatesData] = await Promise.all([
        rateCardService.getRateCards(filters),
        rateCardService.getStandardServiceTemplates({
          ...(selectedCategory !== 'all' && { service_category: selectedCategory }),
          ...(matterType && { matter_type: matterType })
        })
      ]);

      setRateCards(rateCardsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading rate card data:', error);
      toast.error('Failed to load rate card data');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = async () => {
    if (selectedServices.length === 0) {
      setEstimate(null);
      onEstimateChange?.(null as any);
      return;
    }

    try {
      const lineItems: ProFormaLineItem[] = selectedServices.map(service => {
        const unitPrice = service.pricing_type === 'hourly' 
          ? service.hourly_rate || 2500 
          : service.fixed_fee || 0;
        
        const totalAmount = service.pricing_type === 'hourly'
          ? unitPrice * service.quantity
          : unitPrice;

        return {
          service_name: service.service_name,
          description: service.custom_description || service.service_description || '',
          quantity: service.quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          service_category: service.service_category,
          estimated_hours: service.estimated_hours
        };
      });

      const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
      const vatAmount = subtotal * 0.15;
      const totalAmount = subtotal + vatAmount;
      const estimatedHours = lineItems.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);

      const newEstimate: ProFormaEstimate = {
        line_items: lineItems,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        estimated_hours: estimatedHours
      };

      setEstimate(newEstimate);
      onEstimateChange?.(newEstimate);
    } catch (error) {
      console.error('Error calculating estimate:', error);
      toast.error('Failed to calculate estimate');
    }
  };

  const addRateCardService = (rateCard: RateCard) => {
    const service: SelectedService = {
      id: rateCard.id,
      service_name: rateCard.service_name,
      service_description: rateCard.service_description,
      service_category: rateCard.service_category,
      pricing_type: rateCard.pricing_type,
      hourly_rate: rateCard.hourly_rate,
      fixed_fee: rateCard.fixed_fee,
      quantity: rateCard.pricing_type === 'hourly' ? (rateCard.estimated_hours_min || 1) : 1,
      estimated_hours: rateCard.estimated_hours_min || 1,
      is_custom: false
    };

    setSelectedServices(prev => [...prev, service]);
    onServicesChange?.([...selectedServices, service]);
    toast.success(`Added ${rateCard.service_name}`);
  };

  const addTemplateService = async (template: StandardServiceTemplate) => {
    try {
      const rateCard = await rateCardService.createFromTemplate(template.id);
      addRateCardService(rateCard);
    } catch (error) {
      console.error('Error creating rate card from template:', error);
      toast.error('Failed to add service from template');
    }
  };

  const addCustomService = () => {
    if (!customService.service_name.trim()) {
      toast.error('Service name is required');
      return;
    }

    const service: SelectedService = {
      id: `custom-${Date.now()}`,
      service_name: customService.service_name,
      service_description: customService.service_description,
      service_category: customService.service_category,
      pricing_type: customService.pricing_type,
      hourly_rate: customService.hourly_rate,
      fixed_fee: customService.fixed_fee,
      quantity: customService.quantity,
      estimated_hours: customService.estimated_hours,
      is_custom: true
    };

    setSelectedServices(prev => [...prev, service]);
    onServicesChange?.([...selectedServices, service]);
    
    // Reset custom service form
    setCustomService({
      service_name: '',
      service_description: '',
      service_category: 'consultation',
      pricing_type: 'hourly',
      hourly_rate: 2500,
      fixed_fee: 0,
      quantity: 1,
      estimated_hours: 1
    });

    toast.success(`Added custom service: ${service.service_name}`);
  };

  const updateService = (index: number, updates: Partial<SelectedService>) => {
    const updatedServices = selectedServices.map((service, i) => 
      i === index ? { ...service, ...updates } : service
    );
    setSelectedServices(updatedServices);
    onServicesChange?.(updatedServices);
  };

  const removeService = (index: number) => {
    const updatedServices = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(updatedServices);
    onServicesChange?.(updatedServices);
    toast.success('Service removed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getCategoryColor = (category: ServiceCategory) => {
    const colors: Record<ServiceCategory, string> = {
      consultation: 'bg-blue-100 text-blue-800',
      research: 'bg-green-100 text-green-800',
      drafting: 'bg-purple-100 text-purple-800',
      court_appearance: 'bg-red-100 text-red-800',
      negotiation: 'bg-orange-100 text-orange-800',
      document_review: 'bg-yellow-100 text-yellow-800',
      correspondence: 'bg-indigo-100 text-indigo-800',
      filing: 'bg-pink-100 text-pink-800',
      travel: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`${compact ? 'space-y-3' : 'space-y-4'} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-metallic-gray-700 rounded w-1/4 mb-2"></div>
          <div className={`${compact ? 'h-24' : 'h-32'} bg-gray-200 rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'} ${className}`}>
      {/* Category Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="category-filter">Filter by Category:</Label>
        <Select 
          id="category-filter"
          value={selectedCategory} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value as ServiceCategory | 'all')}
          className="w-48"
        >
          {serviceCategories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? 'Hide Templates' : 'Show Templates'}
        </Button>
      </div>

      {/* Available Rate Cards */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`}>
            <Calculator className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
            Available Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rateCards.length === 0 ? (
            <p className={`text-gray-500 text-center ${compact ? 'py-2 text-sm' : 'py-4'}`}>
              No rate cards found. {showTemplates ? 'Check templates below or create custom services.' : 'Try showing templates or create custom services.'}
            </p>
          ) : (
            <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
              {rateCards.map(rateCard => (
                <div key={rateCard.id} className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} hover:theme-shadow-md transition-shadow`}>
                  <div className={`flex justify-between items-start ${compact ? 'mb-1' : 'mb-2'}`}>
                    <h4 className={`font-medium ${compact ? 'text-sm' : ''}`}>{rateCard.service_name}</h4>
                    <Badge className={getCategoryColor(rateCard.service_category)}>
                      {rateCard.service_category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {rateCard.service_description && !compact && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">{rateCard.service_description}</p>
                  )}
                  
                  <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className={`font-medium ${compact ? 'text-sm' : ''}`}>
                      {rateCard.pricing_type === 'hourly' 
                        ? `${formatCurrency(rateCard.hourly_rate || 0)}/hour`
                        : formatCurrency(rateCard.fixed_fee || 0)
                      }
                    </span>
                    {rateCard.estimated_hours_min && (
                      <>
                        <Clock className="h-4 w-4 text-blue-600 ml-2" />
                        <span className="text-sm text-gray-600 dark:text-neutral-400">
                          {rateCard.estimated_hours_min}h
                        </span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    size={compact ? 'xs' : 'sm'}
                    onClick={() => addRateCardService(rateCard)}
                    className="w-full"
                    disabled={selectedServices.some(s => s.id === rateCard.id)}
                  >
                    {selectedServices.some(s => s.id === rateCard.id) ? (
                      <>
                        <CheckCircle className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                        {compact ? 'Added' : 'Added'}
                      </>
                    ) : (
                      <>
                        <Plus className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
                        {compact ? 'Add' : 'Add Service'}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle>Standard Service Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <p className="text-gray-500 dark:text-neutral-500 text-center py-4">No templates available for the selected criteria.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:theme-shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{template.template_name}</h4>
                      <Badge className={getCategoryColor(template.service_category)}>
                        {template.service_category.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {template.template_description && (
                      <p className="text-sm text-gray-600 dark:text-neutral-400 mb-2">{template.template_description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {template.default_hourly_rate 
                          ? `${formatCurrency(template.default_hourly_rate)}/hour`
                          : formatCurrency(template.default_fixed_fee || 0)
                        }
                      </span>
                      {template.estimated_hours && (
                        <>
                          <Clock className="h-4 w-4 text-blue-600 ml-2" />
                          <span className="text-sm text-gray-600 dark:text-neutral-400">
                            {template.estimated_hours}h
                          </span>
                        </>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTemplateService(template)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create from Template
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Service */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Service</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-name">Service Name *</Label>
              <Input
                id="service-name"
                value={customService.service_name}
                onChange={(e) => setCustomService(prev => ({ ...prev, service_name: e.target.value }))}
                placeholder="e.g., Contract Review"
              />
            </div>
            
            <div>
              <Label htmlFor="service-category">Category</Label>
              <Select 
                id="service-category"
                value={customService.service_category} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomService(prev => ({ ...prev, service_category: e.target.value as ServiceCategory }))}
              >
                {serviceCategories.filter(cat => cat.value !== 'all').map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={customService.service_description}
              onChange={(e) => setCustomService(prev => ({ ...prev, service_description: e.target.value }))}
              placeholder="Brief description of the service"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="pricing-type">Pricing Type</Label>
              <Select 
                id="pricing-type"
                value={customService.pricing_type} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCustomService(prev => ({ ...prev, pricing_type: e.target.value as PricingType }))}
              >
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed Fee</option>
              </Select>
            </div>

            {customService.pricing_type === 'hourly' ? (
              <div>
                <Label htmlFor="hourly-rate">Hourly Rate (ZAR)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  value={customService.hourly_rate}
                  onChange={(e) => setCustomService(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="fixed-fee">Fixed Fee (ZAR)</Label>
                <Input
                  id="fixed-fee"
                  type="number"
                  value={customService.fixed_fee}
                  onChange={(e) => setCustomService(prev => ({ ...prev, fixed_fee: Number(e.target.value) }))}
                />
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={customService.quantity}
                onChange={(e) => setCustomService(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="estimated-hours">Est. Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                step="0.5"
                min="0"
                value={customService.estimated_hours}
                onChange={(e) => setCustomService(prev => ({ ...prev, estimated_hours: Number(e.target.value) }))}
              />
            </div>
          </div>

          <Button onClick={addCustomService} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Service
          </Button>
        </CardContent>
      </Card>
      )}

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedServices.map((service, index) => (
                <div key={`${service.id}-${index}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.service_name}</h4>
                        <Badge className={getCategoryColor(service.service_category)}>
                          {service.service_category.replace('_', ' ')}
                        </Badge>
                        {service.is_custom && (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </div>
                      {service.service_description && (
                        <p className="text-sm text-gray-600 dark:text-neutral-400">{service.service_description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => updateService(index, { quantity: Number(e.target.value) })}
                      />
                    </div>

                    {service.pricing_type === 'hourly' && (
                      <div>
                        <Label htmlFor={`rate-${index}`}>Rate (ZAR/hour)</Label>
                        <Input
                          id={`rate-${index}`}
                          type="number"
                          value={service.hourly_rate || 0}
                          onChange={(e) => updateService(index, { hourly_rate: Number(e.target.value) })}
                        />
                      </div>
                    )}

                    {service.pricing_type === 'fixed' && (
                      <div>
                        <Label htmlFor={`fee-${index}`}>Fixed Fee (ZAR)</Label>
                        <Input
                          id={`fee-${index}`}
                          type="number"
                          value={service.fixed_fee || 0}
                          onChange={(e) => updateService(index, { fixed_fee: Number(e.target.value) })}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`hours-${index}`}>Est. Hours</Label>
                      <Input
                        id={`hours-${index}`}
                        type="number"
                        step="0.5"
                        min="0"
                        value={service.estimated_hours || 0}
                        onChange={(e) => updateService(index, { estimated_hours: Number(e.target.value) })}
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="text-right">
                        <Label>Total</Label>
                        <p className="font-medium text-lg">
                          {formatCurrency(
                            service.pricing_type === 'hourly'
                              ? (service.hourly_rate || 0) * service.quantity
                              : service.fixed_fee || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label htmlFor={`custom-desc-${index}`}>Custom Description (Optional)</Label>
                    <Textarea
                      id={`custom-desc-${index}`}
                      value={service.custom_description || ''}
                      onChange={(e) => updateService(index, { custom_description: e.target.value })}
                      placeholder="Add custom description for this service"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimate Summary */}
      {showEstimate && estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pro Forma Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%):</span>
                <span className="font-medium">{formatCurrency(estimate.vat_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(estimate.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-neutral-400">
                <span>Estimated Hours:</span>
                <span>{estimate.estimated_hours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RateCardSelector;