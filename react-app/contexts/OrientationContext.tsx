import React, { createContext, useContext, useState, useEffect } from 'react';
import useOrientation from '../hooks/useOrientation';

interface OrientationContextType {
  isPortrait: boolean;
  isLandscape: boolean;
  orientation: 'portrait' | 'landscape';
  angle: number;
  previousOrientation: 'portrait' | 'landscape' | null;
  hasOrientationChanged: boolean;
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined);

export const OrientationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orientation, isPortrait, isLandscape, angle } = useOrientation();
  const [previousOrientation, setPreviousOrientation] = useState<'portrait' | 'landscape' | null>(null);
  const [hasOrientationChanged, setHasOrientationChanged] = useState(false);

  useEffect(() => {
    if (previousOrientation !== null && previousOrientation !== orientation) {
      setHasOrientationChanged(true);
      
      // Reset the flag after a delay
      const timer = setTimeout(() => {
        setHasOrientationChanged(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (previousOrientation !== orientation) {
      setPreviousOrientation(orientation);
    }
  }, [orientation, previousOrientation]);

  const value = {
    isPortrait,
    isLandscape,
    orientation,
    angle,
    previousOrientation,
    hasOrientationChanged
  };

  return (
    <OrientationContext.Provider value={value}>
      {children}
    </OrientationContext.Provider>
  );
};

export const useOrientationContext = (): OrientationContextType => {
  const context = useContext(OrientationContext);
  if (context === undefined) {
    throw new Error('useOrientationContext must be used within an OrientationProvider');
  }
  return context;
};