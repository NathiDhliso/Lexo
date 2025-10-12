/**
 * usePreview Hook
 * 
 * Manages PDF preview state including zoom and generation
 */

import { useState, useCallback } from 'react';
import { PDFTemplate } from '../types';

export const usePreview = () => {
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const setCustomZoom = useCallback((value: number) => {
    setZoom(Math.max(50, Math.min(200, value)));
  }, []);

  const generatePDF = useCallback(
    async (template: PDFTemplate, sampleData?: any): Promise<Blob | null> => {
      setIsGenerating(true);
      setError(null);

      try {
        // PDF generation logic would go here
        // For now, just simulate generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return a mock blob
        return new Blob(['PDF content'], { type: 'application/pdf' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const downloadPDF = useCallback(
    async (template: PDFTemplate, filename: string = 'template-preview.pdf', sampleData?: any) => {
      try {
        const blob = await generatePDF(template, sampleData);
        if (!blob) return;

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        // Error already handled in generatePDF
        throw err;
      }
    },
    [generatePDF]
  );

  return {
    zoom,
    isGenerating,
    error,
    zoomIn,
    zoomOut,
    resetZoom,
    setCustomZoom,
    generatePDF,
    downloadPDF,
  };
};
