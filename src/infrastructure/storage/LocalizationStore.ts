/**
 * Localization Store Factory
 * Creates and manages localization state with proper separation of concerns
 */

import { create } from 'zustand';
import type { LocalizationState, LocalizationActions, LocalizationGetters } from './types/LocalizationState';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languageRegistry } from '../config/languagesData';

interface LocalizationStore extends LocalizationState, LocalizationActions, LocalizationGetters { }

/**
 * Create localization store with proper dependency injection
 */
export const createLocalizationStore = () => {
  return create<LocalizationStore>()(
    (set, get) => ({
      // State
      currentLanguage: 'en-US',
      isRTL: false,
      isInitialized: false,
      supportedLanguages: languageRegistry.getLanguages(),

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
    })
  );
};

// Create singleton instance
export const useLocalizationStore = createLocalizationStore();