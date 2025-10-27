/**
 * WIP (Work in Progress) Report Page
 * Dedicated page for WIP reporting with enhanced features
 */
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { reportsService, type WIPReportData, type ReportFilter } from '../services/api/reports.service';
import { formatRand } from '../lib/currency';
import { toast } from 'react-hot-toast';
import { Card, CardContent, Button, Select, Input } from '../components/design-system/components';
import { exportToCSV } from '../utils/export.utils';
import { useNavigate } from 'react-router-dom';

export const WIPReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<WIPReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const data = await reportsService.generateWIPReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error generating WIP report:', error);
      toast.error('Failed to generate WIP report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const exportData = reportData.matters.map(matter => ({
      'Matter': matter.name,
      'Client': matter.client,
      'Unbilled Amount': matter.unbilledAmount,
      'Hours': matter.hours,
      'Disbursements': matter.disbursements || 0,
      'Days in WIP': matter.daysInWIP || 0,
      'Average Rate': matter.hours > 0 ? Math.round(matter.unbilledAmount / matter.hours) : 0
    }));

    exportToCSV(exportData, 'wip-report');
    toast.success('WIP report exported successfully');
  };

  const updateFilter = (key: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getWIPAging = (daysInWIP: number) => {
    if (daysInWIP <= 30) return { label: 'Current (0-30 days)', color: 'text-status-success-600 dark:text-status-success-400' };
    if (daysInWIP <= 60) return { label: '31-60 days', color: 'text-status-warning-600 dark:text-status-warning-400' };
    if (daysInWIP <= 90) return { label: '61-90 days', color: 'text-orange-600 dark:text-orange-400' };
    return { label: '90+ days', color: 'text-status-error-600 dark:text-status-error-400' };
  };

  const getAgingStats = () => {
    if (!reportData) return { current: 0, aging30: 0, aging60: 0, aging90: 0 };

    return reportData.matters.reduce((acc, matter) => {
      const days = matter.daysInWIP || 0;
      if (days <= 30) acc.current += matter.unbilledAmount;
      else if (days <= 60) acc.aging30 += matter.unbilledAmount;
      else if (days <= 90) acc.aging60 += matter.unbilledAmount;
      else acc.aging90 += matter.unbilledAmount;
      return acc;
    }, { current: 0, aging30: 0, aging60: 0, aging90: 0 });
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

  const agingStats = getAgingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Work in Progress Report
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track unbilled time and disbursements across all active matters
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!reportData || reportData.matters.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={generateReport} disabled={loading}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Matter Type
              </label>
              <Select
                value={filters.matterType || 'all'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  updateFilter('matterType', e.target.value === 'all' ? '' : e.target.value)
                }
              >
                <option value="all">All Types</option>
                <option value="litigation">Litigation</option>
                <option value="corporate">Corporate</option>
                <option value="property">Property</option>
                <option value="family">Family</option>
                <option value="criminal">Criminal</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total WIP</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(reportData?.totalUnbilled || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Matters</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {reportData?.matters.length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-status-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Hours</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {reportData?.matters.reduce((sum, m) => sum + m.hours, 0) || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-status-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Disbursements</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatRand(reportData?.totalDisbursements || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WIP Aging Analysis */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            WIP Aging Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-status-success-50 dark:bg-status-success-900/20 rounded-lg">
              <p className="text-sm text-status-success-600 dark:text-status-success-400 font-medium">
                Current (0-30 days)
              </p>
              <p className="text-xl font-bold text-status-success-700 dark:text-status-success-300">
                {formatRand(agingStats.current)}
              </p>
            </div>
            <div className="text-center p-4 bg-status-warning-50 dark:bg-status-warning-900/20 rounded-lg">
              <p className="text-sm text-status-warning-600 dark:text-status-warning-400 font-medium">
                31-60 days
              </p>
              <p className="text-xl font-bold text-status-warning-700 dark:text-status-warning-300">
                {formatRand(agingStats.aging30)}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                61-90 days
              </p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                {formatRand(agingStats.aging60)}
              </p>
            </div>
            <div className="text-center p-4 bg-status-error-50 dark:bg-status-error-900/20 rounded-lg">
              <p className="text-sm text-status-error-600 dark:text-status-error-400 font-medium">
                90+ days
              </p>
              <p className="text-xl font-bold text-status-error-700 dark:text-status-error-300">
                {formatRand(agingStats.aging90)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WIP Details */}
      {!reportData || reportData.matters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No WIP data found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                No unbilled time or disbursements found for the selected period
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                WIP Details ({reportData.matters.length} matters)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-metallic-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Matter
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Client
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Hours
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Disbursements
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Total WIP
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Aging
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.matters.map((matter, index) => {
                    const aging = getWIPAging(matter.daysInWIP || 0);
                    const avgRate = matter.hours > 0 ? matter.unbilledAmount / matter.hours : 0;
                    
                    return (
                      <tr 
                        key={matter.id || index}
                        className="border-b border-neutral-100 dark:border-metallic-gray-800 hover:bg-neutral-50 dark:hover:bg-metallic-gray-800/50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {matter.name}
                            </p>
                            {avgRate > 0 && (
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Avg rate: {formatRand(avgRate)}/hr
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100">
                          {matter.client}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-900 dark:text-neutral-100">
                          {matter.hours.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-900 dark:text-neutral-100">
                          {formatRand(matter.disbursements || 0)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatRand(matter.unbilledAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={`text-sm font-medium ${aging.color}`}>
                              {matter.daysInWIP || 0} days
                            </span>
                            {(matter.daysInWIP || 0) > 60 && (
                              <AlertCircle className="w-4 h-4 text-status-warning-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/matters/${matter.id}/workbench`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Row */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-neutral-900 dark:text-neutral-100">
                  Total ({reportData.matters.length} matters)
                </span>
                <div className="flex gap-8">
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {reportData.matters.reduce((sum, m) => sum + m.hours, 0).toFixed(1)} hours
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {formatRand(reportData.totalDisbursements || 0)} disbursements
                  </span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatRand(reportData.totalUnbilled)} total WIP
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WIPReportPage;