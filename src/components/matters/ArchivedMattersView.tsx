/**
 * Archived Matters View Component
 * Displays archived matters with unarchive functionality
 */

import React, { useState, useEffect } from 'react';
import { Archive, RotateCcw, Search, Calendar, FileText } from 'lucide-react';
import { matterSearchService, type ArchivedMatter } from '@/services/api/matter-search.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ArchivedMattersViewProps {
  onUnarchive?: () => void;
}

export const ArchivedMattersView: React.FC<ArchivedMattersViewProps> = ({ onUnarchive }) => {
  const { user } = useAuth();
  const [archivedMatters, setArchivedMatters] = useState<ArchivedMatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadArchivedMatters();
  }, [page]);

  const loadArchivedMatters = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await matterSearchService.getArchivedMatters(user.id, page, pageSize);
      setArchivedMatters(result.matters);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Error loading archived matters:', error);
      toast.error('Failed to load archived matters');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (matter: ArchivedMatter) => {
    if (!user?.id) return;

    const confirmed = window.confirm(`Restore "${matter.title}" to active matters?`);
    if (!confirmed) return;

    const success = await matterSearchService.unarchiveMatter(matter.id, user.id);
    if (success) {
      await loadArchivedMatters();
      if (onUnarchive) {
        onUnarchive();
      }
    }
  };

  const filteredMatters = archivedMatters.filter(matter =>
    matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    matter.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    matter.instructing_firm?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (archivedMatters.length === 0) {
    return (
      <div className="text-center py-12">
        <Archive className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No archived matters</h3>
        <p className="mt-1 text-sm text-gray-500">
          Archived matters will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search archived matters..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Archived Matters List */}
      <div className="space-y-3">
        {filteredMatters.map((matter) => (
          <div
            key={matter.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{matter.title}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Archive className="w-3 h-3 mr-1" />
                    ARCHIVED
                  </span>
                </div>
                
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-1" />
                    <span className="font-medium">Ref:</span>
                    <span className="ml-1">{matter.reference_number}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Client:</span>
                    <span className="ml-1">{matter.client_name}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Firm:</span>
                    <span className="ml-1">{matter.instructing_firm}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Archived: {new Date(matter.archived_at).toLocaleDateString()}
                  </div>
                  {matter.archive_reason && (
                    <div className="text-gray-600">
                      <span className="font-medium">Reason:</span>
                      <span className="ml-1">{matter.archive_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleUnarchive(matter)}
                className="ml-4 inline-flex items-center px-3 py-2 border border-green-300 rounded-md
                         text-sm font-medium text-green-700 bg-white hover:bg-green-50
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Unarchive
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium
                       text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium
                       text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
