/**
 * usePaymentModal Hook
 * Convenient hook for managing PaymentModal state
 * 
 * @example
 * const paymentModal = usePaymentModal();
 * 
 * // Record payment
 * paymentModal.recordPayment(invoice);
 * 
 * // View payment history
 * paymentModal.viewHistory(invoice);
 * 
 * // Issue credit note
 * paymentModal.issueCreditNote(invoice);
 */

import { useState, useCallback } from 'react';
import type { Invoice } from '../../../../types';
import type { PaymentModalMode } from '../PaymentModal';

interface UsePaymentModalReturn {
  isOpen: boolean;
  mode: PaymentModalMode;
  invoice: Invoice | null;
  recordPayment: (invoice: Invoice) => void;
  viewHistory: (invoice: Invoice) => void;
  issueCreditNote: (invoice: Invoice) => void;
  close: () => void;
}

export const usePaymentModal = (): UsePaymentModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PaymentModalMode>('record');
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const recordPayment = useCallback((invoice: Invoice) => {
    setInvoice(invoice);
    setMode('record');
    setIsOpen(true);
  }, []);

  const viewHistory = useCallback((invoice: Invoice) => {
    setInvoice(invoice);
    setMode('view');
    setIsOpen(true);
  }, []);

  const issueCreditNote = useCallback((invoice: Invoice) => {
    setInvoice(invoice);
    setMode('credit-note');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing state to allow modal close animation
    setTimeout(() => {
      setInvoice(null);
    }, 300);
  }, []);

  return {
    isOpen,
    mode,
    invoice,
    recordPayment,
    viewHistory,
    issueCreditNote,
    close
  };
};
