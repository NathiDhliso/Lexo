import { useState, useEffect } from 'react';
import { AutoPopulationService } from '../services/auto-population.service';
import type { Matter } from '../types';

interface UseAutoPopulationOptions {
  matter?: Matter;
  calculateUnbilled?: boolean;
}

export const useAutoPopulation = (options: UseAutoPopulationOptions = {}) => {
  const { matter, calculateUnbilled = false } = options;
  const [unbilledAmount, setUnbilledAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matter && calculateUnbilled) {
      loadUnbilledAmount();
    }
  }, [matter?.id, calculateUnbilled]);

  const loadUnbilledAmount = async () => {
    if (!matter?.id) return;

    setLoading(true);
    try {
      const amount = await AutoPopulationService.getTotalUnbilledAmount(matter.id);
      setUnbilledAmount(amount);
    } catch (error) {
      console.error('Error loading unbilled amount:', error);
      setUnbilledAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const prepareProFormaData = () => {
    if (!matter) return null;
    return AutoPopulationService.prepareProFormaFromMatter(matter, unbilledAmount);
  };

  const prepareInvoiceData = (proForma: any) => {
    if (!matter) return null;
    return AutoPopulationService.prepareInvoiceFromProForma(proForma, matter);
  };

  const extractClientData = () => {
    if (!matter) return null;
    return AutoPopulationService.extractClientData(matter);
  };

  const extractAttorneyData = () => {
    if (!matter) return null;
    return AutoPopulationService.extractAttorneyData(matter);
  };

  const generateNarrative = (amount?: number) => {
    if (!matter) return '';
    return AutoPopulationService.generateDefaultNarrative(matter, amount);
  };

  return {
    unbilledAmount,
    loading,
    prepareProFormaData,
    prepareInvoiceData,
    extractClientData,
    extractAttorneyData,
    generateNarrative,
    refreshUnbilledAmount: loadUnbilledAmount
  };
};
