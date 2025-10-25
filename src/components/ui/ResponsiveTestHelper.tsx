import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  category: 'mobile' | 'tablet' | 'desktop';
}

const devicePresets: DevicePreset[] = [
  // Mobile devices
  { name: 'Mobile S (320px)', width: 320, height: 568, icon: <Smartphone />, category: 'mobile' },
  { name: 'Mobile M (375px)', width: 375, height: 667, icon: <Smartphone />, category: 'mobile' },
  { name: 'Mobile L (425px)', width: 425, height: 812, icon: <Smartphone />, category: 'mobile' },
  
  // Tablets
  { name: 'Tablet (768px)', width: 768, height: 1024, icon: <Tablet />, category: 'tablet' },
  { name: 'Tablet L (1024px)', width: 1024, height: 768, icon: <Tablet />, category: 'tablet' },
  
  // Desktop
  { name: 'Laptop (1440px)', width: 1440, height: 900, icon: <Monitor />, category: 'desktop' },
  { name: 'Desktop (1920px)', width: 1920, height: 1080, icon: <Monitor />, category: 'desktop' },
  { name: 'Wide (2560px)', width: 2560, height: 1440, icon: <Maximize2 />, category: 'desktop' },
];

/**
 * ResponsiveTestHelper - Development tool for testing responsive layouts
 * 
 * This component helps developers test responsive breakpoints and layouts.
 * Only renders in development mode.
 * 
 * Features:
 * - Shows current viewport dimensions
 * - Displays active Tailwind breakpoint
 * - Quick device preset selection
 * - Visual breakpoint indicators
 * 
 * @example
 * ```tsx
 * // Add to your development layout
 * {process.env.NODE_ENV === 'development' && <ResponsiveTestHelper />}
 * ```
 */
export const ResponsiveTestHelper: React.FC = () => {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const getBreakpoint = () => {
    const width = viewportSize.width;
    if (width < 640) return { name: 'xs', color: 'text-rose-600', range: '< 640px' };
    if (width < 768) return { name: 'sm', color: 'text-orange-600', range: '640-767px' };
    if (width < 1024) return { name: 'md', color: 'text-amber-600', range: '768-1023px' };
    if (width < 1280) return { name: 'lg', color: 'text-lime-600', range: '1024-1279px' };
    if (width < 1536) return { name: 'xl', color: 'text-green-600', range: '1280-1535px' };
    return { name: '2xl', color: 'text-blue-600', range: '≥ 1536px' };
  };

  const breakpoint = getBreakpoint();

  const getCategory = () => {
    const width = viewportSize.width;
    if (width < 768) return { name: 'Mobile', color: 'bg-rose-500', icon: <Smartphone className="w-3 h-3" /> };
    if (width < 1024) return { name: 'Tablet', color: 'bg-amber-500', icon: <Tablet className="w-3 h-3" /> };
    return { name: 'Desktop', color: 'bg-green-500', icon: <Monitor className="w-3 h-3" /> };
  };

  const category = getCategory();

  const simulateDevice = (preset: DevicePreset) => {
    // Note: This is a visual aid only - actual window resize requires browser DevTools
    alert(
      `To simulate ${preset.name}:\n\n` +
      `1. Open Browser DevTools (F12)\n` +
      `2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)\n` +
      `3. Set dimensions to ${preset.width}x${preset.height}px\n\n` +
      `Or use the responsive design mode in your browser's DevTools.`
    );
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-xs"
      role="complementary"
      aria-label="Responsive design helper"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-metallic-gray-800 border-2 border-mpondo-gold-500 dark:border-mpondo-gold-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-expanded={!isMinimized}
        aria-controls="responsive-helper-panel"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 ${category.color} rounded text-white`}>
            {category.icon}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {viewportSize.width}x{viewportSize.height}
            </div>
            <div className={`text-xs font-bold ${breakpoint.color}`}>
              {breakpoint.name.toUpperCase()}
            </div>
          </div>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {isMinimized ? '▲' : '▼'}
        </span>
      </button>

      {/* Helper Panel */}
      {!isMinimized && (
        <div
          id="responsive-helper-panel"
          className="mt-2 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg"
        >
          {/* Current Info */}
          <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Current Viewport
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Dimensions:</span>
                <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  {viewportSize.width} × {viewportSize.height}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Breakpoint:</span>
                <span className={`text-xs font-bold ${breakpoint.color}`}>
                  {breakpoint.name} ({breakpoint.range})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Category:</span>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                  {category.name}
                </span>
              </div>
            </div>
          </div>

          {/* Device Presets */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Device Presets
            </h4>
            <div className="space-y-1">
              {devicePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => simulateDevice(preset)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    Math.abs(viewportSize.width - preset.width) < 50
                      ? 'bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-900 dark:text-mpondo-gold-300'
                      : 'hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="w-4 h-4 text-neutral-500 dark:text-neutral-400">
                    {preset.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{preset.name}</div>
                  </div>
                  <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {preset.width}px
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Breakpoint Reference */}
          <div className="p-4 border-t border-neutral-200 dark:border-metallic-gray-700 bg-neutral-50 dark:bg-metallic-gray-900/50">
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Tailwind Breakpoints
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">xs: &lt; 640px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">sm: ≥ 640px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">md: ≥ 768px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">lg: ≥ 1024px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">xl: ≥ 1280px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">2xl: ≥ 1536px</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
