import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../design-system/components';
import { toast } from 'react-hot-toast';
import { awsDocumentProcessingService, DocumentProcessingResult } from '../../services/aws-document-processing.service';

interface DocumentUploadWithProcessingProps {
  matterId: string;
  onComplete?: (documentId: string, extractedData: any) => void;
  onCancel?: () => void;
}

export const DocumentUploadWithProcessing: React.FC<DocumentUploadWithProcessingProps> = ({
  matterId,
  onComplete,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<DocumentProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const supportedTypes = awsDocumentProcessingService.getSupportedFileTypes();
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedTypes.includes(fileExtension)) {
        toast.error(`Please select a valid file type: ${supportedTypes.join(', ')}`);
        return;
      }
      
      const maxSize = awsDocumentProcessingService.getMaxFileSizeInMB() * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${awsDocumentProcessingService.getMaxFileSizeInMB()}MB`);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const supportedTypes = awsDocumentProcessingService.getSupportedFileTypes();
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedTypes.includes(fileExtension)) {
        toast.error(`Please select a valid file type: ${supportedTypes.join(', ')}`);
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);


  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProcessing(true);
    setError(null);
    setProcessingProgress(0);

    try {
      const result = await awsDocumentProcessingService.processDocument(
        selectedFile,
        (progress) => setProcessingProgress(progress.percentage)
      );
      
      setExtractedData(result);
      setUploading(false);
      
      if (onComplete) {
        onComplete(result.fileUrl, result.extractedData);
      }
      
      toast.success('Document processed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = (error as Error).message || 'Failed to process document';
      setError(errorMessage);
      toast.error(errorMessage);
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setProcessing(false);
    setExtractedData(null);
    setError(null);
    setProcessingProgress(0);
  };

  if (processing && extractedData) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">Processing Complete</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Confidence: {extractedData.confidence}% • Processing time: {(extractedData.processingTime / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-green-900 dark:text-green-300">
            {extractedData.extractedData.clientName && (
              <div><span className="font-medium">Client:</span> {extractedData.extractedData.clientName}</div>
            )}
            {extractedData.extractedData.clientEmail && (
              <div><span className="font-medium">Email:</span> {extractedData.extractedData.clientEmail}</div>
            )}
            {extractedData.extractedData.description && (
              <div><span className="font-medium">Description:</span> {extractedData.extractedData.description}</div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleRemoveFile}>
            Process Another Document
          </Button>
          {onCancel && (
            <Button variant="primary" onClick={onCancel}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Upload Document for Processing
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Upload a PDF document to extract data using AI-powered processing
        </p>
      </div>

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-12 text-center hover:border-mpondo-gold-500 dark:hover:border-mpondo-gold-400 transition-colors cursor-pointer"
        >
          <Upload className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Drop your document here or click to browse
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Supported: {awsDocumentProcessingService.getSupportedFileTypes().join(', ')} • Max: {awsDocumentProcessingService.getMaxFileSizeInMB()}MB
          </p>
          <input
            type="file"
            accept={awsDocumentProcessingService.getSupportedFileTypes().join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="inline-flex items-center px-4 py-2 bg-mpondo-gold-500 text-white rounded-lg hover:bg-mpondo-gold-600 transition-colors font-medium">
              Select File
            </span>
          </label>
        </div>
      ) : (
        <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-judicial-blue-100 dark:bg-judicial-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-judicial-blue-600 dark:text-judicial-blue-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{selectedFile.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={uploading}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="font-medium text-blue-900 dark:text-blue-300">Processing Document...</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">{processingProgress}% complete</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-judicial-blue-50 dark:bg-judicial-blue-950/30 rounded-lg p-4">
        <h3 className="font-semibold text-judicial-blue-900 dark:text-judicial-blue-300 mb-2">
          AWS Textract Processing
        </h3>
        <ul className="text-sm text-judicial-blue-700 dark:text-judicial-blue-400 space-y-1">
          <li>• Secure upload to AWS S3</li>
          <li>• Intelligent text extraction with AWS Textract</li>
          <li>• Automatic client and case detail extraction</li>
          <li>• Pre-populates matter forms with extracted data</li>
          <li>• Graceful fallback to mock data in development</li>
        </ul>
      </div>
    </div>
  );
};
