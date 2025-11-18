/**
 * Localization Store
 * Zustand state management for language preferences with AsyncStorage persistence
 *
 * DDD ARCHITECTURE: Uses @umituz/react-native-storage for all storage operations
 * - Type-safe storage with StorageKey
 * - Result pattern for error handling
 * - Single source of truth for all storage
 */

import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { storageRepository, unwrap } from '@umituz/react-native-storage';
import i18n from '../config/i18n';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageByCode, getDeviceLocale } from '../config/languages';
import type { Language } from '../../domain/repositories/ILocalizationRepository';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = '@localization:language';

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
      const result = await storageRepository.getString(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
      const savedLanguage = unwrap(result, DEFAULT_LANGUAGE);

      // ✅ DEVICE LOCALE DETECTION: Use device locale on first launch
      let languageCode: string;
      if (savedLanguage && savedLanguage !== DEFAULT_LANGUAGE) {
        // User has previously selected a language → Use their choice
        languageCode = savedLanguage;
      } else {
        // First launch → Detect device locale automatically
        languageCode = getDeviceLocale();
        // Save detected locale for future launches
        await storageRepository.setString(LANGUAGE_STORAGE_KEY, languageCode);
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
      await storageRepository.setString(LANGUAGE_STORAGE_KEY, languageCode);
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
  // Even if i18n is not fully initialized, useTranslation will handle it gracefully
  // with the explicit i18n instance passed
  const translationResult = useTranslation(undefined, { i18n });
  
  // Use translation function from react-i18next if available and valid
  // Otherwise fallback to direct i18n.t
  // Type assertion needed because react-i18next's TFunction can return string | object
  const t = (translationResult?.t && typeof translationResult.t === 'function' && i18n.isInitialized)
    ? ((key: string, options?: any): string => {
        const result = translationResult.t(key, options);
        return typeof result === 'string' ? result : String(result);
      })
    : ((key: string, options?: any): string => {
        // Fallback to direct i18n.t if react-i18next is not ready
        if (i18n.isInitialized && typeof i18n.t === 'function') {
          const result = i18n.t(key, options);
          return typeof result === 'string' ? result : String(result);
        }
        // Final fallback: return key if i18n is not ready
        return key;
      }) as (key: string, options?: any) => string;

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
