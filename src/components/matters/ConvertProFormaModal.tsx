import React, { useState, useEffect } from 'react';
import { matterConversionService } from '../../services/api/matter-conversion.service';
import { NewMatterMultiStep } from './NewMatterMultiStep';
import type { NewMatterForm } from '../../types';

interface ConvertProFormaModalProps {
  proformaId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (matterId: string) => void;
}

export const ConvertProFormaModal: React.FC<ConvertProFormaModalProps> = ({
  proformaId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [prepopulatedData, setPrepopulatedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPrepopulatedData();
    }
  }, [isOpen, proformaId]);

  const loadPrepopulatedData = async () => {
    setLoading(true);
    try {
      const data = await matterConversionService.prepopulateMatterForm(proformaId);
      setPrepopulatedData(data);
    } catch (error) {
      console.error('Failed to load pro forma data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatterCreated = async (matterData: NewMatterForm) => {
    setLoading(true);
    try {
      const matterId = await matterConversionService.convertProFormaToMatter(
        proformaId,
        matterData
      );
      onSuccess(matterId);
    } catch (error) {
      console.error('Failed to convert pro forma:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading || !prepopulatedData) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-neutral-900 dark:text-neutral-100">Loading pro forma data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NewMatterMultiStep
      isOpen={true}
      onClose={onClose}
      initialData={prepopulatedData}
      onComplete={handleMatterCreated}
      sourceProFormaId={proformaId}
      isPrepopulated={true}
    />
  );
};
