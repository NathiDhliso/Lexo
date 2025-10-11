import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, Button } from '../design-system/components';
import { briefApiService } from '../../services/api/brief-api.service';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import type { Brief, BriefStatus } from '../../types';

interface BriefsListProps {
  matterId: string;
  onBriefSelect?: (brief: Brief) => void;
}

export const BriefsList: React.FC<BriefsListProps> = ({ matterId, onBriefSelect }) => {
  const { user } = useAuth();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefs();
  }, [matterId]);

  const fetchBriefs = async () => {
    if (!matterId) return;

    setLoading(true);
    try {
      const { data, error } = await briefApiService.getByMatter(matterId);
      
      if (error) {
        toast.error('Failed to load briefs');
        setBriefs([]);
      } else {
        setBriefs(data || []);
      }
    } catch (err) {
      console.error('Error fetching briefs:', err);
      toast.error('Unexpected error loading briefs');
      setBriefs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BriefStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
      default:
        return 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getStatusIcon = (status: BriefStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'active':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'emergency':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const isOverdue = (brief: Brief) => {
    if (!brief.deadline) return false;
    const today = new Date().toISOString().split('T')[0];
    return brief.deadline < today && (brief.status === 'active' || brief.status === 'pending');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading briefs...</p>
        </CardContent>
      </Card>
    );
  }

  if (briefs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Briefs Yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            This matter doesn't have any briefs associated with it yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Briefs ({briefs.length})
        </h3>
      </div>

      <div className="space-y-3">
        {briefs.map((brief) => (
          <Card 
            key={brief.id} 
            variant="default" 
            hoverable
            onClick={() => onBriefSelect?.(brief)}
            className="cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {brief.brief_title}
                    </h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(brief.status)}`}>
                      {getStatusIcon(brief.status)}
                      {brief.status}
                    </span>
                    {isOverdue(brief) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                      <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                        {brief.brief_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Brief #:</span>
                      <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                        {brief.brief_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Priority:</span>
                      <span className={`ml-2 font-medium capitalize ${getPriorityColor(brief.priority)}`}>
                        {brief.priority}
                      </span>
                    </div>
                  </div>

                  {brief.deadline && (
                    <div className="mt-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Deadline: {new Date(brief.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  {brief.description && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {brief.description}
                    </p>
                  )}
                </div>

                <div className="ml-4 text-right">
                  {brief.wip_value > 0 && (
                    <div className="text-sm">
                      <div className="text-neutral-600 dark:text-neutral-400">WIP</div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        R{brief.wip_value.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
