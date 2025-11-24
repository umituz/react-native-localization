/**
 * Localization Store
 * Zustand state management for language preferences
 *
 * Uses separate classes for initialization, switching, and translation
 * Follows Single Responsibility Principle
 */

import { create } from 'zustand';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode } from '../config/languages';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Language } from '../../domain/repositories/ILocalizationRepository';

interface LocalizationState {
  currentLanguage: string;
  isRTL: boolean;
  isInitialized: boolean;
  supportedLanguages: Language[];
  setLanguage: (languageCode: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLocalizationStore = create<LocalizationState>((set, get) => ({
  currentLanguage: DEFAULT_LANGUAGE,
  isRTL: false,
  isInitialized: false,
  supportedLanguages: SUPPORTED_LANGUAGES,

  /**
   * Initialize localization system
   */
  initialize: async () => {
    // Prevent re-initialization
    const { isInitialized: alreadyInitialized } = get();
    if (alreadyInitialized) {
      return;
    }

    try {
      const result = await LanguageInitializer.initialize();

      set({
        currentLanguage: result.languageCode,
        isRTL: result.isRTL,
        isInitialized: true,
      });
    } catch (error) {
      // Set fallback state even on error
      set({
        currentLanguage: DEFAULT_LANGUAGE,
        isRTL: false,
        isInitialized: true,
      });
    }
  },

  /**
   * Change language
   */
  setLanguage: async (languageCode: string) => {
    try {
      const result = await LanguageSwitcher.switchLanguage(languageCode);

      set({
        currentLanguage: result.languageCode,
        isRTL: result.isRTL,
      });
    } catch (error) {
      throw error;
    }
  },
}));

/**
 * Hook to use localization
 * Provides current language, RTL state, language switching, and translation function
 */
export const useLocalization = () => {
  const {
    currentLanguage,
    isRTL,
    isInitialized,
    supportedLanguages,
    setLanguage,
    initialize,
  } = useLocalizationStore();

  const currentLanguageObject = getLanguageByCode(currentLanguage);

  // Import translation function here to avoid circular dependencies
  const { useTranslationFunction } = require('../hooks/useTranslation');
  const t = useTranslationFunction();

  return {
    t,
    currentLanguage,
    currentLanguageObject,
    isRTL,
    isInitialized,
    supportedLanguages,
    setLanguage,
    initialize,
  };
};
