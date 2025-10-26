import React from 'react';
import { FileText, LinkIcon } from 'lucide-react';

interface DocumentsTabProps {
  matterId: string;
}

/**
 * DocumentsTab - DEPRECATED
 * 
 * This component has been removed as part of the privacy-first initiative.
 * Document uploads are no longer supported.
 * 
 * Use the document reference system in src/components/documents/DocumentsTab.tsx instead,
 * which links to files in the user's cloud storage without uploading them.
 */
export const DocumentsTab: React.FC<DocumentsTabProps> = ({ matterId }) => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full mb-4">
            <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
            Document Upload Feature Removed
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-2xl mx-auto">
            For your privacy and security, this application no longer supports uploading documents to our servers.
          </p>
          <div className="bg-white dark:bg-metallic-gray-800 rounded-lg p-4 text-left max-w-2xl mx-auto mb-6">
            <div className="flex items-start gap-3 mb-3">
              <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-neutral-100 mb-1">
                  Use Document References Instead
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Link to documents stored in your own cloud storage (Google Drive, OneDrive, Dropbox). 
                  Your files stay secure in your control, and we only store references to help you organize them.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            This change ensures your sensitive legal documents remain under your complete control.
          </p>
        </div>
      </div>
    </div>
  );
};
