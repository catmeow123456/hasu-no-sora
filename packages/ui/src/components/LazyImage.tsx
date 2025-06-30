import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div<{ $isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  /* 性能优化 */
  transform: translateZ(0);
  backface-visibility: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: ${props => props.$isLoaded ? 1 : 0};
    transition: opacity 200ms ease-out;
    
    /* GPU 加速 */
    transform: translateZ(0);
    backface-visibility: hidden;
  }
`;

const LoadingPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  font-size: 2rem;
  opacity: 0.6;
`;

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: React.ReactNode;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
}

export const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  alt,
  placeholder,
  onError,
  className
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <ImageContainer ref={imgRef} $isLoaded={isLoaded} className={className}>
      {!isInView && !hasError && (
        <LoadingPlaceholder>
          {placeholder || '🎵'}
        </LoadingPlaceholder>
      )}
      
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {hasError && (
        <LoadingPlaceholder>
          {placeholder || '🎵'}
        </LoadingPlaceholder>
      )}
    </ImageContainer>
  );
});

LazyImage.displayName = 'LazyImage';
