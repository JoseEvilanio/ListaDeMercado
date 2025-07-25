import { useState, useEffect } from 'react';
import { breakpoints } from '../utils/responsive';

type Breakpoint = keyof typeof breakpoints;
type Orientation = 'portrait' | 'landscape';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  orientation: Orientation;
  width: number;
  height: number;
}

/**
 * Hook that provides responsive design information
 * @returns Object with responsive state information
 */
export const useResponsive = (): ResponsiveState => {
  // Default state for SSR
  const defaultState: ResponsiveState = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg',
    orientation: 'landscape',
    width: 1024,
    height: 768,
  };
  
  // Return default state if window is not available (SSR)
  if (typeof window === 'undefined') {
    return defaultState;
  }
  
  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation: Orientation = height > width ? 'portrait' : 'landscape';
    
    let currentBreakpoint: Breakpoint = 'xs';
    if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
    else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
    else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
    else if (width >= breakpoints.md) currentBreakpoint = 'md';
    else if (width >= breakpoints.sm) currentBreakpoint = 'sm';
    
    return {
      isMobile: width < breakpoints.sm,
      isTablet: width >= breakpoints.sm && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      breakpoint: currentBreakpoint,
      orientation,
      width,
      height,
    };
  });
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation: Orientation = height > width ? 'portrait' : 'landscape';
      
      let currentBreakpoint: Breakpoint = 'xs';
      if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
      else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
      else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
      else if (width >= breakpoints.md) currentBreakpoint = 'md';
      else if (width >= breakpoints.sm) currentBreakpoint = 'sm';
      
      setState({
        isMobile: width < breakpoints.sm,
        isTablet: width >= breakpoints.sm && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        breakpoint: currentBreakpoint,
        orientation,
        width,
        height,
      });
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return state;
};

export default useResponsive;