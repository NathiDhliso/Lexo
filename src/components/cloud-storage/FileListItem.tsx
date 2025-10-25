/**
 * FileListItem Component
 * Display individual file or folder item in document browser
 * Shows icon, name, size, and link button
 */
import React from 'react';
import { Folder, FileText, File, Image, FileSpreadsheet, FileCode, Link2, Check } from 'lucide-react';
import { Button } from '../design-system/components';
import { formatDistanceToNow } from 'date-fns';
import type { CloudFile } from './DocumentBrowser';

interface FileListItemProps {
  file: CloudFile;
  isSelected: boolean;
  onSelect: () => void;
  onNavigate?: () => void;
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return File;
  
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('typescript')) return FileCode;
  
  return FileText;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const FileListItem: React.FC<FileListItemProps> = ({
  file,
  isSelected,
  onSelect,
  onNavigate
}) => {
  const Icon = file.type === 'folder' ? Folder : getFileIcon(file.mimeType);
  const isFolder = file.type === 'folder';
  
  const handleClick = () => {
    if (isFolder && onNavigate) {
      onNavigate();
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 transition-colors ${
        isFolder
          ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-metallic-gray-800'
          : isSelected
          ? 'bg-judicial-blue-50 dark:bg-judicial-blue-950/20'
          : ''
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${
        isFolder 
          ? 'text-amber-500' 
          : 'text-judicial-blue-500 dark:text-judicial-blue-400'
      }`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {file.name}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          {file.size !== undefined && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatFileSize(file.size)}
            </span>
          )}
          {file.modifiedDate && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Modified {formatDistanceToNow(file.modifiedDate, { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isFolder && (
        <div className="flex-shrink-0">
          {isSelected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect();
              }}
              className="text-status-success-600 hover:text-status-success-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Linked
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Link2 className="w-4 h-4 mr-1" />
              Link
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
