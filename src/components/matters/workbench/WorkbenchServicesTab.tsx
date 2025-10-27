/**
 * Workbench Services Tab
 * View and manage logged services for the matter
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../../design-system/components';
import { LogServiceModal } from '../../services/LogServiceModal';
import { LoggedServicesService } from '../../../services/api/logged-services.service';
import { formatRand } from '../../../lib/currency';
import { toast } from 'react-hot-toast';

interface WorkbenchServicesTabProps {
  matterId: string;
}

interface LoggedService {
  id: string;
  matter_id: string;
  service_date: string;
  description: string;
  amount: number;
  is_estimate: boolean;
  invoice_id?: string;
}

export const WorkbenchServicesTab: React.FC<WorkbenchServicesTabProps> = ({
  matterId,
}) => {
  const [services, setServices] = useState<LoggedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    loadServices();
  }, [matterId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await LoggedServicesService.getServicesByMatter(matterId, false);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceLogged = () => {
    setShowLogModal(false);
    loadServices();
  };

  const totalUnbilled = services
    .filter(s => !s.invoice_id)
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Logged Services
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Record flat-fee services performed
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Service</span>
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Unbilled Services</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatRand(totalUnbilled)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Services Logged</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{services.length}</p>
          </div>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900/50 rounded-lg">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">No services logged yet</p>
          <Button variant="outline" onClick={() => setShowLogModal(true)}>
            Log First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(service.service_date).toLocaleDateString('en-ZA')}</span>
                    </div>
                    {service.invoice_id && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded">
                        Billed
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatRand(service.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Service Modal */}
      {showLogModal && (
        <LogServiceModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          matterId={matterId}
          onSave={handleServiceLogged}
        />
      )}
    </div>
  );
};
