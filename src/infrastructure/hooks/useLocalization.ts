/**
 * Localization Hook
 * Provides a clean interface to localization functionality
 * Follows Single Responsibility Principle
 */

import { useCallback } from 'react';
import { useLocalizationStore } from '../storage/LocalizationStore';
import { useTranslationFunction } from './useTranslation';
import type { Language } from '../../domain/repositories/ILocalizationRepository';

/**
 * Hook to use localization functionality
 * Provides current language, RTL state, language switching, and translation function
 */
export const useLocalization = () => {
  const store = useLocalizationStore();
  const { t } = useTranslationFunction();

  const getCurrentLanguageObject = useCallback((): Language | undefined => {
    return store.getCurrentLanguage();
  }, [store]);

  const handleSetLanguage = useCallback(async (languageCode: string) => {
    await store.setLanguage(languageCode);
  }, [store]);

  const handleInitialize = useCallback(async () => {
    await store.initialize();
  }, [store]);

  const isLanguageSupported = useCallback((code: string) => {
    return store.isLanguageSupported(code);
  }, [store]);

  const getSupportedLanguages = useCallback(() => {
    return store.getSupportedLanguages();
  }, [store]);

  return {
    // Translation function
    t,
    
    // Current state
    currentLanguage: store.currentLanguage,
    currentLanguageObject: getCurrentLanguageObject(),
    isRTL: store.isRTL,
    isInitialized: store.isInitialized,
    
    // Actions
    setLanguage: handleSetLanguage,
    initialize: handleInitialize,
    
    // Utilities
    isLanguageSupported,
    supportedLanguages: getSupportedLanguages(),
  };
};