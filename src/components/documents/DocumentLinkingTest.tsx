import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LinkDocumentModal } from './LinkDocumentModal';
import { DocumentsTab } from './DocumentsTab';

interface DocumentLinkingTestProps {
  matterId?: string;
}

export const DocumentLinkingTest: React.FC<DocumentLinkingTestProps> = ({ 
  matterId = 'test-matter-123' 
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDocumentsTab, setShowDocumentsTab] = useState(false);

  const handleDocumentLinked = () => {
    console.log('Document linked successfully');
    setShowLinkModal(false);
    setShowDocumentsTab(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Document Linking Test
        </h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🧪 Testing the New Document Linking System
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This component tests the privacy-first document linking approach. 
            Your files stay in your storage - we only create references.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setShowLinkModal(true)}>
              Test Link Document Modal
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowDocumentsTab(!showDocumentsTab)}
            >
              {showDocumentsTab ? 'Hide' : 'Show'} Documents Tab
            </Button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Test Matter ID:</strong> {matterId}</p>
            <p><strong>What to test:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Click "Test Link Document Modal" to open the linking interface</li>
              <li>Try connecting to different storage providers (mock data)</li>
              <li>Browse files and select one to link</li>
              <li>View linked documents in the Documents Tab</li>
              <li>Test opening, verifying, and removing document links</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents Tab */}
      {showDocumentsTab && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <DocumentsTab matterId={matterId} />
        </div>
      )}

      {/* Link Document Modal */}
      <LinkDocumentModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        matterId={matterId}
        onDocumentLinked={handleDocumentLinked}
      />
    </div>
  );
};