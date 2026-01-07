/**
 * Localization Store Factory
 * Creates and manages localization state with proper separation of concerns
 */

import { create } from 'zustand';
import type { LocalizationState, LocalizationActions, LocalizationGetters } from './types/LocalizationState';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languageRepository } from '../repository/LanguageRepository';

type LocalizationStoreType = LocalizationState & LocalizationActions & LocalizationGetters;

export const useLocalizationStore = create<LocalizationStoreType>((set, get) => ({
  // State
  currentLanguage: 'en-US',
  isRTL: false,
  isInitialized: false,
  supportedLanguages: languageRepository.getLanguages(),

  // Actions
  initialize: async () => {
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
    } catch {
      set({
        currentLanguage: 'en-US',
        isRTL: false,
        isInitialized: true,
      });
    }
  },

  setLanguage: async (languageCode: string) => {
    const result = await LanguageSwitcher.switchLanguage(languageCode);

    set({
      currentLanguage: result.languageCode,
      isRTL: result.isRTL,
    });
  },

  reset: () => {
    set({
      currentLanguage: 'en-US',
      isRTL: false,
      isInitialized: false,
    });
  },

  // Getters
  getCurrentLanguage: () => {
    const { currentLanguage } = get();
    return languageRepository.getLanguageByCode(currentLanguage);
  },

  isLanguageSupported: (code: string) => {
    return languageRepository.isLanguageSupported(code);
  },

  getSupportedLanguages: () => {
    return languageRepository.getLanguages();
  },
}));