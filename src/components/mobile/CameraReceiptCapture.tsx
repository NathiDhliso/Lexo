import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraReceiptCaptureProps {
  onImageCapture: (file: File) => void;
  onCancel?: () => void;
}

export const CameraReceiptCapture: React.FC<CameraReceiptCaptureProps> = ({
  onImageCapture,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width)
        const maxWidth = 1200;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    
    try {
      const compressedFile = await compressImage(file);
      onImageCapture(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Capture Receipt</h3>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleCameraCapture}
            disabled={isCapturing}
            className="w-full h-12"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isCapturing ? 'Processing...' : 'Take Photo'}
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isCapturing}
            className="w-full h-12"
          >
            <Upload className="w-5 h-5 mr-2" />
            Choose from Gallery
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          Images will be compressed automatically
        </p>
      </div>
    </div>
  );
};