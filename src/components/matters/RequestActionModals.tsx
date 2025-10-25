/**
 * Request Action Modals
 * Modals for requesting info and declining matter requests
 */
import React, { useState } from 'react';
import { Button, Textarea } from '../design-system/components';
import { X, MessageCircle, XCircle } from 'lucide-react';
import type { Matter } from '../../types';

interface RequestInfoModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onSubmit: (matterId: string, message: string) => void;
  onClose: () => void;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  isOpen,
  matter,
  onSubmit,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!matter || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(matter.id, message);
      setMessage('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !matter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-judicial-blue-100 dark:bg-judicial-blue-900/30 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Request More Information
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {matter.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                From: {matter.instructing_firm} • {matter.instructing_attorney}
              </p>
            </div>

            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Your Message *
            </label>
            <Textarea
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              placeholder="Please provide more information about..."
              rows={5}
              required
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              This message will be sent to {matter.instructing_attorney}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DeclineMatterModalProps {
  isOpen: boolean;
  matter: Matter | null;
  onConfirm: (matterId: string, reason: string) => void;
  onClose: () => void;
}

export const DeclineMatterModal: React.FC<DeclineMatterModalProps> = ({
  isOpen,
  matter,
  onConfirm,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!matter || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(matter.id, reason);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !matter) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-metallic-gray-900 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-status-error-100 dark:bg-status-error-900/30 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-status-error-600 dark:text-status-error-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Decline Matter Request
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {matter.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                From: {matter.instructing_firm} • {matter.instructing_attorney}
              </p>
            </div>

            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Reason for Declining *
            </label>
            <Textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Please explain why you are declining this matter..."
              rows={4}
              required
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              This reason will be sent to {matter.instructing_attorney}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!reason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Declining...' : 'Decline Matter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
