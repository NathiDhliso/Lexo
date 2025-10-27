/**
 * My Matters Page
 * Attorney view of their matters
 */
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Clock,
  Eye,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button, Input, Select } from '../../components/design-system/components';
import { useNavigate } from 'react-router-dom';

interface Matter {
  id: string;
  title: string;
  client_name: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  matter_type: string;
  estimated_value?: number;
  created_at: string;
  updated_at: string;
  description?: string;
  advocate_id: string;
}

export const MyMattersPage: React.FC = () => {
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadMatters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [matters, searchTerm, statusFilter, typeFilter]);

  const loadMatters = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('instructing_attorney', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMatters(data || []);
    } catch (error) {
      console.error('Error loading matters:', error);
      toast.error('Failed to load matters');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...matters];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(matter => matter.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(matter => matter.matter_type === typeFilter);
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(matter => 
        matter.title.toLowerCase().includes(searchLower) ||
        matter.client_name.toLowerCase().includes(searchLower) ||
        matter.matter_type.toLowerCase().includes(searchLower)
      );
    }

    setFilteredMatters(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getMatterTypes = () => {
    const types = [...new Set(matters.map(m => m.matter_type))];
    return types.filter(Boolean);
  };

  const handleViewMatter = (matterId: string) => {
    // Navigate to matter details or workbench
    navigate(`/matters/${matterId}/workbench`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Matters
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Matters where you are the instructing attorney
          </p>
        </div>
        <Button onClick={() => navigate('/attorney/submit-matter')}>
          Submit New Matter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Matters</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {matters.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active</p>
                <p className="text-2xl font-bold text-status-success-600 dark:text-status-success-400">
                  {matters.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-status-success-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Completed</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {matters.filter(m => m.status === 'completed').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Value</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(matters.reduce((sum, m) => sum + (m.estimated_value || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search matters..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="pl-10"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                className="pl-10"
              >
                <option value="all">All Types</option>
                {getMatterTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matters List */}
      {filteredMatters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No matching matters' 
                  : 'No matters yet'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Submit your first matter to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => navigate('/attorney/submit-matter')}>
                  Submit New Matter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatters.map((matter) => (
            <Card key={matter.id} hoverable>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {matter.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(matter.status)}`}>
                        {matter.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {matter.client_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {matter.matter_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-neutral-400">Created:</span>
                        <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                          {new Date(matter.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {matter.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {matter.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {matter.estimated_value && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatRand(matter.estimated_value)}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Estimated Value
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewMatter(matter.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implement messaging/communication
                          toast('Communication feature coming soon');
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMattersPage;