import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../design-system/components';
import { 
  rateCardService, 
  RateCard, 
  StandardServiceTemplate,
  ServiceCategory 
} from '../../services/rate-card.service';
import { toast } from 'react-hot-toast';

interface RateCardManagementProps {
  onCreateNew?: () => void;
}

export const RateCardManagement: React.FC<RateCardManagementProps> = ({ onCreateNew }) => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [templates, setTemplates] = useState<StandardServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsData, templatesData] = await Promise.all([
        rateCardService.getRateCards({
          is_active: true,
          ...(selectedCategory !== 'all' && { service_category: selectedCategory })
        }),
        rateCardService.getStandardServiceTemplates({
          ...(selectedCategory !== 'all' && { service_category: selectedCategory })
        })
      ]);
      setRateCards(cardsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading rate cards:', error);
      toast.error('Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template: StandardServiceTemplate) => {
    try {
      const newCard = await rateCardService.createFromTemplate(template.id);
      setRateCards(prev => [...prev, newCard]);
      toast.success(`Created rate card from ${template.template_name}`);
    } catch (error) {
      console.error('Error creating from template:', error);
      toast.error('Failed to create rate card');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate card?')) return;
    
    try {
      await rateCardService.delete(id);
      setRateCards(prev => prev.filter(card => card.id !== id));
      toast.success('Rate card deleted');
    } catch (error) {
      console.error('Error deleting rate card:', error);
      toast.error('Failed to delete rate card');
    }
  };

  const handleToggleActive = async (card: RateCard) => {
    try {
      await rateCardService.updateRateCard(card.id, { is_active: !card.is_active } as any);
      setRateCards(prev => prev.map(c => 
        c.id === card.id ? { ...c, is_active: !c.is_active } : c
      ));
      toast.success(card.is_active ? 'Rate card deactivated' : 'Rate card activated');
    } catch (error) {
      console.error('Error toggling rate card:', error);
      toast.error('Failed to update rate card');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
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

  const getStats = () => {
    const totalCards = rateCards.length;
    const activeCards = rateCards.filter(c => c.is_active).length;
    const avgHourlyRate = rateCards
      .filter(c => c.hourly_rate)
      .reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / (rateCards.filter(c => c.hourly_rate).length || 1);
    
    return { totalCards, activeCards, avgHourlyRate };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Rate Cards</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{stats.totalCards}</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Active Cards</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeCards}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-neutral-400">Avg Hourly Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(stats.avgHourlyRate)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Standard Service Templates
            </CardTitle>
            <Badge variant="outline">{templates.length} templates</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Quick Start with Templates</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Create rate cards instantly from our pre-configured South African legal service templates. 
                  These templates include standard pricing for common legal services.
                </p>
              </div>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-neutral-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
              <p>No templates available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 6).map(template => (
                <div 
                  key={template.id} 
                  className="border rounded-lg p-4 hover:theme-shadow-md transition-shadow bg-white dark:bg-metallic-gray-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-neutral-100">{template.template_name}</h4>
                    <Badge className={getCategoryColor(template.service_category)}>
                      {template.service_category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {template.template_description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3 line-clamp-2">
                      {template.template_description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3 text-sm">
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
                        <span className="text-gray-600 dark:text-neutral-400">{template.estimated_hours}h</span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleCreateFromTemplate(template)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create from Template
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {templates.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All {templates.length} Templates
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Your Rate Cards
            </CardTitle>
            <Button onClick={onCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rateCards.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-neutral-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">No Rate Cards Yet</h3>
              <p className="text-gray-600 dark:text-neutral-400 mb-6">
                Create your first rate card from a template or start from scratch
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Rate Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rateCards.map(card => (
                <div 
                  key={card.id} 
                  className="border rounded-lg p-4 hover:theme-shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-neutral-100">{card.service_name}</h4>
                        <Badge className={getCategoryColor(card.service_category)}>
                          {card.service_category.replace('_', ' ')}
                        </Badge>
                        {card.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 dark:text-neutral-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {card.is_default && (
                          <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                      
                      {card.service_description && (
                        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">{card.service_description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {card.pricing_type === 'hourly'
                              ? `${formatCurrency(card.hourly_rate || 0)}/hour`
                              : formatCurrency(card.fixed_fee || 0)
                            }
                          </span>
                        </div>
                        
                        {card.estimated_hours_min && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-600 dark:text-neutral-400">
                              {card.estimated_hours_min}
                              {card.estimated_hours_max && card.estimated_hours_max !== card.estimated_hours_min 
                                ? `-${card.estimated_hours_max}` 
                                : ''
                              }h
                            </span>
                          </div>
                        )}
                        
                        {card.matter_type && (
                          <Badge variant="outline" className="text-xs">
                            {card.matter_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(card)}
                        title={card.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {card.is_active ? (
                          <XCircle className="h-4 w-4 text-gray-600 dark:text-neutral-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(card.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RateCardManagement;
