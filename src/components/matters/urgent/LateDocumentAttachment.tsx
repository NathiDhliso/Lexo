/**
 * LateDocumentAttachment Component
 * Allows attaching documents to existing urgent matters
 * Maintains original creation timestamp
 * Requirements: 7.5
 */

import React, { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { toastService } from '../../../services/toast.service';
import { supabase } from '../../../lib/supabase';
import type { Matter } from '../../../types';

interface LateDocumentAttachmentProps {
  isOpen: boolean;
  matter: Matter;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LateDocumentAttachment: React.FC<LateDocumentAttachmentProps> = ({
  isOpen,
  matter,
  onClose,
  onSuccess
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toastService.error('Please select at least one file');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      // Upload each file to Supabase Storage
      for (const file of selectedFiles) {
        const fileName = `${matter.id}/${Date.now()}_${file.name}`;
        const filePath = `matter-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);

        // Create document record
        await supabase
          .from('documents')
          .insert({
            matter_id: matter.id,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            file_type: file.type,
            document_type: 'brief',
            notes: additionalNotes || `Late attachment to urgent matter (original creation: ${matter.created_at})`
          });
      }

      // Update matter with formal brief details note
      if (additionalNotes) {
        const currentDescription = matter.description || '';
        const updatedDescription = `${currentDescription}\n\n[LATE ATTACHMENT - ${new Date().toLocaleString()}]\n${additionalNotes}`;

        await supabase
          .from('matters')
          .update({
            description: updatedDescription
          })
          .eq('id', matter.id);
      }

      toastService.success(`${selectedFiles.length} document(s) attached successfully`);
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      toastService.error(error.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setAdditionalNotes('');
    onClose();
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Attach Documents to Urgent Matter"
      size="md"
    >
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-3 bg-judicial-blue-50 dark:bg-judicial-blue-900/20 border border-judicial-blue-200 dark:border-judicial-blue-800 rounded-lg">
          <p className="text-sm text-judicial-blue-900 dark:text-judicial-blue-100">
            <strong>Matter:</strong> {matter.title}
          </p>
          <p className="text-xs text-judicial-blue-700 dark:text-judicial-blue-300 mt-1">
            Original creation: {new Date(matter.created_at).toLocaleString()}
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Select Documents
          </label>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-900 dark:text-neutral-100 
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-judicial-blue-50 file:text-judicial-blue-700
                       hover:file:bg-judicial-blue-100
                       dark:file:bg-judicial-blue-900/30 dark:file:text-judicial-blue-300
                       cursor-pointer"
            />
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="border border-neutral-200 dark:border-metallic-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Selected Files ({selectedFiles.length})
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Total: {totalSizeMB} MB
              </p>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 text-neutral-400 hover:text-status-error-500 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="e.g., Formal brief received via email..."
            className="w-full h-24 px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-lg bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-judicial-blue-500"
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            This will be appended to the matter description with a timestamp
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-metallic-gray-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>

          <div className="flex-1" />

          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            icon={<Upload className="w-4 h-4" />}
            iconPosition="left"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LateDocumentAttachment;
