/**
 * Workbench Expenses Tab
 * View and manage expenses/disbursements for the matter
 * Requirements: 2.1, 2.4
 */
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DisbursementsTable } from '../../disbursements/DisbursementsTable';
import { LogDisbursementModal } from '../../disbursements/LogDisbursementModal';
import { EditDisbursementModal } from '../../disbursements/EditDisbursementModal';
import { DisbursementService, Disbursement } from '../../../services/api/disbursement.service';
import { Button } from '../../ui/Button';

interface WorkbenchExpensesTabProps {
  matterId: string;
}

export const WorkbenchExpensesTab: React.FC<WorkbenchExpensesTabProps> = ({
  matterId,
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
  const [unbilledTotal, setUnbilledTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUnbilledTotal();
  }, [matterId, refreshKey]);

  const loadUnbilledTotal = async () => {
    try {
      const unbilled = await DisbursementService.getUnbilledDisbursements(matterId);
      const total = unbilled.reduce((sum, d) => sum + d.total_amount, 0);
      setUnbilledTotal(total);
    } catch (error) {
      console.error('Error loading unbilled total:', error);
    }
  };

  const handleEdit = (disbursement: Disbursement) => {
    setSelectedDisbursement(disbursement);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Disbursements</h3>
          <p className="text-sm text-gray-600">
            Track expenses incurred on behalf of the client
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowLogModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Disbursement
        </Button>
      </div>

      {/* Unbilled Total Card */}
      {unbilledTotal > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">Unbilled Disbursements</p>
              <p className="text-xs text-yellow-600 mt-1">
                Ready to be included in the next invoice
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-900">
                R {unbilledTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disbursements Table */}
      <DisbursementsTable
        key={refreshKey}
        matterId={matterId}
        onEdit={handleEdit}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      <LogDisbursementModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        matterId={matterId}
        onSuccess={handleRefresh}
      />

      <EditDisbursementModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDisbursement(null);
        }}
        disbursement={selectedDisbursement}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
