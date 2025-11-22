/**
 * Animation Performance Utilities
 * 
 * Utilities for optimizing animation performance.
 * Implements requirements: 6.4
 */

/**
 * Add will-change property before animation starts
 * Remove it after animation completes to free resources
 * 
 * @param element - HTML element to optimize
 * @param properties - CSS properties to optimize (e.g., 'transform', 'opacity')
 * @param duration - Animation duration in milliseconds
 */
export const optimizeAnimation = (
  element: HTMLElement,
  properties: string[],
  duration: number = 300
): void => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return; // Don't optimize if animations are disabled
  }

  // Add will-change before animation
  element.style.willChange = properties.join(', ');

  // Remove will-change after animation completes
  setTimeout(() => {
    element.style.willChange = 'auto';
  }, duration + 50); // Add small buffer
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preferences
 * Returns 0 if user prefers reduced motion
 * 
 * @param duration - Default animation duration in milliseconds
 */
export const getAnimationDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0 : duration;
};

/**
 * Apply GPU acceleration to element
 * Uses transform: translateZ(0) to force GPU rendering
 * 
 * @param element - HTML element to accelerate
 */
export const applyGPUAcceleration = (element: HTMLElement): void => {
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
};

/**
 * Remove GPU acceleration from element
 * 
 * @param element - HTML element to remove acceleration from
 */
export const removeGPUAcceleration = (element: HTMLElement): void => {
  element.style.transform = '';
  element.style.backfaceVisibility = '';
  element.style.perspective = '';
};

/**
 * Measure animation performance (FPS)
 * Useful for testing if animations meet 60fps target
 * 
 * @param callback - Function to execute during measurement
 * @param duration - Duration to measure in milliseconds
 */
export const measureAnimationPerformance = (
  callback: () => void,
  duration: number = 1000
): Promise<{ fps: number; frameCount: number }> => {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();

    const measureFrame = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;

      if (elapsed < duration) {
        frameCount++;
        callback();
        requestAnimationFrame(measureFrame);
      } else {
        const fps = Math.round((frameCount / elapsed) * 1000);
        resolve({ fps, frameCount });
      }
    };

    requestAnimationFrame(measureFrame);
  });
};

/**
 * Throttle animation frame updates
 * Useful for scroll or resize event handlers
 * 
 * @param callback - Function to throttle
 */
export const throttleAnimationFrame = (callback: () => void): (() => void) => {
  let ticking = false;

  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

/**
 * Debounce animation frame updates
 * Useful for expensive operations that should only run after animation settles
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 */
export const debounceAnimationFrame = (
  callback: () => void,
  delay: number = 100
): (() => void) => {
  let timeoutId: number | null = null;

  return () => {
    if (timeoutId !== null) {
      cancelAnimationFrame(timeoutId);
    }

    timeoutId = requestAnimationFrame(() => {
      setTimeout(callback, delay);
    });
  };
};

/**
 * Check if element is visible in viewport
 * Useful for lazy-loading animations
 * 
 * @param element - HTML element to check
 */
export const isElementVisible = (
  element: HTMLElement
): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

  return vertInView && horInView;
};

/**
 * Batch DOM reads and writes for better performance
 * Separates read and write operations to avoid layout thrashing
 * 
 * @param reads - Array of read operations
 * @param writes - Array of write operations
 */
export const batchDOMOperations = (
  reads: Array<() => void>,
  writes: Array<() => void>
): void => {
  requestAnimationFrame(() => {
    // Perform all reads first
    reads.forEach(read => read());

    // Then perform all writes
    requestAnimationFrame(() => {
      writes.forEach(write => write());
    });
  });
};

/**
 * Create a performance-optimized animation class manager
 * Automatically handles will-change and cleanup
 */
export class AnimationManager {
  private element: HTMLElement;
  private properties: string[];
  private duration: number;

  constructor(element: HTMLElement, properties: string[] = ['transform', 'opacity'], duration: number = 300) {
    this.element = element;
    this.properties = properties;
    this.duration = duration;
  }

  start(): void {
    if (!prefersReducedMotion()) {
      this.element.style.willChange = this.properties.join(', ');
    }
  }

  end(): void {
    setTimeout(() => {
      this.element.style.willChange = 'auto';
    }, this.duration + 50);
  }

  animate(callback: () => void): void {
    this.start();
    callback();
    this.end();
  }
}
