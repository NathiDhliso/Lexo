/**
 * Rate Card Management Component
 * Manage service rates and pricing templates with templates, view modes, and filters
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, DollarSign, Clock, Search,
  Grid, List, Copy, Star, LayoutTemplate 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { toastService } from '../../services/toast.service';
import { supabase } from '../../lib/supabase';

interface RateCard {
  id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  matter_type: string;
  pricing_type: 'hourly' | 'fixed' | 'per_item' | 'percentage';
  hourly_rate: number | null;
  fixed_fee: number | null;
  minimum_fee: number | null;
  maximum_fee: number | null;
  is_active: boolean;
  is_default: boolean;
}

interface ServiceTemplate {
  id: string;
  template_name: string;
  template_description: string;
  service_category: string;
  default_hourly_rate: number | null;
  default_fixed_fee: number | null;
  estimated_hours: number | null;
  is_system_template: boolean;
}

type ViewMode = 'grid' | 'list';
type DataSource = 'my-cards' | 'templates';

export const RateCardManagement: React.FC = () => {
  const { user } = useAuth();
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [filteredData, setFilteredData] = useState<(RateCard | ServiceTemplate)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  
  // View controls
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dataSource, setDataSource] = useState<DataSource>('my-cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    service_description: '',
    service_category: 'consultation',
    matter_type: '',
    pricing_type: 'hourly' as 'hourly' | 'fixed' | 'per_item' | 'percentage',
    hourly_rate: '',
    fixed_fee: '',
    minimum_fee: '',
    maximum_fee: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterData();
  }, [rateCards, templates, dataSource, searchQuery, selectedCategory, showActiveOnly]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await Promise.all([loadRateCards(), loadTemplates()]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toastService.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRateCards = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rate_cards')
      .select('*')
      .eq('advocate_id', user.id)
      .order('service_name');

    if (error) throw error;
    setRateCards(data || []);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('standard_service_templates')
      .select('*')
      .order('template_name');

    if (error) throw error;
    setTemplates(data || []);
  };

  const filterData = () => {
    const sourceData = dataSource === 'my-cards' ? rateCards : templates;
    
    let filtered = sourceData.filter((item) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = dataSource === 'my-cards'
        ? (item as RateCard).service_name.toLowerCase().includes(searchLower)
        : (item as ServiceTemplate).template_name.toLowerCase().includes(searchLower);
      
      if (!nameMatch) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const category = dataSource === 'my-cards'
          ? (item as RateCard).service_category
          : (item as ServiceTemplate).service_category;
        if (category !== selectedCategory) return false;
      }

      // Active filter (only for rate cards)
      if (dataSource === 'my-cards' && showActiveOnly) {
        if (!(item as RateCard).is_active) return false;
      }

      return true;
    });

    setFilteredData(filtered);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.service_name) {
      toastService.error('Service name is required');
      return;
    }

    try {
      const dataToSave = {
        advocate_id: user.id,
        service_name: formData.service_name,
        service_description: formData.service_description,
        service_category: formData.service_category,
        matter_type: formData.matter_type,
        pricing_type: formData.pricing_type,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        fixed_fee: formData.fixed_fee ? parseFloat(formData.fixed_fee) : null,
        minimum_fee: formData.minimum_fee ? parseFloat(formData.minimum_fee) : null,
        maximum_fee: formData.maximum_fee ? parseFloat(formData.maximum_fee) : null,
        is_active: formData.is_active,
        is_default: formData.is_default
      };

      if (editingCard) {
        const { error } = await supabase
          .from('rate_cards')
          .update(dataToSave)
          .eq('id', editingCard.id);

        if (error) throw error;
        toastService.success('Rate card updated');
      } else {
        const { error } = await supabase
          .from('rate_cards')
          .insert(dataToSave);

        if (error) throw error;
        toastService.success('Rate card created');
      }

      setShowModal(false);
      resetForm();
      await loadRateCards();
    } catch (error: any) {
      console.error('Failed to save rate card:', error);
      toastService.error(error.message || 'Failed to save rate card');
    }
  };

  const handleEdit = (card: RateCard) => {
    setEditingCard(card);
    setFormData({
      service_name: card.service_name,
      service_description: card.service_description || '',
      service_category: card.service_category,
      matter_type: card.matter_type || '',
      pricing_type: card.pricing_type,
      hourly_rate: card.hourly_rate?.toString() || '',
      fixed_fee: card.fixed_fee?.toString() || '',
      minimum_fee: card.minimum_fee?.toString() || '',
      maximum_fee: card.maximum_fee?.toString() || '',
      is_active: card.is_active,
      is_default: card.is_default
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate card?')) return;

    try {
      const { error } = await supabase
        .from('rate_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toastService.success('Rate card deleted');
      await loadRateCards();
    } catch (error) {
      console.error('Failed to delete rate card:', error);
      toastService.error('Failed to delete rate card');
    }
  };

  const resetForm = () => {
    setEditingCard(null);
    setFormData({
      service_name: '',
      service_description: '',
      service_category: 'consultation',
      matter_type: '',
      pricing_type: 'hourly',
      hourly_rate: '',
      fixed_fee: '',
      minimum_fee: '',
      maximum_fee: '',
      is_active: true,
      is_default: false
    });
  };

  const handleCreateFromTemplate = async (template: ServiceTemplate) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('rate_cards')
        .insert({
          advocate_id: user.id,
          service_name: template.template_name,
          service_description: template.template_description,
          service_category: template.service_category,
          pricing_type: template.default_hourly_rate ? 'hourly' : 'fixed',
          hourly_rate: template.default_hourly_rate,
          fixed_fee: template.default_fixed_fee,
          is_active: true,
          is_default: false
        });

      if (error) throw error;
      toastService.success('Rate card created from template');
      setDataSource('my-cards');
      await loadRateCards();
    } catch (error: any) {
      console.error('Failed to create from template:', error);
      toastService.error(error.message || 'Failed to create rate card');
    }
  };

  const handleDuplicate = async (card: RateCard) => {
    if (!user) return;

    try {
      const { id, ...cardData } = card;
      const { error } = await supabase
        .from('rate_cards')
        .insert({
          ...cardData,
          service_name: `${card.service_name} (Copy)`,
          is_default: false
        });

      if (error) throw error;
      toastService.success('Rate card duplicated');
      await loadRateCards();
    } catch (error) {
      console.error('Failed to duplicate rate card:', error);
      toastService.error('Failed to duplicate rate card');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return `R${amount.toFixed(2)}`;
  };

  const categories = [
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate Cards</h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500 mt-1">
            Manage your service rates and pricing templates
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Rate Card
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Source Toggle */}
        <div className="flex gap-2 bg-gray-100 dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 p-1 rounded-lg">
          <button
            onClick={() => setDataSource('my-cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dataSource === 'my-cards'
                ? 'bg-white dark:bg-metallic-gray-800 dark:bg-metallic-gray-200 text-primary-600 dark:text-primary-400 theme-shadow-sm'
                : 'text-gray-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Star className="h-4 w-4" />
            My Rate Cards ({rateCards.length})
          </button>
          <button
            onClick={() => setDataSource('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dataSource === 'templates'
                ? 'bg-white dark:bg-metallic-gray-800 dark:bg-metallic-gray-200 text-primary-600 dark:text-primary-400 theme-shadow-sm'
                : 'text-gray-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates ({templates.length})
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search rate cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-metallic-gray-400 rounded-lg bg-white dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-900 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-metallic-gray-400 rounded-lg bg-white dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-900 dark:text-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-metallic-gray-800 dark:bg-metallic-gray-200 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-metallic-gray-800 dark:bg-metallic-gray-200 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-neutral-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Only Toggle (for My Cards) */}
      {dataSource === 'my-cards' && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700 dark:text-neutral-300 dark:text-neutral-600">Show active only</span>
        </label>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-metallic-gray-400 rounded-lg">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 dark:text-neutral-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {dataSource === 'my-cards' ? 'No rate cards' : 'No templates found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400 dark:text-neutral-500">
            {dataSource === 'my-cards' 
              ? 'Get started by creating your first rate card or use a template.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dataSource === 'my-cards' ? (
            filteredData.map((card) => (
            <div
              key={(card as RateCard).id}
              className="border border-gray-200 dark:border-metallic-gray-700 rounded-lg p-4 hover:theme-shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {(card as RateCard).service_name}
                  </h3>
                  {(card as RateCard).service_description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500 mt-1">
                      {(card as RateCard).service_description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(card as RateCard)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(card as RateCard)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete((card as RateCard).id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded text-xs font-medium">
                    {(card as RateCard).service_category.replace('_', ' ')}
                  </span>
                  {(card as RateCard).matter_type && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-700 dark:text-neutral-300 dark:text-neutral-600 rounded text-xs">
                      {(card as RateCard).matter_type}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {(card as RateCard).pricing_type === 'hourly' && (card as RateCard).hourly_rate && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency((card as RateCard).hourly_rate)}/hr
                      </span>
                    </div>
                  )}
                  {(card as RateCard).pricing_type === 'fixed' && (card as RateCard).fixed_fee && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency((card as RateCard).fixed_fee)}
                      </span>
                    </div>
                  )}
                </div>

                {((card as RateCard).minimum_fee || (card as RateCard).maximum_fee) && (
                  <div className="text-xs text-gray-500 dark:text-neutral-400 dark:text-neutral-500">
                    Range: {formatCurrency((card as RateCard).minimum_fee)} - {formatCurrency((card as RateCard).maximum_fee)}
                  </div>
                )}

                <div className="flex gap-2">
                  {(card as RateCard).is_default && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs">
                      Default
                    </span>
                  )}
                  {!(card as RateCard).is_active && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-600 dark:text-neutral-400 dark:text-neutral-500 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
          ) : (
            // Template Cards
            filteredData.map((template) => (
              <div
                key={(template as ServiceTemplate).id}
                className="border border-gray-200 dark:border-metallic-gray-700 rounded-lg p-4 hover:theme-shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {(template as ServiceTemplate).template_name}
                      </h3>
                    </div>
                    {(template as ServiceTemplate).template_description && (
                      <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500 mt-1">
                        {(template as ServiceTemplate).template_description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateFromTemplate(template as ServiceTemplate)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Use
                  </Button>
                </div>

                <div className="space-y-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                    {(template as ServiceTemplate).service_category.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-4 text-sm mt-2">
                    {(template as ServiceTemplate).default_hourly_rate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency((template as ServiceTemplate).default_hourly_rate)}/hr
                        </span>
                      </div>
                    )}
                    {(template as ServiceTemplate).default_fixed_fee && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency((template as ServiceTemplate).default_fixed_fee)}
                        </span>
                      </div>
                    )}
                  </div>

                  {(template as ServiceTemplate).estimated_hours && (
                    <div className="text-xs text-gray-600 dark:text-neutral-400 dark:text-neutral-500">
                      Est. {(template as ServiceTemplate).estimated_hours} hours
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // List View
        <div className="space-y-2">
          {dataSource === 'my-cards' ? (
            filteredData.map((card) => (
              <div
                key={(card as RateCard).id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-metallic-gray-700 rounded-lg hover:bg-gray-50 dark:bg-metallic-gray-900 dark:hover:bg-gray-700 dark:bg-metallic-gray-300/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {(card as RateCard).service_name}
                    </h3>
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded text-xs">
                      {(card as RateCard).service_category.replace('_', ' ')}
                    </span>
                    {(card as RateCard).is_default && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs">
                        Default
                      </span>
                    )}
                    {!(card as RateCard).is_active && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-600 dark:text-neutral-400 dark:text-neutral-500 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                  {(card as RateCard).service_description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500 mt-1">
                      {(card as RateCard).service_description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {(card as RateCard).pricing_type === 'hourly' && (card as RateCard).hourly_rate && (
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((card as RateCard).hourly_rate)}/hr
                      </div>
                    )}
                    {(card as RateCard).pricing_type === 'fixed' && (card as RateCard).fixed_fee && (
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((card as RateCard).fixed_fee)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(card as RateCard)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(card as RateCard)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete((card as RateCard).id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Template List View
            filteredData.map((template) => (
              <div
                key={(template as ServiceTemplate).id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-metallic-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {(template as ServiceTemplate).template_name}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                      {(template as ServiceTemplate).service_category.replace('_', ' ')}
                    </span>
                  </div>
                  {(template as ServiceTemplate).template_description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400 dark:text-neutral-500 mt-1">
                      {(template as ServiceTemplate).template_description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    {(template as ServiceTemplate).default_hourly_rate && (
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((template as ServiceTemplate).default_hourly_rate)}/hr
                      </div>
                    )}
                    {(template as ServiceTemplate).default_fixed_fee && (
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((template as ServiceTemplate).default_fixed_fee)}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleCreateFromTemplate(template as ServiceTemplate)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Use Template
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCard ? 'Edit Rate Card' : 'Add Rate Card'}
      >
        <div className="space-y-4">
          <FormInput
            label="Service Name"
            value={formData.service_name}
            onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
            placeholder="e.g., Legal Consultation"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 dark:text-neutral-600 mb-2">
              Service Description
            </label>
            <textarea
              value={formData.service_description}
              onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-400 rounded-lg bg-white dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Brief description of the service"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 dark:text-neutral-600 mb-2">
                Category
              </label>
              <select
                value={formData.service_category}
                onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-400 rounded-lg bg-white dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-900 dark:text-white"
              >
                <option value="consultation">Consultation</option>
                <option value="research">Research</option>
                <option value="drafting">Drafting</option>
                <option value="court_appearance">Court Appearance</option>
                <option value="negotiation">Negotiation</option>
                <option value="document_review">Document Review</option>
                <option value="correspondence">Correspondence</option>
                <option value="filing">Filing</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 dark:text-neutral-600 mb-2">
                Pricing Type
              </label>
              <select
                value={formData.pricing_type}
                onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-metallic-gray-400 rounded-lg bg-white dark:bg-metallic-gray-300 dark:bg-metallic-gray-300 text-gray-900 dark:text-white"
              >
                <option value="hourly">Hourly Rate</option>
                <option value="fixed">Fixed Fee</option>
                <option value="per_item">Per Item</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>

          {formData.pricing_type === 'hourly' && (
            <FormInput
              label="Hourly Rate (R)"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
              placeholder="1500.00"
            />
          )}

          {formData.pricing_type === 'fixed' && (
            <FormInput
              label="Fixed Fee (R)"
              type="number"
              step="0.01"
              value={formData.fixed_fee}
              onChange={(e) => setFormData({ ...formData, fixed_fee: e.target.value })}
              placeholder="5000.00"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Minimum Fee (R)"
              type="number"
              step="0.01"
              value={formData.minimum_fee}
              onChange={(e) => setFormData({ ...formData, minimum_fee: e.target.value })}
              placeholder="Optional"
            />
            <FormInput
              label="Maximum Fee (R)"
              type="number"
              step="0.01"
              value={formData.maximum_fee}
              onChange={(e) => setFormData({ ...formData, maximum_fee: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-neutral-300 dark:text-neutral-600">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-neutral-300 dark:text-neutral-600">Set as Default</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingCard ? 'Update' : 'Create'} Rate Card
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
