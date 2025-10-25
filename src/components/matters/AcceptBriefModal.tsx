/**
 * AcceptBriefModal Component
 * Modal for accepting a matter request immediately without pro forma (Path B)
 * Skips estimate stage for simple brief work
 */
import React from 'react';
import { Button } from '../design-system/components';
import { X, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import type { Matter } from '../../types';

interface AcceptBriefModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onConfirm: (matterId: string) => void;
  onClose: () => void;
}

export const AcceptBriefModal: React.FC<AcceptBriefModalProps> = ({
  isOpen,
  matter,
  onConfirm,
  onClose
}) => {
  if (!isOpen || !matter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 flex items-center justify-center">
                <Zap className="w-7 h-7 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Accept Brief (Quick Start)
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Skip pro forma • Start immediately
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Matter Details */}
          <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {matter.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              From: {matter.instructing_firm} • {matter.instructing_attorney}
            </p>
          </div>

          {/* Explanation */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 rounded-lg border border-mpondo-gold-200 dark:border-mpondo-gold-800">
              <CheckCircle className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-mpondo-gold-900 dark:text-mpondo-gold-100 mb-1">
                  What happens next:
                </p>
                <ul className="text-sm text-mpondo-gold-800 dark:text-mpondo-gold-200 space-y-1">
                  <li>• Matter status → <strong>Active</strong> (immediately)</li>
                  <li>• No pro forma required</li>
                  <li>• You can start work right away</li>
                  <li>• Use "Simple Fee Entry" when done</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 rounded-lg border border-judicial-blue-200 dark:border-judicial-blue-800">
              <AlertCircle className="w-5 h-5 text-judicial-blue-600 dark:text-judicial-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-judicial-blue-900 dark:text-judicial-blue-100 mb-1">
                  Best for:
                </p>
                <ul className="text-sm text-judicial-blue-800 dark:text-judicial-blue-200 space-y-1">
                  <li>• Court appearances</li>
                  <li>• Consultations</li>
                  <li>• Legal opinions</li>
                  <li>• Fixed-fee brief work</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(matter.id)}
              className="flex-1 bg-mpondo-gold-600 hover:bg-mpondo-gold-700"
            >
              Accept Brief & Start
            </Button>
          </div>

          {/* Alternative Option */}
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
              Need detailed tracking? Use <strong>"Send Pro Forma"</strong> instead
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
