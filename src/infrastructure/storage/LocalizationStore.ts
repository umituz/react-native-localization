/**
 * Localization Store Factory
 * Creates and manages localization state with proper separation of concerns
 */

import { createStore } from '@umituz/react-native-storage';
import type { LocalizationState, LocalizationActions, LocalizationGetters } from './types/LocalizationState';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languageRegistry } from '../config/languagesData';

type LocalizationStoreActions = LocalizationActions & LocalizationGetters;

const initialLocalizationState: LocalizationState = {
  currentLanguage: 'en-US',
  isRTL: false,
  isInitialized: false,
  supportedLanguages: languageRegistry.getLanguages(),
};

// Create singleton instance
export const useLocalizationStore = createStore<LocalizationState, LocalizationStoreActions>({
  name: 'localization-store',
  initialState: initialLocalizationState,
  persist: false,
  actions: (set, get) => ({
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
      return languageRegistry.getLanguageByCode(currentLanguage);
    },

    isLanguageSupported: (code: string) => {
      return languageRegistry.isLanguageSupported(code);
    },

    getSupportedLanguages: () => {
      return languageRegistry.getLanguages();
    },
  }),
});

/**
 * @deprecated Use useLocalizationStore directly
 */
export const createLocalizationStore = () => useLocalizationStore;