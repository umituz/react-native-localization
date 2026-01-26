/**
 * Localization Store Factory
 * Creates and manages localization state with proper separation of concerns
 */

import { create } from 'zustand';
import type { LocalizationState, LocalizationActions, LocalizationGetters } from './types/LocalizationState';
import { LanguageInitializer } from './LanguageInitializer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { languageRepository } from '../repository/LanguageRepository';

declare const __DEV__: boolean;

type LocalizationStoreType = LocalizationState & LocalizationActions & LocalizationGetters;

// Mutex to prevent race condition in initialize
let initializeInProgress = false;
// Debounce timer for language switching
let languageSwitchTimer: ReturnType<typeof setTimeout> | null = null;
const LANGUAGE_SWITCH_DEBOUNCE_MS = 300;

export const useLocalizationStore = create<LocalizationStoreType>((set, get) => ({
  // State
  currentLanguage: 'en-US',
  isRTL: false,
  isInitialized: false,
  supportedLanguages: languageRepository.getLanguages(),

  // Actions
  initialize: async () => {
    const { isInitialized: alreadyInitialized } = get();

    // Atomic check: both state flag AND in-progress mutex
    if (alreadyInitialized || initializeInProgress) {
      return;
    }

    // Set mutex immediately (synchronous)
    initializeInProgress = true;

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
    } finally {
      // Reset mutex after completion (success or failure)
      initializeInProgress = false;
    }
  },

  setLanguage: async (languageCode: string) => {
    // Debounce rapid language switches
    if (languageSwitchTimer) {
      clearTimeout(languageSwitchTimer);
    }

    return new Promise<void>((resolve) => {
      languageSwitchTimer = setTimeout(async () => {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log('[LocalizationStore] setLanguage called:', languageCode);
        }

        try {
          const result = await LanguageSwitcher.switchLanguage(languageCode);

          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log('[LocalizationStore] LanguageSwitcher result:', result);
          }

          set({
            currentLanguage: result.languageCode,
            isRTL: result.isRTL,
          });

          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.log('[LocalizationStore] Store updated with new language:', result.languageCode);
          }
        } catch (error) {
          if (typeof __DEV__ !== "undefined" && __DEV__) {
            console.error('[LocalizationStore] Language switch failed:', error);
          }
        }

        languageSwitchTimer = null;
        resolve();
      }, LANGUAGE_SWITCH_DEBOUNCE_MS);
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