/**
 * Language Initializer
 *
 * Handles the initialization of localization system
 * - Device locale detection
 * - Language validation and fallback
 * - i18n setup
 */

import { storageRepository } from '@umituz/react-native-storage';
import i18n from '../config/i18n';
import { languageRegistry } from '../config/languagesData';
import { getDeviceLocale } from '../config/languages';

const LANGUAGE_STORAGE_KEY = '@localization:language';

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
    } catch (error) {
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
    const language = languageRegistry.getLanguageByCode(languageCode);
    const finalLanguageCode = language ? languageCode : 'en-US';
    const finalLanguageObj = languageRegistry.getLanguageByCode(finalLanguageCode);

    await i18n.changeLanguage(finalLanguageCode);

    return {
      languageCode: finalLanguageCode,
      isRTL: finalLanguageObj?.rtl || finalLanguageObj?.isRTL || false,
    };
  }

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
