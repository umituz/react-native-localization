/**
 * Language Switcher
 *
 * Handles switching between languages
 * - Language validation
 * - Dynamic resource loading
 * - Persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../config/i18n';
import { getLanguageByCode } from '../config/languages';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = '@localization:language';

export class LanguageSwitcher {
  /**
   * Switch to a new language
   */
  static async switchLanguage(languageCode: string): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    const language = getLanguageByCode(languageCode);

    // Validate language exists
    if (!language) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    // Load language resources if needed
    await this.loadLanguageResources(languageCode);

    // Update i18n
    await i18n.changeLanguage(languageCode);

    // Persist language preference
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);

    return {
      languageCode,
      isRTL: language.rtl || false,
    };
  }

  /**
   * Load language resources dynamically
   */
  private static async loadLanguageResources(languageCode: string): Promise<void> {
    if (i18n.hasResourceBundle(languageCode, 'translation')) {
      return; // Already loaded
    }

    try {
      // Try to load project translations from common paths
      let translations: any = null;

      const loadPaths = [
        `../../../../../../src/domains/localization/infrastructure/locales/${languageCode}`,
        `../../../../../../domains/localization/infrastructure/locales/${languageCode}`,
        `../../../../../../src/locales/${languageCode}`,
      ];

      for (const path of loadPaths) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          translations = require(path);
          break;
        } catch {
          // Try next path
        }
      }

      if (translations) {
        const translationData = translations.default || translations;
        i18n.addResourceBundle(languageCode, 'translation', translationData, true, true);
      }
    } catch (loadError) {
      // If loading fails, continue with changeLanguage (will fallback to en-US)
    }
  }
}
