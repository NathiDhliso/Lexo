/**
 * ReportModal Component
 * Modal for generating and viewing reports
 */

import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AsyncButton } from '../ui/AsyncButton';
import { FormInput } from '../ui/FormInput';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { toastService } from '../../services/toast.service';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  matterType?: string;
  clientId?: string;
  status?: string;
}

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  onGenerate: (filters: ReportFilter) => Promise<any>;
  onExportCSV?: (data: any) => void;
  onExportPDF?: (data: any) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  onGenerate,
  onExportCSV,
  onExportPDF,
}) => {
  const [filters, setFilters] = useState<ReportFilter>({});
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await onGenerate(filters);
      setReportData(data);
      toastService.success('Report generated successfully');
    } catch (error) {
      toastService.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (onExportCSV && reportData) {
      onExportCSV(reportData);
      toastService.success('Report exported to CSV');
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF && reportData) {
      onExportPDF(reportData);
      toastService.success('Report exported to PDF');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportTitle}
      size="xl"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Start Date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <FormInput
            label="End Date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-between items-center">
          <AsyncButton
            variant="primary"
            onAsyncClick={handleGenerate}
            successMessage="Report generated"
            errorMessage="Failed to generate report"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </AsyncButton>

          {reportData && (
            <div className="flex gap-2">
              {onExportCSV && (
                <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              )}
              {onExportPDF && (
                <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Report Data */}
        {isGenerating && <LoadingOverlay isLoading={true} message="Generating report..." />}
        
        {reportData && !isGenerating && (
          <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-metallic-gray-900">
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReportModal;
