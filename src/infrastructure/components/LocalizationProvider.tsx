/**
 * LocalizationProvider Component
 * Initializes localization system with app translations
 * Includes memory leak prevention and performance optimizations
 */

import React, { useEffect, useRef, ReactNode, useCallback } from 'react';
import { useLocalizationStore } from '../storage/LocalizationStore';
import { I18nInitializer } from '../config/I18nInitializer';

export interface LocalizationProviderProps {
  children: ReactNode;
  translations: Record<string, any>;
  defaultLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
  onError?: (error: Error) => void;
  enableCache?: boolean;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
  translations,
  defaultLanguage = 'en-US',
  onLanguageChange,
  onError,
  enableCache = true,
}) => {
  const store = useLocalizationStore();
  const initialize = store.initialize;
  const setLanguage = store.setLanguage;
  const isInitialized = store.isInitialized;
  const currentLanguage = store.currentLanguage;
  
  const isInitializingRef = useRef(false);
  const previousLanguageRef = useRef(currentLanguage);

  // Memoize translations to prevent unnecessary re-renders
  const memoizedTranslations = useRef(translations);
  
  // Update memoized translations when they change
  useEffect(() => {
    memoizedTranslations.current = translations;
  }, [translations]);

  // Initialize localization system
  useEffect(() => {
    if (isInitializingRef.current || isInitialized) {
      return;
    }

    isInitializingRef.current = true;

    const initializeLocalization = async () => {
      try {
        if (__DEV__) {
          console.log('[LocalizationProvider] Initializing with language:', defaultLanguage);
        }

        await I18nInitializer.initialize(memoizedTranslations.current, defaultLanguage);
        await initialize();

        if (__DEV__) {
          console.log('[LocalizationProvider] Initialization complete');
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[LocalizationProvider] Initialization failed:', error);
        }
        onError?.(error instanceof Error ? error : new Error('Initialization failed'));
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeLocalization();

    // Cleanup function
    return () => {
      if (__DEV__) {
        console.log('[LocalizationProvider] Cleanup');
      }
    };
  }, [defaultLanguage, initialize, onError, isInitialized]);

  // Handle language changes
  useEffect(() => {
    if (previousLanguageRef.current !== currentLanguage && currentLanguage !== previousLanguageRef.current) {
      previousLanguageRef.current = currentLanguage;
      onLanguageChange?.(currentLanguage);
      
      if (__DEV__) {
        console.log('[LocalizationProvider] Language changed to:', currentLanguage);
      }
    }
  }, [currentLanguage, onLanguageChange]);

  // Handle language change with error handling
  const handleLanguageChange = useCallback(async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
    } catch (error) {
      if (__DEV__) {
        console.error('[LocalizationProvider] Language change failed:', error);
      }
      onError?.(error instanceof Error ? error : new Error('Language change failed'));
      throw error;
    }
  }, [setLanguage, onError]);

  // Context value with memoized functions
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

// Context for language change handling
const LocalizationContext = React.createContext<{
  handleLanguageChange: (languageCode: string) => Promise<void>;
  isInitialized: boolean;
  currentLanguage: string;
} | null>(null);

export const useLocalizationContext = () => {
  const context = React.useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalizationContext must be used within LocalizationProvider');
  }
  return context;
};