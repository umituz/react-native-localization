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
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.log('[LocalizationStore] Starting initialization...');
    
    try {
      // ✅ CRITICAL FIX: Don't reset isInitialized if already initialized
      // This prevents UI flash on re-initialization
      const { isInitialized: alreadyInitialized } = get();
      if (alreadyInitialized) {
        /* eslint-disable-next-line no-console */
        if (__DEV__) console.log('[LocalizationStore] Already initialized, skipping...');
        return;
      }

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Getting saved language preference...');
      // Get saved language preference
      const savedLanguage = await StorageWrapper.getString(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE);
      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Saved language:', savedLanguage);

      // ✅ DEVICE LOCALE DETECTION: Use device locale on first launch
      let languageCode: string;
      if (savedLanguage && savedLanguage !== DEFAULT_LANGUAGE) {
        // User has previously selected a language → Use their choice
        /* eslint-disable-next-line no-console */
        if (__DEV__) console.log('[LocalizationStore] Using saved language preference:', savedLanguage);
        languageCode = savedLanguage;
      } else {
        // First launch → Detect device locale automatically
        /* eslint-disable-next-line no-console */
        if (__DEV__) console.log('[LocalizationStore] First launch, detecting device locale...');
        languageCode = getDeviceLocale();
        /* eslint-disable-next-line no-console */
        if (__DEV__) console.log('[LocalizationStore] Detected device locale:', languageCode);
        // Save detected locale for future launches
        await StorageWrapper.setString(STORAGE_KEYS.LANGUAGE, languageCode);
        /* eslint-disable-next-line no-console */
        if (__DEV__) console.log('[LocalizationStore] Saved detected locale to storage');
      }

      // ✅ DEFENSIVE: Validate language exists, fallback to default
      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Validating language code:', languageCode);
      const language = getLanguageByCode(languageCode);
      const finalLanguage = language ? languageCode : DEFAULT_LANGUAGE;
      const finalLanguageObj = getLanguageByCode(finalLanguage);
      
      if (!language) {
        /* eslint-disable-next-line no-console */
        console.warn('[LocalizationStore] ⚠️ Language not found:', languageCode, 'falling back to:', DEFAULT_LANGUAGE);
      }

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Changing i18n language to:', finalLanguage);
      await i18n.changeLanguage(finalLanguage);
      
      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Setting store state...');
      set({
        currentLanguage: finalLanguage,
        isRTL: finalLanguageObj?.rtl || false,
        isInitialized: true, // ✅ Always set true to unblock UI
      });
      
      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] ✅ Initialization complete. Language:', finalLanguage, 'RTL:', finalLanguageObj?.rtl || false);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('[LocalizationStore] ❌ FATAL: Initialization failed:', error);
      /* eslint-disable-next-line no-console */
      if (error instanceof Error) {
        /* eslint-disable-next-line no-console */
        console.error('[LocalizationStore] Error name:', error.name);
        /* eslint-disable-next-line no-console */
        console.error('[LocalizationStore] Error message:', error.message);
        /* eslint-disable-next-line no-console */
        console.error('[LocalizationStore] Error stack:', error.stack);
      }
      // Set to default language even on error to prevent app from breaking
      try {
        await i18n.changeLanguage(DEFAULT_LANGUAGE);
        set({
          currentLanguage: DEFAULT_LANGUAGE,
          isRTL: false,
          isInitialized: true, // Set true even on error to unblock UI
        });
        /* eslint-disable-next-line no-console */
        console.warn('[LocalizationStore] ⚠️ Fallback to default language due to error');
      } catch (fallbackError) {
        /* eslint-disable-next-line no-console */
        console.error('[LocalizationStore] ❌ CRITICAL: Even fallback failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Change language
   * Updates i18n, state, and persists to AsyncStorage
   */
  setLanguage: async (languageCode: string) => {
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.log('[LocalizationStore] Changing language to:', languageCode);
    
    try {
      const language = getLanguageByCode(languageCode);

      // ✅ DEFENSIVE: Early return if unsupported language
      if (!language) {
        /* eslint-disable-next-line no-console */
        console.warn('[LocalizationStore] ⚠️ Unsupported language code:', languageCode);
        return;
      }

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Updating i18n language...');
      // Update i18n
      await i18n.changeLanguage(languageCode);

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Updating store state...');
      // Update state
      set({
        currentLanguage: languageCode,
        isRTL: language.rtl || false,
      });

      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] Persisting language preference...');
      // Persist language preference
      await StorageWrapper.setString(STORAGE_KEYS.LANGUAGE, languageCode);
      
      /* eslint-disable-next-line no-console */
      if (__DEV__) console.log('[LocalizationStore] ✅ Language changed successfully to:', languageCode);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('[LocalizationStore] ❌ Error changing language:', error);
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
