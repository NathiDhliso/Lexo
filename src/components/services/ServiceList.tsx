import React, { useState, useEffect } from 'react';
import { Briefcase, Edit, Trash2, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../design-system/components';
import { LogServiceModal } from './LogServiceModal';
import { LoggedServicesService } from '../../services/api/logged-services.service';
import type { LoggedService } from '../../types/financial.types';

interface ServiceListProps {
  matterId: string;
  matterTitle: string;
}

export const ServiceList: React.FC<ServiceListProps> = ({
  matterId,
  matterTitle
}) => {
  const [services, setServices] = useState<LoggedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState<LoggedService | null>(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      const result = await LoggedServicesService.getServicesByMatter(matterId, false);
      // Filter out invoiced items
      const uninvoicedServices = result.filter(service => !service.invoice_id);
      setServices(uninvoicedServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [matterId]);

  const handleAdd = () => {
    setSelectedService(null);
    setShowModal(true);
  };

  const handleEdit = (service: LoggedService) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleDelete = async (service: LoggedService) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await LoggedServicesService.deleteService(service.id);
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleSave = () => {
    loadServices();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotal = () => {
    return services.reduce((sum, service) => {
      return sum + (service.amount || 0);
    }, 0);
  };

  const calculateTotalQuantity = () => {
    return services.reduce((sum, service) => sum + (service.quantity || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Services</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Service
        </Button>
      </div>

      {services.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Quantity</div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {calculateTotalQuantity()}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                R{calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg border border-neutral-200 dark:border-metallic-gray-700">
          <Briefcase className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">No services logged yet</p>
          <Button variant="primary" onClick={handleAdd} className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Log Your First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service) => {
            const quantity = service.quantity || 0;
            const unitRate = service.unit_rate || 0;
            const amount = service.amount || 0;

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-metallic-gray-800 rounded-lg border border-neutral-200 dark:border-metallic-gray-700 hover:border-purple-300 dark:hover:border-purple-700 p-4 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(service.service_date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        <Briefcase className="w-4 h-4" />
                        {service.service_type}
                      </div>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Qty: {quantity} × R{unitRate.toLocaleString('en-ZA')}
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        R{amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LogServiceModal
        matterId={matterId}
        matterTitle={matterTitle}
        service={selectedService}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isEstimate={false}
      />
    </div>
  );
};
