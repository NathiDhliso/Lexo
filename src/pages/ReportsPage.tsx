import React, { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  PieChart,
  Settings
} from 'lucide-react';
import { ReportCard } from '../components/reports/ReportCard';
import { ReportModal } from '../components/reports/ReportModal';
import { reportsService } from '../services/api/reports.service';
import { exportToCSV, exportToPDF } from '../utils/export.utils';
import { useModalState } from '../hooks/useModalState';
import { toastService } from '../services/toast.service';

type ReportType = 'wip' | 'revenue' | 'pipeline' | 'client-revenue' | 'time-entry' | 'outstanding' | 'aging' | 'profitability' | 'custom';

interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: any;
  tier: 'free' | 'pro' | 'enterprise';
}

const reportConfigs: ReportConfig[] = [
  {
    id: 'wip',
    title: 'WIP Report',
    description: 'View unbilled work in progress',
    icon: FileText,
    tier: 'free',
  },
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Track revenue and income',
    icon: DollarSign,
    tier: 'free',
  },
  {
    id: 'pipeline',
    title: 'Matter Pipeline',
    description: 'View matter status pipeline',
    icon: TrendingUp,
    tier: 'pro',
  },
  {
    id: 'client-revenue',
    title: 'Client Revenue',
    description: 'Revenue breakdown by client',
    icon: Users,
    tier: 'pro',
  },
  {
    id: 'time-entry',
    title: 'Time Entry Summary',
    description: 'Analyze time tracking data',
    icon: Clock,
    tier: 'free',
  },
  {
    id: 'outstanding',
    title: 'Outstanding Invoices',
    description: 'View unpaid invoices',
    icon: AlertCircle,
    tier: 'free',
  },
  {
    id: 'aging',
    title: 'Aging Report',
    description: 'Track invoice aging periods',
    icon: BarChart3,
    tier: 'pro',
  },
  {
    id: 'profitability',
    title: 'Matter Profitability',
    description: 'Analyze matter profitability',
    icon: PieChart,
    tier: 'enterprise',
  },
  {
    id: 'custom',
    title: 'Custom Report',
    description: 'Build your own custom report',
    icon: Settings,
    tier: 'enterprise',
  },
];

export const ReportsPage: React.FC = () => {
  const { isOpen: modalOpen, open: openModal, close: closeModal } = useModalState();
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  const handleOpenReport = (reportType: ReportType) => {
    setActiveReport(reportType);
    openModal();
  };

  const handleGenerateReport = async (filters: any) => {
    try {
      let data;
      
      switch (activeReport) {
        case 'wip':
          data = await reportsService.generateWIPReport(filters);
          break;
        case 'revenue':
          data = await reportsService.generateRevenueReport(filters);
          break;
        case 'pipeline':
          data = await reportsService.generatePipelineReport(filters);
          break;
        case 'client-revenue':
          data = await reportsService.generateClientRevenueReport(filters);
          break;
        case 'time-entry':
          data = await reportsService.generateTimeEntryReport(filters);
          break;
        case 'outstanding':
          data = await reportsService.generateOutstandingInvoicesReport(filters);
          break;
        case 'aging':
          data = await reportsService.generateAgingReport(filters);
          break;
        case 'profitability':
          data = await reportsService.generateProfitabilityReport(filters);
          break;
        case 'custom':
          data = await reportsService.generateCustomReport(filters);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      toastService.error('Failed to generate report');
      throw error;
    }
  };

  const handleExportCSV = (data: any) => {
    if (!data || !activeReport) return;
    
    const filename = `${activeReport}-report`;
    
    // Convert data to array format if needed
    const exportData = Array.isArray(data) ? data : [data];
    
    exportToCSV(exportData, filename);
    toastService.success('Report exported to CSV');
  };

  const handleExportPDF = async (data: any) => {
    if (!data || !activeReport) return;
    
    const filename = `${activeReport}-report`;
    const title = getReportTitle();
    
    // Convert data to array format if needed
    const exportData = Array.isArray(data) ? data : [data];
    
    await exportToPDF(exportData, filename, title);
    toastService.success('Report exported to PDF');
  };

  const getReportTitle = () => {
    if (!activeReport) return '';
    const config = reportConfigs.find(r => r.id === activeReport);
    return config?.title || '';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Generate comprehensive reports to analyze your practice performance
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportConfigs.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            onClick={() => handleOpenReport(report.id)}
            tier={report.tier}
            locked={false} // Set to true if user doesn't have access to this tier
          />
        ))}
      </div>

      {/* Report Modal */}
      {activeReport && (
        <ReportModal
          isOpen={modalOpen}
          onClose={closeModal}
          reportTitle={getReportTitle()}
          onGenerate={handleGenerateReport}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
      )}
    </div>
  );
};

export default ReportsPage;
