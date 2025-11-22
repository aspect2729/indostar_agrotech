/**
 * ResponsiveImage Component
 * 
 * Optimized image component with responsive loading, lazy loading, and WebP support.
 * Implements requirements: 12.4
 */

import React, { useState, useEffect, useRef } from 'react';
import './ResponsiveImage.css';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage component with WebP support, lazy loading, and srcset
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check WebP support
  useEffect(() => {
    const checkWebPSupport = async () => {
      if (typeof window === 'undefined') {
        setSupportsWebP(false);
        return;
      }

      // Check if browser supports WebP
      const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
      
      try {
        const img = new Image();
        img.src = webpData;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        setSupportsWebP(true);
      } catch {
        setSupportsWebP(false);
      }
    };

    checkWebPSupport();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  // Generate srcset for different sizes
  const generateSrcSet = (imageSrc: string): string => {
    // If the image is already a full URL or data URL, return as is
    if (imageSrc.startsWith('http') || imageSrc.startsWith('data:')) {
      return imageSrc;
    }

    // Generate srcset for different widths
    const widths = [320, 640, 768, 1024, 1280, 1536];
    const srcsetArray = widths.map(width => {
      // In a real implementation, you would have different sized images
      // For now, we'll use the same image with width descriptor
      return `${imageSrc} ${width}w`;
    });

    return srcsetArray.join(', ');
  };

  // Get WebP version of image if supported
  const getImageSrc = (imageSrc: string): string => {
    if (supportsWebP && !imageSrc.endsWith('.svg') && !imageSrc.startsWith('data:')) {
      // Replace extension with .webp
      return imageSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return imageSrc;
  };

  // Get fallback image (original format)
  const getFallbackSrc = (imageSrc: string): string => {
    return imageSrc;
  };

  const containerStyle: React.CSSProperties = aspectRatio
    ? { aspectRatio }
    : {};

  const imgStyle: React.CSSProperties = {
    objectFit,
  };

  if (supportsWebP === null) {
    // Still checking WebP support, show placeholder
    return (
      <div
        className={`responsive-image responsive-image--loading ${className}`}
        style={containerStyle}
      >
        <div className="responsive-image__placeholder" />
      </div>
    );
  }

  return (
    <div
      className={`responsive-image ${isLoaded ? 'responsive-image--loaded' : ''} ${
        hasError ? 'responsive-image--error' : ''
      } ${className}`}
      style={containerStyle}
    >
      {!isLoaded && !hasError && (
        <div className="responsive-image__placeholder" />
      )}

      {hasError ? (
        <div className="responsive-image__error">
          <span className="responsive-image__error-icon">🖼️</span>
          <span className="responsive-image__error-text">Image not available</span>
        </div>
      ) : (
        <picture>
          {/* WebP source if supported */}
          {supportsWebP && !src.endsWith('.svg') && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(getImageSrc(src))}
              sizes={sizes}
            />
          )}

          {/* Fallback to original format */}
          <img
            ref={imgRef}
            src={getFallbackSrc(src)}
            srcSet={generateSrcSet(getFallbackSrc(src))}
            sizes={sizes}
            alt={alt}
            loading={loading}
            className="responsive-image__img"
            style={imgStyle}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
    </div>
  );
};

export default ResponsiveImage;
