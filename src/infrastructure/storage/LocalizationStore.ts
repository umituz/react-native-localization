/**
 * Localization Store
 * Zustand state management for language preferences with AsyncStorage persistence
 */

import { create } from 'zustand';
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
    // ✅ CRITICAL FIX: Don't reset isInitialized if already initialized
    // This prevents UI flash on re-initialization
    const { isInitialized: alreadyInitialized } = get();
    if (alreadyInitialized) return;

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
  },

  /**
   * Change language
   * Updates i18n, state, and persists to AsyncStorage
   */
  setLanguage: async (languageCode: string) => {
    const language = getLanguageByCode(languageCode);

    // ✅ DEFENSIVE: Early return if unsupported language
    if (!language) return;

    // Update i18n
    await i18n.changeLanguage(languageCode);

    // Update state
    set({
      currentLanguage: languageCode,
      isRTL: language.rtl || false,
    });

    // Persist language preference
    await StorageWrapper.setString(STORAGE_KEYS.LANGUAGE, languageCode);
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

  return {
    t: i18n.t.bind(i18n), // Translation function
    currentLanguage,
    currentLanguageObject,
    isRTL,
    isInitialized,
    supportedLanguages,
    setLanguage,
    initialize,
  };
};
