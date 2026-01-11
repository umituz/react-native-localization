/**
 * Language Switcher
 *
 * Handles switching between languages
 * - Language validation
 * - Persistence
 */

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
    console.log('[LanguageSwitcher] switchLanguage called:', languageCode);
    const language = languageRepository.getLanguageByCode(languageCode);
    console.log('[LanguageSwitcher] Language object:', language);

    console.log('[LanguageSwitcher] Calling i18n.changeLanguage...');
    await i18n.changeLanguage(languageCode);
    console.log('[LanguageSwitcher] i18n language changed to:', i18n.language);

    console.log('[LanguageSwitcher] Saving to storage...');
    await storageRepository.setString(LANGUAGE_STORAGE_KEY, languageCode);
    console.log('[LanguageSwitcher] Saved to storage');

    return {
      languageCode,
      isRTL: language?.isRTL || false,
    };
  }
}
