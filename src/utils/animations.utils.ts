/**
 * Animation Utilities
 * 
 * Reusable animation configurations and utilities for the application.
 * Respects user's prefers-reduced-motion preference for accessibility.
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preference
 * Returns 0ms if user prefers reduced motion
 */
export const getAnimationDuration = (defaultMs: number): number => {
  return prefersReducedMotion() ? 0 : defaultMs;
};

/**
 * Animation presets for consistent timing across the app
 */
export const animations = {
  // Durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // Easings
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Page transitions
  pageTransition: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    },
  },

  // Modal animations
  modal: {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    content: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
      transition: { duration: 0.3 },
    },
  },

  // Dropdown animations
  dropdown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.15 },
  },

  // Toast animations
  toast: {
    slideIn: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
      transition: { duration: 0.2 },
    },
  },

  // Skeleton shimmer
  shimmer: {
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  },

  // Button hover effects
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  
  // Card hover effects
  cardHover: {
    y: -4,
    transition: { duration: 0.2 },
  },
};

/**
 * CSS class strings for common animations
 * Use these with Tailwind's transition utilities
 */
export const animationClasses = {
  // Transitions
  transition: {
    base: 'transition-all duration-300 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
  },

  // Transforms
  hover: {
    lift: 'hover:-translate-y-1 hover:shadow-lg',
    scale: 'hover:scale-105',
    scaleDown: 'active:scale-95',
  },

  // Fade animations
  fade: {
    in: 'animate-in fade-in-0',
    out: 'animate-out fade-out-0',
  },

  // Slide animations
  slide: {
    up: 'animate-in slide-in-from-bottom-4',
    down: 'animate-in slide-in-from-top-4',
    left: 'animate-in slide-in-from-right-4',
    right: 'animate-in slide-in-from-left-4',
  },

  // Zoom animations
  zoom: {
    in: 'animate-in zoom-in-95',
    out: 'animate-out zoom-out-95',
  },

  // Spin
  spin: 'animate-spin',
  
  // Pulse
  pulse: 'animate-pulse',

  // Bounce
  bounce: 'animate-bounce',
};

/**
 * Stagger animation delays for lists
 * Returns delay in milliseconds for nth item
 */
export const getStaggerDelay = (index: number, baseDelay = 50): number => {
  return prefersReducedMotion() ? 0 : index * baseDelay;
};

/**
 * Create CSS keyframes for custom animations
 */
export const keyframes = {
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,

  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
};

/**
 * Hook for using animations with reduced motion support
 */
export const useAnimation = (enabled = true) => {
  const shouldAnimate = enabled && !prefersReducedMotion();

  return {
    shouldAnimate,
    getDuration: (ms: number) => (shouldAnimate ? ms : 0),
    getTransition: (transition: string) => (shouldAnimate ? transition : 'none'),
  };
};
