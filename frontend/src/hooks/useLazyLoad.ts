/**
 * useLazyLoad Hook
 * 
 * Custom hook for lazy loading images using Intersection Observer API.
 * Implements requirements: 12.4
 */

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook to lazy load images when they enter the viewport
 * 
 * @param options - Intersection Observer options
 * @returns Object with ref to attach to element and isVisible state
 */
export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const { threshold = 0.1, rootMargin = '50px' } = options;
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load immediately if not supported
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { elementRef, isVisible };
};

export default useLazyLoad;
