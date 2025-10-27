/**
 * ViewPaymentHistoryForm Component
 * Displays payment history for an invoice
 */

import React from 'react';
import { PaymentHistoryTable } from '../../../invoices/PaymentHistoryTable';
import type { Invoice } from '../../../../types';

interface ViewPaymentHistoryFormProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentChange?: () => void;
}

export const ViewPaymentHistoryForm: React.FC<ViewPaymentHistoryFormProps> = ({
  invoice,
  onClose,
  onPaymentChange
}) => {
  return (
    <div className="space-y-4">
      <PaymentHistoryTable 
        invoiceId={invoice.id} 
        onPaymentChange={onPaymentChange}
      />
    </div>
  );
};
