/**
 * Language Switcher
 *
 * Handles switching between languages
 * - Language validation
 * - Persistence
 */

declare const __DEV__: boolean;

import { storageRepository } from '@umituz/react-native-design-system';
import i18n from '../config/i18n';
import { languageRepository } from '../repository/LanguageRepository';

const LANGUAGE_STORAGE_KEY = '@localization:language';

export class LanguageSwitcher {
  /**
   * Switch to a new language
   */
  static async switchLanguage(languageCode: string): Promise<{
    languageCode: string;
    isRTL: boolean;
  }> {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[LanguageSwitcher] switchLanguage called:', languageCode);
    }

    const language = languageRepository.getLanguageByCode(languageCode);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[LanguageSwitcher] Language object:', language);
    }

    await i18n.changeLanguage(languageCode);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[LanguageSwitcher] i18n language changed to:', i18n.language);
    }

    await storageRepository.setString(LANGUAGE_STORAGE_KEY, languageCode);

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log('[LanguageSwitcher] Saved to storage');
    }

    return {
      languageCode,
      isRTL: language?.isRTL || false,
    };
  }
}
