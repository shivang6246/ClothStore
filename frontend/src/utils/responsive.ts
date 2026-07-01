// Responsive utility hooks and helpers for React components
import { useEffect, useState } from 'react';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export const useIsTablet = (): boolean => {
  const [isTablet, setIsTablet] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth > 768 && window.innerWidth <= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
};

export const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

// Breakpoints for consistent responsive design
export const Breakpoints = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200,
  xxl: 1600,
};

export const getGridColumns = (screenWidth: number, defaultCols: number): number => {
  if (screenWidth <= Breakpoints.sm) return 1;
  if (screenWidth <= Breakpoints.md) return 2;
  if (screenWidth <= Breakpoints.lg) return 3;
  if (screenWidth <= Breakpoints.xl) return 4;
  return defaultCols;
};

export const responsiveSpacing = (value: number): string => {
  return `max(${value * 0.5}px, ${value * 0.5}vw)`;
};
