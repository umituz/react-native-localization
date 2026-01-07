/**
 * Language Switcher
 *
 * Handles switching between languages
 * - Language validation
 * - Persistence
 */

import { storageRepository } from '@umituz/react-native-storage';
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
    const language = languageRepository.getLanguageByCode(languageCode);

    await i18n.changeLanguage(languageCode);
    await storageRepository.setString(LANGUAGE_STORAGE_KEY, languageCode);

    return {
      languageCode,
      isRTL: language?.isRTL || false,
    };
  }
}
