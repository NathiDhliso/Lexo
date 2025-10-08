import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
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
  const [step, setStep] = useState<'upload' | 'form'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [prepopulatedData, setPrepopulatedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPrepopulatedData();
    }
  }, [isOpen, proformaId]);

  const loadPrepopulatedData = async () => {
    const data = await matterConversionService.prepopulateMatterForm(proformaId);
    setPrepopulatedData(data);
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setLoading(true);

    try {
    } catch (error) {
      console.error('Document extraction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipUpload = () => {
    setStep('form');
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

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-metallic-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-metallic-gray-800 border-b border-neutral-200 dark:border-metallic-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-mpondo-gold-400" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Convert Pro Forma to Matter</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'upload' ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <Upload className="w-12 h-12 text-blue-600 dark:text-mpondo-gold-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-2">
                Upload Attorney's Brief (Optional)
              </h3>
              <p className="text-gray-600 dark:text-neutral-400">
                Upload the attorney's soft copy to automatically extract client and case details
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-metallic-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-mpondo-gold-500 transition-colors bg-gray-50 dark:bg-metallic-gray-900">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const uploadedFile = e.target.files?.[0];
                  if (uploadedFile) handleFileUpload(uploadedFile);
                }}
                className="hidden"
                id="brief-upload"
              />
              <label
                htmlFor="brief-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <FileText className="w-10 h-10 text-gray-400 dark:text-neutral-500 mb-2" />
                <span className="text-sm text-gray-600 dark:text-neutral-400">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
                  PDF, DOC, or DOCX (max 10MB)
                </span>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">{file.name}</p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleSkipUpload}
                className="px-4 py-2 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-metallic-gray-700 rounded-lg transition-colors"
              >
                Skip Upload
              </button>
              <button
                onClick={() => setStep('form')}
                disabled={!file || loading}
                className="px-4 py-2 bg-blue-600 dark:bg-mpondo-gold-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-mpondo-gold-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </div>
        ) : (
          <NewMatterMultiStep
            isOpen={true}
            onClose={onClose}
            initialData={prepopulatedData || {}}
            onComplete={handleMatterCreated}
            sourceProFormaId={proformaId}
            isPrepopulated={true}
          />
        )}
      </div>
    </div>
  );
};
