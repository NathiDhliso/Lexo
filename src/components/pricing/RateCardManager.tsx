import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, DollarSign, Clock, FileText, Star, TrendingUp, Zap, Filter } from 'lucide-react';
import { rateCardService, RateCard, StandardServiceTemplate, ServiceCategory, PricingType, CreateRateCardRequest } from '../../services/rate-card.service';

interface RateCardManagerProps {
  onClose?: () => void;
}

const RateCardManager: React.FC<RateCardManagerProps> = ({ onClose }) => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [templates, setTemplates] = useState<StandardServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showStats, setShowStats] = useState(true);

  const serviceCategories: { value: ServiceCategory; label: string }[] = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'research', label: 'Legal Research' },
    { value: 'drafting', label: 'Drafting' },
    { value: 'court_appearance', label: 'Court Appearance' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'filing', label: 'Filing' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  const pricingTypes: { value: PricingType; label: string }[] = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'fixed', label: 'Fixed Fee' },
    { value: 'per_item', label: 'Per Item' },
    { value: 'percentage', label: 'Percentage' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rateCardsData, templatesData] = await Promise.all([
        rateCardService.getRateCards(),
        rateCardService.getStandardServiceTemplates()
      ]);
      setRateCards(rateCardsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading rate cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template: StandardServiceTemplate) => {
    try {
      await rateCardService.createFromTemplate(template.id);
      await loadData();
    } catch (error) {
      console.error('Error creating rate card from template:', error);
    }
  };

  const handleDeleteRateCard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rate card?')) {
      try {
        await rateCardService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting rate card:', error);
      }
    }
  };

  const filteredRateCards = rateCards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.service_category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      card.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.service_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.service_category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.template_description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStats = () => {
    const totalCards = rateCards.length;
    const avgRate = rateCards.reduce((sum, card) => sum + (card.hourly_rate || card.fixed_fee || 0), 0) / (totalCards || 1);
    const categoryCounts = rateCards.reduce((acc, card) => {
      acc[card.service_category] = (acc[card.service_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalCards,
      avgRate,
      topCategory: topCategory ? topCategory[0] : 'none',
      activeCards: rateCards.filter(c => c.is_active).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rate Card Management</h1>
            <p className="text-gray-600">Configure your pricing for different legal services</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Rate Card
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {showStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Your Rate Cards</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalCards}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Cards</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeCards}</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Rate</p>
                <p className="text-2xl font-bold text-purple-900">R{stats.avgRate.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Templates</p>
                <p className="text-2xl font-bold text-orange-900">{templates.length}</p>
              </div>
              <Star className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search rate cards and templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ServiceCategory | 'all')}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {serviceCategories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Rate Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Rate Cards ({filteredRateCards.length})
          </h2>
          
          {filteredRateCards.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No rate cards found for this category</p>
              <p className="text-sm text-gray-500 mt-1">Create one from a template or start from scratch</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRateCards.map(card => (
                <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{card.service_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {card.service_category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingCard(card)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRateCard(card.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {card.pricing_type === 'hourly' && card.hourly_rate && (
                        <span>R{card.hourly_rate.toFixed(2)}/hour</span>
                      )}
                      {card.pricing_type === 'fixed' && card.fixed_fee && (
                        <span>R{card.fixed_fee.toFixed(2)} fixed</span>
                      )}
                    </div>
                    
                    {(card.estimated_hours_min || card.estimated_hours_max) && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {card.estimated_hours_min && card.estimated_hours_max
                            ? `${card.estimated_hours_min}-${card.estimated_hours_max}h`
                            : `${card.estimated_hours_min || card.estimated_hours_max}h`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {card.service_description && (
                    <p className="text-xs text-gray-500 mt-2">{card.service_description}</p>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    {card.is_default && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                    {!card.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Standard Templates */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Standard Templates ({filteredTemplates.length})
          </h2>
          
          <div className="space-y-3">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{template.template_name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {template.service_category.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(template)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Create rate card from this template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {template.default_hourly_rate && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>R{template.default_hourly_rate.toFixed(2)}/hour</span>
                    </div>
                  )}
                  {template.default_fixed_fee && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>R{template.default_fixed_fee.toFixed(2)} fixed</span>
                    </div>
                  )}
                  {template.estimated_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.estimated_hours}h</span>
                    </div>
                  )}
                </div>
                
                {template.template_description && (
                  <p className="text-xs text-gray-500 mt-2">{template.template_description}</p>
                )}
                
                {template.matter_types && template.matter_types.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Applies to: {template.matter_types.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingCard) && (
        <RateCardForm
          rateCard={editingCard}
          onSave={async () => {
            await loadData();
            setShowCreateForm(false);
            setEditingCard(null);
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
};

interface RateCardFormProps {
  rateCard?: RateCard | null;
  onSave: () => void;
  onCancel: () => void;
}

const RateCardForm: React.FC<RateCardFormProps> = ({ rateCard, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateRateCardRequest>({
    service_name: rateCard?.service_name || '',
    service_description: rateCard?.service_description || '',
    service_category: rateCard?.service_category || 'consultation',
    matter_type: rateCard?.matter_type || '',
    pricing_type: rateCard?.pricing_type || 'hourly',
    hourly_rate: rateCard?.hourly_rate || undefined,
    fixed_fee: rateCard?.fixed_fee || undefined,
    minimum_fee: rateCard?.minimum_fee || undefined,
    maximum_fee: rateCard?.maximum_fee || undefined,
    estimated_hours_min: rateCard?.estimated_hours_min || undefined,
    estimated_hours_max: rateCard?.estimated_hours_max || undefined,
    is_default: rateCard?.is_default || false,
    requires_approval: rateCard?.requires_approval || false
  });

  const [saving, setSaving] = useState(false);

  const serviceCategories: { value: ServiceCategory; label: string }[] = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'research', label: 'Legal Research' },
    { value: 'drafting', label: 'Drafting' },
    { value: 'court_appearance', label: 'Court Appearance' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'filing', label: 'Filing' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  const pricingTypes: { value: PricingType; label: string }[] = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'fixed', label: 'Fixed Fee' },
    { value: 'per_item', label: 'Per Item' },
    { value: 'percentage', label: 'Percentage' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (rateCard) {
        await rateCardService.updateRateCard(rateCard.id, formData);
      } else {
        await rateCardService.createRateCard(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving rate card:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {rateCard ? 'Edit Rate Card' : 'Create Rate Card'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Category *
                </label>
                <select
                  required
                  value={formData.service_category}
                  onChange={(e) => setFormData({ ...formData, service_category: e.target.value as ServiceCategory })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {serviceCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description
              </label>
              <textarea
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Type *
                </label>
                <select
                  required
                  value={formData.pricing_type}
                  onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as PricingType })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {pricingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matter Type (Optional)
                </label>
                <input
                  type="text"
                  value={formData.matter_type}
                  onChange={(e) => setFormData({ ...formData, matter_type: e.target.value })}
                  placeholder="e.g., litigation, commercial"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.pricing_type === 'hourly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.pricing_type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Fee (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fixed_fee || ''}
                    onChange={(e) => setFormData({ ...formData, fixed_fee: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Fee (R)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_fee || ''}
                  onChange={(e) => setFormData({ ...formData, minimum_fee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours (Min)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.estimated_hours_min || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_hours_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours (Max)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={formData.estimated_hours_max || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_hours_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Default for this category</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_approval}
                  onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Requires client approval</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (rateCard ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RateCardManager;