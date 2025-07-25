/**
 * Responsive Utilities
 * Helper functions for responsive design
 */

// Breakpoint values (should match CSS variables)
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Check if the current viewport matches a media query
 * @param query - Media query string
 * @returns boolean indicating if the media query matches
 */
export const matchesMedia = (query: string): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(query).matches;
};

/**
 * Check if the current viewport is at least a certain width
 * @param breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
 * @returns boolean indicating if the viewport is at least the specified width
 */
export const isMinWidth = (breakpoint: keyof typeof breakpoints): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Check if the current viewport is at most a certain width
 * @param breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
 * @returns boolean indicating if the viewport is at most the specified width
 */
export const isMaxWidth = (breakpoint: keyof typeof breakpoints): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < breakpoints[breakpoint];
};

/**
 * Check if the current viewport is between two widths
 * @param minBreakpoint - Minimum breakpoint name (xs, sm, md, lg, xl)
 * @param maxBreakpoint - Maximum breakpoint name (sm, md, lg, xl, 2xl)
 * @returns boolean indicating if the viewport is between the specified widths
 */
export const isBetweenWidths = (
  minBreakpoint: keyof typeof breakpoints,
  maxBreakpoint: keyof typeof breakpoints
): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    window.innerWidth >= breakpoints[minBreakpoint] &&
    window.innerWidth < breakpoints[maxBreakpoint]
  );
};

/**
 * Check if the current viewport is in portrait orientation
 * @returns boolean indicating if the viewport is in portrait orientation
 */
export const isPortrait = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(orientation: portrait)').matches;
};

/**
 * Check if the current viewport is in landscape orientation
 * @returns boolean indicating if the viewport is in landscape orientation
 */
export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(orientation: landscape)').matches;
};

/**
 * Get the current breakpoint name
 * @returns The name of the current breakpoint (xs, sm, md, lg, xl, 2xl)
 */
export const getCurrentBreakpoint = (): keyof typeof breakpoints => {
  if (typeof window === 'undefined') {
    return 'md'; // Default for SSR
  }
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Add event listener for window resize with debounce
 * @param callback - Function to call when resize event fires
 * @param delay - Debounce delay in milliseconds
 * @returns Cleanup function to remove the event listener
 */
export const onWindowResize = (
  callback: () => void,
  delay = 250
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Add event listener for orientation change
 * @param callback - Function to call when orientation changes
 * @returns Cleanup function to remove the event listener
 */
export const onOrientationChange = (
  callback: (isPortrait: boolean) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia('(orientation: portrait)');
  
  const handleOrientationChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleOrientationChange);
    return () => mediaQuery.removeEventListener('change', handleOrientationChange);
  }
  
  // Legacy browsers
  // @ts-ignore - For older browsers that don't support addEventListener on MediaQueryList
  mediaQuery.addListener(handleOrientationChange);
  return () => {
    // @ts-ignore - For older browsers
    mediaQuery.removeListener(handleOrientationChange);
  };
};

/**
 * React hook to get the current viewport size
 * @returns Object with viewport width and height
 */
export const useViewportSize = () => {
  if (typeof window === 'undefined') {
    // Default values for SSR
    return { width: 1024, height: 768 };
  }
  
  const [size, setSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  React.useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return size;
};

/**
 * React hook to check if a media query matches
 * @param query - Media query string
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Legacy browsers
    // @ts-ignore - For older browsers that don't support addEventListener on MediaQueryList
    mediaQuery.addListener(handleChange);
    return () => {
      // @ts-ignore - For older browsers
      mediaQuery.removeListener(handleChange);
    };
  }, [query]);
  
  return matches;
};

/**
 * React hook to get the current breakpoint
 * @returns The name of the current breakpoint (xs, sm, md, lg, xl, 2xl)
 */
export const useBreakpoint = (): keyof typeof breakpoints => {
  if (typeof window === 'undefined') {
    return 'md'; // Default for SSR
  }
  
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof breakpoints>(getCurrentBreakpoint());
  
  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return breakpoint;
};

/**
 * React hook to check if the current orientation is portrait
 * @returns boolean indicating if the orientation is portrait
 */
export const useIsPortrait = (): boolean => {
  return useMediaQuery('(orientation: portrait)');
};

/**
 * Add a class to the HTML element based on the current orientation
 * This is useful for applying orientation-specific styles
 */
export const initOrientationClassHandler = (): void => {
  if (typeof window === 'undefined' || !document.documentElement) {
    return;
  }
  
  const html = document.documentElement;
  
  const updateOrientationClass = () => {
    if (window.matchMedia('(orientation: portrait)').matches) {
      html.classList.remove('orientation-landscape');
      html.classList.add('orientation-portrait');
    } else {
      html.classList.remove('orientation-portrait');
      html.classList.add('orientation-landscape');
    }
  };
  
  // Set initial class
  updateOrientationClass();
  
  // Update class on orientation change
  const mediaQuery = window.matchMedia('(orientation: portrait)');
  
  const handleOrientationChange = () => {
    html.classList.add('orientation-changing');
    updateOrientationClass();
    
    // Remove the transition class after animation completes
    setTimeout(() => {
      html.classList.remove('orientation-changing');
    }, 300);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleOrientationChange);
  } else {
    // Legacy browsers
    // @ts-ignore - For older browsers
    mediaQuery.addListener(handleOrientationChange);
  }
};

// Initialize orientation class handler when this module is imported
if (typeof window !== 'undefined') {
  initOrientationClassHandler();
}