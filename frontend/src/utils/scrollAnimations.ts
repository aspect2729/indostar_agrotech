/**
 * Scroll Animation Utilities
 * 
 * Utilities for handling scroll-based animations and reveals.
 * Implements requirements: 7.4
 */

/**
 * Initialize scroll reveal animations
 * Observes elements with .scroll-reveal class and adds .revealed when visible
 */
export const initScrollReveal = (): (() => void) => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // If user prefers reduced motion, reveal all elements immediately
    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger');
    elements.forEach(el => el.classList.add('revealed'));
    return () => {}; // Return empty cleanup function
  }

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
    threshold: 0.1, // Trigger when 10% of element is visible
  };

  const observerCallback: IntersectionObserverCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Optionally unobserve after revealing (one-time animation)
        // observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Observe all elements with scroll-reveal classes
  const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger');
  elements.forEach(el => observer.observe(el));

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};

/**
 * Add parallax effect to elements
 * @param selector - CSS selector for elements to apply parallax
 * @param speed - Parallax speed (0.1 = slow, 1 = normal)
 */
export const initParallax = (selector: string = '.parallax', speed: number = 0.5): (() => void) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return () => {}; // Don't apply parallax if user prefers reduced motion
  }

  const elements = document.querySelectorAll<HTMLElement>(selector);
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const viewportHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const offset = (scrollY - elementTop + viewportHeight) * speed;
        el.style.transform = `translateY(${offset}px)`;
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial call

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Smooth scroll to element
 * @param elementId - ID of element to scroll to
 * @param offset - Offset from top in pixels (default: 0)
 */
export const smoothScrollTo = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
};

/**
 * Add stagger animation delays to child elements
 * @param parentSelector - CSS selector for parent element
 * @param childSelector - CSS selector for child elements
 * @param delayIncrement - Delay increment in ms (default: 100)
 */
export const addStaggerDelay = (
  parentSelector: string,
  childSelector: string,
  delayIncrement: number = 100
): void => {
  const parent = document.querySelector(parentSelector);
  
  if (!parent) {
    console.warn(`Parent element "${parentSelector}" not found`);
    return;
  }

  const children = parent.querySelectorAll<HTMLElement>(childSelector);
  
  children.forEach((child, index) => {
    child.style.animationDelay = `${index * delayIncrement}ms`;
    child.style.transitionDelay = `${index * delayIncrement}ms`;
  });
};

/**
 * Check if element is in viewport
 * @param element - HTML element to check
 * @param offset - Offset from viewport edges in pixels (default: 0)
 */
export const isInViewport = (element: HTMLElement, offset: number = 0): boolean => {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
};

/**
 * Animate element on scroll into view
 * @param element - HTML element to animate
 * @param animationClass - CSS class to add when element is in view
 * @param offset - Offset from viewport bottom in pixels (default: 100)
 */
export const animateOnScroll = (
  element: HTMLElement,
  animationClass: string,
  offset: number = 100
): (() => void) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    element.classList.add(animationClass);
    return () => {};
  }

  const handleScroll = () => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    if (rect.top < viewportHeight - offset) {
      element.classList.add(animationClass);
      // Optionally remove listener after animation
      // window.removeEventListener('scroll', handleScroll);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Initialize all scroll animations
 * Call this once when your app mounts
 */
export const initAllScrollAnimations = (): (() => void) => {
  const cleanupFunctions: Array<() => void> = [];

  // Initialize scroll reveal
  cleanupFunctions.push(initScrollReveal());

  // Initialize parallax (if any elements exist)
  if (document.querySelector('.parallax')) {
    cleanupFunctions.push(initParallax());
  }

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};
