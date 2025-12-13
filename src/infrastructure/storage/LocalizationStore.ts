/**
 * Localization Store Factory
 * Creates and manages localization state with proper separation of concerns
 */

import { create } from 'zustand';
import type { LocalizationState, LocalizationActions, LocalizationGetters, Language } from './types/LocalizationState';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languageRegistry } from '../config/languagesData';
import { translationCache } from '../config/TranslationCache';

interface LocalizationStore extends LocalizationState, LocalizationActions, LocalizationGetters {
  // Additional properties can be added here if needed
}

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
          if (__DEV__) {
            console.log('[Localization] Already initialized');
          }
          return;
        }

        try {
          const result = await LanguageInitializer.initialize();

          set({
            currentLanguage: result.languageCode,
            isRTL: result.isRTL,
            isInitialized: true,
          });

          if (__DEV__) {
            console.log(`[Localization] Initialized with language: ${result.languageCode}`);
          }
        } catch (error) {
          // Set fallback state even on error
          set({
            currentLanguage: 'en-US',
            isRTL: false,
            isInitialized: true,
          });

          if (__DEV__) {
            console.error('[Localization] Initialization failed, using fallback:', error);
          }
        }
      },



      setLanguage: async (languageCode: string) => {
        try {
          const result = await LanguageSwitcher.switchLanguage(languageCode);

          // Clear translation cache to ensure new keys are fetched
          translationCache.clear();

          set({
            currentLanguage: result.languageCode,
            isRTL: result.isRTL,
          });

          if (__DEV__) {
            console.log(`[Localization] Language changed to: ${result.languageCode}`);
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[Localization] Language change failed:', error);
          }
          throw error;
        }
      },

      reset: () => {
        set({
          currentLanguage: 'en-US',
          isRTL: false,
          isInitialized: false,
        });

        if (__DEV__) {
          console.log('[Localization] Store reset');
        }
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