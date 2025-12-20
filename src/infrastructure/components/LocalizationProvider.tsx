/**
 * LocalizationProvider Component
 * Initializes localization system with app translations
 */

import React from 'react';
import { useLocalizationProvider } from './useLocalizationProvider';

export interface LocalizationProviderProps {
  children: React.ReactNode;
  translations: Record<string, any>;
  defaultLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
  onError?: (error: Error) => void;
  enableCache?: boolean;
}

// Context for language change handling
const LocalizationContext = React.createContext<{
  handleLanguageChange: (languageCode: string) => Promise<void>;
  isInitialized: boolean;
  currentLanguage: string;
} | null>(null);

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
  translations,
  defaultLanguage = 'en-US',
  onLanguageChange,
  onError,
}) => {
  const { isInitialized, currentLanguage, handleLanguageChange } = useLocalizationProvider({
    translations,
    defaultLanguage,
    onLanguageChange,
    onError,
  });

  const contextValue = React.useMemo(() => ({
    handleLanguageChange,
    isInitialized,
    currentLanguage,
  }), [handleLanguageChange, isInitialized, currentLanguage]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationContext = () => {
  const context = React.useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalizationContext must be used within LocalizationProvider');
  }
  return context;
};