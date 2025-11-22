/**
 * Image Optimization Utilities
 * 
 * Utilities for optimizing image loading and display.
 * Implements requirements: 12.4
 */

/**
 * Generate srcset string for responsive images
 * 
 * @param baseSrc - Base image source URL
 * @param widths - Array of widths to generate
 * @returns srcset string
 */
export const generateSrcSet = (baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1280, 1536]): string => {
  if (baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return baseSrc;
  }

  // Generate srcset entries
  const srcsetArray = widths.map(width => {
    // In production, you would have actual resized images
    // For now, we'll use the original with width descriptor
    return `${baseSrc} ${width}w`;
  });

  return srcsetArray.join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * 
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes string
 */
export const generateSizes = (breakpoints: Record<string, string> = {}): string => {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '50vw',
    '(max-width: 1024px)': '33vw',
    ...breakpoints,
  };

  const sizesArray = Object.entries(defaultBreakpoints).map(([query, size]) => {
    return `${query} ${size}`;
  });

  // Add default size
  sizesArray.push('25vw');

  return sizesArray.join(', ');
};

/**
 * Check if browser supports WebP format
 * 
 * @returns Promise that resolves to boolean
 */
export const supportsWebP = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if already cached
  const cached = sessionStorage.getItem('webp-support');
  if (cached !== null) {
    return cached === 'true';
  }

  // Test WebP support
  const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  
  try {
    const img = new Image();
    img.src = webpData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    sessionStorage.setItem('webp-support', 'true');
    return true;
  } catch {
    sessionStorage.setItem('webp-support', 'false');
    return false;
  }
};

/**
 * Convert image URL to WebP if supported
 * 
 * @param src - Original image source
 * @param webpSupported - Whether WebP is supported
 * @returns WebP URL or original URL
 */
export const getWebPUrl = (src: string, webpSupported: boolean): string => {
  if (!webpSupported || src.endsWith('.svg') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Replace extension with .webp
  return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Preload critical images
 * 
 * @param urls - Array of image URLs to preload
 */
export const preloadImages = (urls: string[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Get optimal image size based on viewport width
 * 
 * @param viewportWidth - Current viewport width
 * @returns Optimal image width
 */
export const getOptimalImageSize = (viewportWidth: number): number => {
  if (viewportWidth <= 640) return 640;
  if (viewportWidth <= 768) return 768;
  if (viewportWidth <= 1024) return 1024;
  if (viewportWidth <= 1280) return 1280;
  return 1536;
};

/**
 * Calculate aspect ratio from dimensions
 * 
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio string (e.g., "16/9")
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Lazy load image using Intersection Observer
 * 
 * @param img - Image element
 * @param src - Image source URL
 * @param options - Intersection Observer options
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  options: IntersectionObserverInit = {}
): void => {
  if (!('IntersectionObserver' in window)) {
    // Fallback: load immediately
    img.src = src;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  });

  observer.observe(img);
};

/**
 * Get image dimensions from URL
 * 
 * @param url - Image URL
 * @returns Promise with width and height
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Check if image is in viewport
 * 
 * @param element - Image element
 * @param offset - Offset in pixels
 * @returns Boolean indicating if image is in viewport
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

export default {
  generateSrcSet,
  generateSizes,
  supportsWebP,
  getWebPUrl,
  preloadImages,
  getOptimalImageSize,
  calculateAspectRatio,
  lazyLoadImage,
  getImageDimensions,
  isInViewport,
};
