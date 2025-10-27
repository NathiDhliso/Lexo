/**
 * Attorney Dashboard Page
 * Overview dashboard for attorneys to see their matters and activity
 */
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRand } from '../../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button } from '../../components/design-system/components';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  activeMatters: number;
  totalValue: number;
  recentActivity: number;
  upcomingDeadlines: number;
}

interface RecentMatter {
  id: string;
  title: string;
  client_name: string;
  status: string;
  created_at: string;
  estimated_value?: number;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  matter_title: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
}

export const AttorneyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeMatters: 0,
    totalValue: 0,
    recentActivity: 0,
    upcomingDeadlines: 0
  });
  const [recentMatters, setRecentMatters] = useState<RecentMatter[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load matters where user is the instructing attorney
      const { data: matters, error: mattersError } = await supabase
        .from('matters')
        .select('id, title, client_name, status, created_at, estimated_value')
        .eq('instructing_attorney', user.email)
        .order('created_at', { ascending: false });

      if (mattersError) throw mattersError;

      // Calculate stats
      const activeMatters = matters?.filter(m => m.status === 'active') || [];
      const totalValue = activeMatters.reduce((sum, m) => sum + (m.estimated_value || 0), 0);

      setStats({
        activeMatters: activeMatters.length,
        totalValue,
        recentActivity: matters?.length || 0,
        upcomingDeadlines: 0 // Will be calculated from deadlines
      });

      setRecentMatters(matters?.slice(0, 5) || []);

      // Load upcoming deadlines (mock for now - would need deadlines table)
      const mockDeadlines: UpcomingDeadline[] = [
        {
          id: '1',
          title: 'File court documents',
          matter_title: 'Smith v. Jones',
          due_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
          priority: 'high'
        },
        {
          id: '2',
          title: 'Client meeting',
          matter_title: 'Estate Planning - Brown',
          due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
          priority: 'medium'
        }
      ];

      setUpcomingDeadlines(mockDeadlines);
      setStats(prev => ({ ...prev, upcomingDeadlines: mockDeadlines.length }));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-status-error-600 dark:text-status-error-400';
      case 'medium':
        return 'text-status-warning-600 dark:text-status-warning-400';
      case 'low':
        return 'text-status-success-600 dark:text-status-success-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-metallic-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-metallic-gray-700 rounded"></div>
            ))}
          </div>
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
            Attorney Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Overview of your matters and activity
          </p>
        </div>
        <Button onClick={() => navigate('/attorney/submit-matter')}>
          Submit New Matter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Matters</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.activeMatters}
                </p>
              </div>
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Value</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-status-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Recent Activity</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.recentActivity}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.upcomingDeadlines}
                </p>
              </div>
              <Clock className="w-8 h-8 text-status-warning-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Matters
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/attorney/matters')}
              >
                View All
              </Button>
            </div>

            {recentMatters.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">No matters yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatters.map((matter) => (
                  <div 
                    key={matter.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {matter.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {matter.client_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(matter.status)}`}>
                        {matter.status.toUpperCase()}
                      </span>
                      {matter.estimated_value && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {formatRand(matter.estimated_value)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Upcoming Deadlines
              </h3>
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-status-success-400 mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div 
                    key={deadline.id}
                    className="flex items-start justify-between p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${getPriorityColor(deadline.priority)}`} />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {deadline.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {deadline.matter_title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {new Date(deadline.due_date).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/attorney/submit-matter')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Submit New Matter
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/attorney/matters')}
            >
              <Users className="w-4 h-4 mr-2" />
              View My Matters
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate('/attorney/invoices')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              View Invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttorneyDashboardPage;