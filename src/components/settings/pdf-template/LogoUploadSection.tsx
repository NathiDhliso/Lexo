/**
 * LogoUploadSection Component
 * 
 * Handles logo upload, positioning, and styling for PDF templates.
 */

import React, { useRef, useState } from 'react';
import { LogoConfig, LogoUploadSectionProps, LogoPosition } from './types';

export const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({
  value,
  onChange,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const url = await onUpload(file);
      onChange({
        ...value,
        url,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onChange({
      ...value,
      url: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePositionChange = (position: LogoPosition) => {
    onChange({
      ...value,
      position,
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', newValue: number) => {
    onChange({
      ...value,
      [dimension]: Math.max(20, Math.min(300, newValue)),
    });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({
      ...value,
      opacity: Math.max(0, Math.min(1, opacity)),
    });
  };

  const handleRotationChange = (rotation: number) => {
    onChange({
      ...value,
      rotation: Math.max(-180, Math.min(180, rotation)),
    });
  };

  const positions: Array<{ value: LogoPosition; label: string; icon: string }> = [
    { value: 'top-left', label: 'Top Left', icon: '↖️' },
    { value: 'top-center', label: 'Top Center', icon: '⬆️' },
    { value: 'top-right', label: 'Top Right', icon: '↗️' },
    { value: 'watermark', label: 'Watermark', icon: '💧' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Logo Settings
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Upload and customize your logo for PDF documents
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Logo Image
        </label>

        {!value.url ? (
          /* Upload Area */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center cursor-pointer hover:border-mpondo-gold-500 dark:hover:border-mpondo-gold-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-2">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-mpondo-gold-600 dark:text-mpondo-gold-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Logo Preview */
          <div className="relative border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">
            <div className="flex items-start gap-4">
              {/* Logo Image */}
              <div
                className="flex-shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded p-2"
                style={{
                  width: `${value.width}px`,
                  height: `${value.height}px`,
                }}
              >
                <img
                  src={value.url}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                  style={{
                    opacity: value.opacity,
                    transform: `rotate(${value.rotation}deg)`,
                  }}
                />
              </div>

              {/* Logo Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  Logo Uploaded
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  {value.width}px × {value.height}px
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-50 dark:hover:bg-neutral-600"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-neutral-700 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</div>
        )}
      </div>

      {/* Logo Position */}
      {value.url && (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Logo Position
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {positions.map(pos => (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => handlePositionChange(pos.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-center
                    ${
                      value.position === pos.value
                        ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{pos.icon}</div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {pos.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Width: {value.width}px
              </label>
              <input
                type="range"
                min="20"
                max="300"
                value={value.width}
                onChange={e => handleSizeChange('width', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Height: {value.height}px
              </label>
              <input
                type="range"
                min="20"
                max="300"
                value={value.height}
                onChange={e => handleSizeChange('height', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
              />
            </div>
          </div>

          {/* Logo Opacity */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Opacity: {Math.round(value.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={value.opacity}
              onChange={e => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>

          {/* Logo Rotation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Rotation: {value.rotation}°
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={value.rotation}
              onChange={e => handleRotationChange(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
            />
          </div>
        </>
      )}
    </div>
  );
};
