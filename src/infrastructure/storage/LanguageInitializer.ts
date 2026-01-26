/**
 * Language Initializer
 *
 * Handles the initialization of localization system
 * - Device locale detection
 * - Language validation and fallback
 * - i18n setup
 */

declare const __DEV__: boolean;

import { storageRepository } from '@umituz/react-native-design-system';
import i18n from '../config/i18n';
import { languageRepository } from '../repository/LanguageRepository';
import { getDeviceLocale } from '../config/languages';

const LANGUAGE_STORAGE_KEY = '@localization:language';
const DEFAULT_LANGUAGE = 'en-US';

export class LanguageInitializer {
  /**
   * Initialize localization system
   */
  static async initialize(): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    try {
      const savedResult = await storageRepository.getString(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
      const savedLanguage = savedResult.success && savedResult.data ? savedResult.data : DEFAULT_LANGUAGE;
      const languageCode = await this.determineLanguageCode(savedLanguage);
      const finalLanguage = await this.validateAndSetupLanguage(languageCode);

      return finalLanguage;
    } catch {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[LanguageInitializer] Failed to restore language, falling back to device locale");
      }
      return await this.setupFallbackLanguage();
    }
  }

  private static async determineLanguageCode(savedLanguage: string): Promise<string> {
    if (savedLanguage && savedLanguage !== DEFAULT_LANGUAGE) {
      return savedLanguage;
    }

    const deviceLocale = getDeviceLocale();
    await storageRepository.setString(LANGUAGE_STORAGE_KEY, deviceLocale);
    return deviceLocale;
  }

  private static async validateAndSetupLanguage(languageCode: string): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    const language = languageRepository.getLanguageByCode(languageCode);
    const finalLanguageCode = language ? languageCode : 'en-US';
    const finalLanguageObj = languageRepository.getLanguageByCode(finalLanguageCode);

    await i18n.changeLanguage(finalLanguageCode);

    return {
      languageCode: finalLanguageCode,
      isRTL: finalLanguageObj?.isRTL || false,
    };
  }

  private static async setupFallbackLanguage(): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    // No try-catch needed - let errors propagate naturally
    // This preserves the full stack trace
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    return {
      languageCode: DEFAULT_LANGUAGE,
      isRTL: false,
    };
  }
}
