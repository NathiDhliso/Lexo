/**
 * DocumentBrowser Component
 * Browse and select documents from cloud storage
 * Features file/folder list view, breadcrumb navigation, search and filter
 */
import React, { useState, useEffect } from 'react';
import { Folder, Search, ChevronRight, Home, Loader } from 'lucide-react';
import { Input, Button } from '../design-system/components';
import { FileListItem } from './FileListItem';
import { CloudStorageService } from '../../services/api/cloud-storage.service';
import type { CloudStorageProvider } from '../../types/cloud-storage.types';

export interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedDate?: Date;
  path: string;
  mimeType?: string;
}

interface DocumentBrowserProps {
  provider: CloudStorageProvider;
  connectionId: string;
  onSelectFile: (file: CloudFile) => void;
  selectedFiles?: CloudFile[];
  multiSelect?: boolean;
}

export const DocumentBrowser: React.FC<DocumentBrowserProps> = ({
  provider, // TODO: Use for provider-specific API calls
  connectionId,
  onSelectFile,
  selectedFiles = [],
  multiSelect = true // TODO: Implement multi-select functionality
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['Root']);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, connectionId]);

  const loadFiles = async () => {
    setLoading(true);
    setError('');

    try {
      const folderPath = currentPath.length === 1 ? '' : currentPath.slice(1).join('/');
      const filesData = await CloudStorageService.listFiles(connectionId, folderPath);
      
      setFiles(filesData);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (folderName: string) => {
    setCurrentPath(prev => [...prev, folderName]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => prev.slice(0, -1));
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFileSelected = (fileId: string) => {
    return selectedFiles.some(f => f.id === fileId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentPath.length === 1}
        >
          <Home className="w-4 h-4" />
        </Button>
        
        <nav className="flex items-center gap-2 flex-1 overflow-x-auto">
          {currentPath.map((segment, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`text-sm whitespace-nowrap ${
                  index === currentPath.length - 1
                    ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {segment}
              </button>
              {index < currentPath.length - 1 && (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search files and folders..."
            className="pl-10"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader className="w-8 h-8 text-judicial-blue-500 animate-spin mb-2" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading files...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <p className="text-status-error-600 dark:text-status-error-400 mb-4">{error}</p>
            <Button variant="secondary" onClick={loadFiles}>
              Retry
            </Button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 text-neutral-400 mb-2" />
                <p className="text-neutral-600 dark:text-neutral-400">No files match your search</p>
              </>
            ) : (
              <>
                <Folder className="w-12 h-12 text-neutral-400 mb-2" />
                <p className="text-neutral-600 dark:text-neutral-400">This folder is empty</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-metallic-gray-700">
            {filteredFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                isSelected={isFileSelected(file.id)}
                onSelect={() => onSelectFile(file)}
                onNavigate={file.type === 'folder' ? () => handleNavigate(file.name) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer with selection count */}
      {selectedFiles.length > 0 && (
        <div className="p-4 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};
