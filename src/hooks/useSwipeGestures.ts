/**
 * useSwipeGestures Hook
 * 
 * Custom hook for handling swipe gestures on mobile devices.
 * Provides swipe-to-go-back and swipe-to-refresh functionality.
 * 
 * Requirements: 11.4
 */
import React, { useEffect, useRef, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeToGoBack?: () => void;
  onSwipeToRefresh?: () => void;
  threshold?: number; // Minimum distance for swipe detection
  velocity?: number; // Minimum velocity for swipe detection
  enableGoBack?: boolean;
  enableRefresh?: boolean;
  disabled?: boolean;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * useSwipeGestures Hook
 * 
 * Features:
 * - Swipe direction detection (left, right, up, down)
 * - Swipe-to-go-back functionality (right swipe)
 * - Pull-to-refresh functionality (down swipe from top)
 * - Configurable thresholds and velocity
 * - Touch-friendly animations
 * - Prevents conflicts with scrolling
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const swipeRef = useSwipeGestures({
 *     onSwipeToGoBack: () => navigate(-1),
 *     onSwipeToRefresh: () => refetch(),
 *     enableGoBack: true,
 *     enableRefresh: true,
 *   });
 * 
 *   return <div ref={swipeRef}>Content</div>;
 * };
 * ```
 */
export const useSwipeGestures = (options: SwipeGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeToGoBack,
    onSwipeToRefresh,
    threshold = 50,
    velocity = 0.3,
    enableGoBack = false,
    enableRefresh = false,
    disabled = false,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const isSwipingRef = useRef(false);
  const refreshIndicatorRef = useRef<HTMLElement | null>(null);

  // Calculate swipe distance and velocity
  const calculateSwipe = useCallback((start: TouchPoint, end: TouchPoint) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocityValue = distance / deltaTime;
    
    return {
      deltaX,
      deltaY,
      distance,
      velocity: velocityValue,
      angle: Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI),
    };
  }, []);

  // Determine swipe direction
  const getSwipeDirection = useCallback((deltaX: number, deltaY: number, angle: number) => {
    // Horizontal swipe (angle < 45 degrees)
    if (angle < 45) {
      return deltaX > 0 ? 'right' : 'left';
    }
    // Vertical swipe (angle >= 45 degrees)
    else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    isSwipingRef.current = false;
  }, [disabled]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    
    const touch = e.touches[0];
    const currentPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    const swipe = calculateSwipe(touchStartRef.current, currentPoint);
    
    // Check if this is a potential swipe gesture
    if (swipe.distance > threshold / 2) {
      isSwipingRef.current = true;
      
      // Handle pull-to-refresh visual feedback
      if (enableRefresh && swipe.deltaY > 0 && touchStartRef.current.y < 50) {
        const pullDistance = Math.min(swipe.deltaY, 100);
        
        // Create or update refresh indicator
        if (!refreshIndicatorRef.current && elementRef.current) {
          const indicator = document.createElement('div');
          indicator.className = 'swipe-refresh-indicator';
          indicator.style.cssText = `
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.1);
            border: 2px solid rgba(212, 175, 55, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 1000;
          `;
          indicator.innerHTML = '↓';
          elementRef.current.style.position = 'relative';
          elementRef.current.appendChild(indicator);
          refreshIndicatorRef.current = indicator;
        }
        
        if (refreshIndicatorRef.current) {
          const opacity = Math.min(pullDistance / 50, 1);
          const scale = Math.min(pullDistance / 50, 1);
          refreshIndicatorRef.current.style.opacity = opacity.toString();
          refreshIndicatorRef.current.style.transform = `translateX(-50%) scale(${scale})`;
        }
      }
      
      // Handle swipe-to-go-back visual feedback
      if (enableGoBack && swipe.deltaX > 0 && swipe.deltaX > swipe.deltaY) {
        const swipeDistance = Math.min(swipe.deltaX, 100);
        
        // Add visual feedback for go-back gesture
        if (elementRef.current) {
          const translateX = Math.min(swipeDistance * 0.3, 30);
          elementRef.current.style.transform = `translateX(${translateX}px)`;
          elementRef.current.style.transition = 'none';
        }
      }
    }
  }, [disabled, threshold, calculateSwipe, enableRefresh, enableGoBack]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    const swipe = calculateSwipe(touchStartRef.current, touchEndRef.current);
    
    // Reset visual feedback
    if (elementRef.current) {
      elementRef.current.style.transform = '';
      elementRef.current.style.transition = '';
    }
    
    // Remove refresh indicator
    if (refreshIndicatorRef.current) {
      refreshIndicatorRef.current.remove();
      refreshIndicatorRef.current = null;
    }
    
    // Check if swipe meets threshold and velocity requirements
    if (swipe.distance >= threshold && swipe.velocity >= velocity) {
      const direction = getSwipeDirection(swipe.deltaX, swipe.deltaY, swipe.angle);
      
      // Trigger appropriate callbacks
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          // Special handling for swipe-to-go-back
          if (enableGoBack && swipe.deltaX > threshold) {
            onSwipeToGoBack?.();
          }
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          // Special handling for pull-to-refresh
          if (enableRefresh && touchStartRef.current.y < 50 && swipe.deltaY > threshold) {
            onSwipeToRefresh?.();
          }
          break;
      }
    }
    
    // Reset state
    touchStartRef.current = null;
    touchEndRef.current = null;
    isSwipingRef.current = false;
  }, [
    disabled,
    threshold,
    velocity,
    calculateSwipe,
    getSwipeDirection,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeToGoBack,
    onSwipeToRefresh,
    enableGoBack,
    enableRefresh,
  ]);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      // Clean up any remaining indicators
      if (refreshIndicatorRef.current) {
        refreshIndicatorRef.current.remove();
        refreshIndicatorRef.current = null;
      }
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
};

/**
 * SwipeGestureProvider Component
 * 
 * Wrapper component that provides swipe gesture functionality to its children.
 * Useful for wrapping entire pages or sections.
 */
interface SwipeGestureProviderProps extends SwipeGestureOptions {
  children: React.ReactNode;
  className?: string;
}

export const SwipeGestureProvider: React.FC<SwipeGestureProviderProps> = ({
  children,
  className,
  ...swipeOptions
}) => {
  const swipeRef = useSwipeGestures(swipeOptions);

  return React.createElement('div', { 
    ref: swipeRef as React.RefObject<HTMLDivElement>, 
    className 
  }, children);
};