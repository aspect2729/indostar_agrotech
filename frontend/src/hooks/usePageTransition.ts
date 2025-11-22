/**
 * Page Transition Hook
 * 
 * Provides page transition animations for route changes.
 * Implements requirements: 6.1, 6.3
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransition = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('exit');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 200); // Exit animation duration

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [transitionStage, location]);

  return { displayLocation, transitionStage };
};

/**
 * Get page transition class names
 */
export const getPageTransitionClass = (stage: 'enter' | 'exit'): string => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return '';
  }

  return stage === 'enter' 
    ? 'page-transition-enter page-transition-enter-active' 
    : 'page-transition-exit page-transition-exit-active';
};
