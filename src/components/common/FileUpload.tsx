import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  onProcessingComplete?: (extractedData: any) => void;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  currentFile?: File | null;
  isProcessing?: boolean;
  processingProgress?: number;
  error?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  onProcessingComplete,
  acceptedTypes = ['.pdf', '.doc', '.docx'],
  maxSizeInMB = 10,
  disabled = false,
  className = '',
  label = 'Upload Document',
  description = 'Upload a PDF or Word document for automatic processing',
  currentFile = null,
  isProcessing = false,
  processingProgress = 0,
  error = null,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB`;
    }

    return null;
  }, [acceptedTypes, maxSizeInMB]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      // You might want to show this error in the parent component
      console.error('File validation error:', validationError);
      return;
    }

    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  }, [onFileRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <File className="w-8 h-8 text-blue-600" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label and Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Upload Area */}
      {!currentFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          }`} />

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? 'Drop your file here' : 'Upload your document'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSizeInMB}MB
            </p>
          </div>
        </div>
      ) : (
        /* File Preview */
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getFileIcon(currentFile.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(currentFile.size)}
                </p>
                
                {/* Processing Status */}
                {isProcessing && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing document...</span>
                    </div>
                    {processingProgress > 0 && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {processingProgress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isProcessing && (
              <button
                onClick={handleRemoveFile}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {currentFile && !isProcessing && !error && (
        <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Document uploaded successfully. Ready for processing.</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;