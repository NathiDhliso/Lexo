/**
 * Mobile Performance Optimization Utilities
 * Ensures smooth animations and fast loading for mobile navigation
 */

// Debounce utility for touch events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Check if device supports touch
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  return window.innerWidth < 768;
};

// Check if device prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize animations for mobile
export const optimizeAnimation = (element: HTMLElement, animation: string): void => {
  if (prefersReducedMotion()) {
    element.style.animation = 'none';
    element.style.transition = 'none';
    return;
  }

  // Use transform3d to trigger hardware acceleration
  element.style.transform = 'translate3d(0, 0, 0)';
  element.style.willChange = 'transform, opacity';
  element.style.animation = animation;
};

// Clean up animation optimizations
export const cleanupAnimation = (element: HTMLElement): void => {
  element.style.willChange = 'auto';
  element.style.transform = '';
};

// Preload critical resources
export const preloadCriticalResources = (): void => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontLink);

  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/src/styles/mobile-optimizations.css';
  document.head.appendChild(criticalCSS);
};

// Lazy load non-critical components
export const lazyLoadComponent = async (componentLoader: () => Promise<any>): Promise<any> => {
  if ('requestIdleCallback' in window) {
    return new Promise((resolve) => {
      requestIdleCallback(async () => {
        const component = await componentLoader();
        resolve(component);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    return new Promise((resolve) => {
      setTimeout(async () => {
        const component = await componentLoader();
        resolve(component);
      }, 0);
    });
  }
};

// Optimize touch events
export const optimizeTouchEvents = (element: HTMLElement): void => {
  // Prevent default touch behaviors that can cause lag
  element.style.touchAction = 'manipulation';
  element.style.webkitTapHighlightColor = 'transparent';
  
  // Add passive event listeners for better performance
  element.addEventListener('touchstart', () => {}, { passive: true });
  element.addEventListener('touchmove', () => {}, { passive: true });
};

// Memory management for mobile
export const cleanupMemory = (): void => {
  // Force garbage collection if available (development only)
  if (process.env.NODE_ENV === 'development' && 'gc' in window) {
    (window as any).gc();
  }
};

// Viewport utilities
export const getViewportDimensions = () => {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
};

// Safe area utilities for notched devices
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void): void => {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

// Network-aware loading
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

// Adaptive loading based on device capabilities
export const getOptimalLoadingStrategy = () => {
  const isTouch = isTouchDevice();
  const isMobile = isMobileDevice();
  const isSlowNet = isSlowConnection();
  const reducedMotion = prefersReducedMotion();

  return {
    shouldLazyLoad: isMobile || isSlowNet,
    shouldPreload: !isSlowNet,
    shouldUseAnimations: !reducedMotion && !isSlowNet,
    shouldOptimizeTouch: isTouch,
    chunkSize: isSlowNet ? 'small' : isMobile ? 'medium' : 'large',
  };
};

// Initialize mobile optimizations
export const initializeMobileOptimizations = (): void => {
  const strategy = getOptimalLoadingStrategy();

  // Preload critical resources if network allows
  if (strategy.shouldPreload) {
    preloadCriticalResources();
  }

  // Set up viewport meta tag for mobile
  if (strategy.shouldOptimizeTouch) {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }

  // Add performance observer for monitoring
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('mobile-nav')) {
          console.log(`Mobile nav performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });
    observer.observe({ entryTypes: ['measure'] });
  }
};

// Export all utilities
export default {
  debounce,
  throttle,
  isTouchDevice,
  isMobileDevice,
  prefersReducedMotion,
  optimizeAnimation,
  cleanupAnimation,
  preloadCriticalResources,
  lazyLoadComponent,
  optimizeTouchEvents,
  cleanupMemory,
  getViewportDimensions,
  getSafeAreaInsets,
  measurePerformance,
  isSlowConnection,
  getOptimalLoadingStrategy,
  initializeMobileOptimizations,
};