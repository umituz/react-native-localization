/**
 * LocalizationProvider Component
 * Initializes localization system with app translations
 */

import React, { useEffect, ReactNode } from 'react';
import { useLocalizationStore } from '../storage/LocalizationStore';
import { I18nInitializer } from '../config/I18nInitializer';

interface LocalizationProviderProps {
  children: ReactNode;
  translations: Record<string, any>;
  defaultLanguage?: string;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
  translations,
  defaultLanguage = 'en-US',
}) => {
  const initialize = useLocalizationStore((state) => state.initialize);

  useEffect(() => {
    I18nInitializer.initialize(translations, defaultLanguage);
    initialize();
  }, [translations, defaultLanguage, initialize]);

  return <>{children}</>;
};
