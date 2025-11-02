/**
 * LocalizationProvider Component
 * Initializes localization system on mount
 */

import React, { useEffect, ReactNode } from 'react';
import { useLocalizationStore } from '../storage/LocalizationStore';

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const initialize = useLocalizationStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};
