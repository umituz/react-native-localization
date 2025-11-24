/**
 * Language Initializer
 *
 * Handles the initialization of localization system
 * - Device locale detection
 * - Language validation and fallback
 * - i18n setup
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';
import { DEFAULT_LANGUAGE, getLanguageByCode, getDeviceLocale } from '../config/languages';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = '@localization:language';

export class LanguageInitializer {
  /**
   * Initialize localization system
   * Detects device locale and sets up i18n
   */
  static async initialize(): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    try {
      // Get saved language preference
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE;

      // Determine language code
      const languageCode = await this.determineLanguageCode(savedLanguage);

      // Validate and get language object
      const finalLanguage = await this.validateAndSetupLanguage(languageCode);

      return finalLanguage;
    } catch (error) {
      // Fallback to default language
      return await this.setupFallbackLanguage();
    }
  }

  /**
   * Determine which language code to use
   */
  private static async determineLanguageCode(savedLanguage: string): Promise<string> {
    if (savedLanguage && savedLanguage !== DEFAULT_LANGUAGE) {
      // User has previously selected a language
      return savedLanguage;
    } else {
      // First launch - detect device locale
      const deviceLocale = getDeviceLocale();
      // Save detected locale for future launches
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, deviceLocale);
      return deviceLocale;
    }
  }

  /**
   * Validate language and set it up in i18n
   */
  private static async validateAndSetupLanguage(languageCode: string): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    const language = getLanguageByCode(languageCode);
    const finalLanguageCode = language ? languageCode : DEFAULT_LANGUAGE;
    const finalLanguageObj = getLanguageByCode(finalLanguageCode);

    await i18n.changeLanguage(finalLanguageCode);

    return {
      languageCode: finalLanguageCode,
      isRTL: finalLanguageObj?.rtl || false,
    };
  }

  /**
   * Set up fallback language when initialization fails
   */
  private static async setupFallbackLanguage(): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    try {
      await i18n.changeLanguage(DEFAULT_LANGUAGE);
      return {
        languageCode: DEFAULT_LANGUAGE,
        isRTL: false,
      };
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}
