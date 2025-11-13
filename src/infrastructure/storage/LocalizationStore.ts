/**
 * Localization Store
 * Zustand state management for language preferences with AsyncStorage persistence
 */

import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { StorageWrapper, STORAGE_KEYS } from './AsyncStorageWrapper';
import i18n from '../config/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode, getDeviceLocale } from '../config/languages';
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
   * Initialize localization
   * DEVICE LOCALE DETECTION:
   * - First launch (no saved language): Automatically detect device locale
   * - After manual selection: Use saved language preference
   * - Fallback: English (en-US) if device locale not supported
   */
  initialize: async () => {
    try {
      // ✅ CRITICAL FIX: Don't reset isInitialized if already initialized
      // This prevents UI flash on re-initialization
      const { isInitialized: alreadyInitialized } = get();
      if (alreadyInitialized) {
        return;
      }

      // Get saved language preference
      const savedLanguage = await StorageWrapper.getString(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE);

      // ✅ DEVICE LOCALE DETECTION: Use device locale on first launch
      let languageCode: string;
      if (savedLanguage && savedLanguage !== DEFAULT_LANGUAGE) {
        // User has previously selected a language → Use their choice
        languageCode = savedLanguage;
      } else {
        // First launch → Detect device locale automatically
        languageCode = getDeviceLocale();
        // Save detected locale for future launches
        await StorageWrapper.setString(STORAGE_KEYS.LANGUAGE, languageCode);
      }

      // ✅ DEFENSIVE: Validate language exists, fallback to default
      const language = getLanguageByCode(languageCode);
      const finalLanguage = language ? languageCode : DEFAULT_LANGUAGE;
      const finalLanguageObj = getLanguageByCode(finalLanguage);

      await i18n.changeLanguage(finalLanguage);
      
      set({
        currentLanguage: finalLanguage,
        isRTL: finalLanguageObj?.rtl || false,
        isInitialized: true, // ✅ Always set true to unblock UI
      });
    } catch (error) {
      // Set to default language even on error to prevent app from breaking
      try {
        await i18n.changeLanguage(DEFAULT_LANGUAGE);
        set({
          currentLanguage: DEFAULT_LANGUAGE,
          isRTL: false,
          isInitialized: true, // Set true even on error to unblock UI
        });
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  },

  /**
   * Change language
   * Updates i18n, state, and persists to AsyncStorage
   */
  setLanguage: async (languageCode: string) => {
    try {
      const language = getLanguageByCode(languageCode);

      // ✅ DEFENSIVE: Early return if unsupported language
      if (!language) {
        return;
      }

      // Update i18n
      await i18n.changeLanguage(languageCode);

      // Update state
      set({
        currentLanguage: languageCode,
        isRTL: language.rtl || false,
      });

      // Persist language preference
      await StorageWrapper.setString(STORAGE_KEYS.LANGUAGE, languageCode);
    } catch (error) {
      throw error;
    }
  },
}));

/**
 * Hook to use localization
 * Provides current language, RTL state, language switching, and translation function
 * Uses react-i18next's useTranslation hook to ensure proper i18n instance
 * Falls back to direct i18n.t if react-i18next is not ready
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

  // Always call useTranslation hook (React hooks rules - must be unconditional)
  // Pass i18n instance explicitly to ensure react-i18next finds it
  // This fixes the "NO_I18NEXT_INSTANCE" error
  const translationResult = useTranslation(undefined, { i18n });
  
  // Use translation function from react-i18next
  // If it fails, fallback to direct i18n.t
  const t: (key: string, options?: any) => string = translationResult?.t || ((key: string, options?: any) => {
    if (i18n.isInitialized && typeof i18n.t === 'function') {
      return i18n.t(key, options);
    }
    // Final fallback: return key if i18n is not ready
    return key;
  });

  return {
    t, // Translation function from react-i18next or i18n fallback
    currentLanguage,
    currentLanguageObject,
    isRTL,
    isInitialized,
    supportedLanguages,
    setLanguage,
    initialize,
  };
};
