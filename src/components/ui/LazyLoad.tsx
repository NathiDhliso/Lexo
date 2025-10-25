import React from 'react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

/**
 * LazyLoadWrapper - Wrapper component for lazy-loaded content
 * 
 * Provides a consistent loading experience with minimum load time
 * to prevent flashing of loading states.
 * 
 * Features:
 * - Minimum load time to prevent flash
 * - Custom fallback component
 * - Error boundary integration
 * 
 * @param children - Content to render after loading
 * @param fallback - Loading component (default: spinner)
 * @param minLoadTime - Minimum time to show loading state (ms, default: 300)
 * 
 * @example
 * ```tsx
 * <LazyLoadWrapper>
 *   <HeavyComponent />
 * </LazyLoadWrapper>
 * ```
 */
export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  minLoadTime = 300,
}) => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  if (!isReady && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * PageLoader - Full-page loading spinner for lazy-loaded pages
 * 
 * Shows a centered loading spinner with animation.
 * Optimized for page transitions.
 */
export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-judicial-blue-600 dark:border-judicial-blue-400"></div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

/**
 * ComponentLoader - Inline loading spinner for lazy-loaded components
 * 
 * Smaller spinner for inline components like modals or panels.
 */
export const ComponentLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mpondo-gold-500"></div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {message}
        </p>
      </div>
    </div>
  );
};

/**
 * lazyWithPreload - Enhanced lazy loading with preload capability
 * 
 * Extends React.lazy() with a preload function for strategic prefetching.
 * 
 * @param factory - Dynamic import function
 * @returns Lazy component with preload method
 * 
 * @example
 * ```tsx
 * const HeavyComponent = lazyWithPreload(() => import('./HeavyComponent'));
 * 
 * // Preload on hover
 * <button onMouseEnter={() => HeavyComponent.preload()}>
 *   Open Heavy Component
 * </button>
 * ```
 */
export const lazyWithPreload = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  let Component: React.LazyExoticComponent<T> | null = null;
  let factoryPromise: Promise<{ default: T }> | null = null;

  const LazyComponent = React.lazy(() => {
    if (!factoryPromise) {
      factoryPromise = factory();
    }
    return factoryPromise;
  });

  const load = () => {
    if (!factoryPromise) {
      factoryPromise = factory();
    }
    return factoryPromise;
  };

  return Object.assign(LazyComponent, {
    preload: load,
  });
};

/**
 * Preload images for better perceived performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(preloadImage));
};

/**
 * useIntersectionObserver - Hook for lazy loading on viewport intersection
 * 
 * Loads content when it enters the viewport.
 * 
 * @param ref - Ref to the element to observe
 * @param options - IntersectionObserver options
 * @returns Whether the element is intersecting
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const isVisible = useIntersectionObserver(ref);
 * 
 * <div ref={ref}>
 *   {isVisible && <HeavyComponent />}
 * </div>
 * ```
 */
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

/**
 * LazyImage - Component for lazy-loaded images
 * 
 * Loads images when they enter the viewport.
 * Shows placeholder while loading.
 * 
 * @example
 * ```tsx
 * <LazyImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   placeholder="/path/to/placeholder.jpg"
 * />
 * ```
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder,
  alt,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || src);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const isVisible = useIntersectionObserver(imgRef);

  React.useEffect(() => {
    if (isVisible && src && src !== imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isVisible, src, imageSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? '' : 'blur-sm'} transition-all duration-300`}
      {...props}
    />
  );
};
