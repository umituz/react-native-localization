/**
 * Language Configuration
 * Generic language interface and utilities for localization packages
 * This is a base configuration that can be extended by consuming applications
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isRTL?: boolean;
}

/**
 * Default language configuration
 * Applications can override this by providing their own language list
 */
export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', isRTL: false },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', isRTL: false },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', isRTL: false },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', isRTL: false },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', isRTL: false },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', isRTL: false },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', isRTL: false },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮', isRTL: false },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isRTL: false },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', isRTL: false },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', isRTL: false },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', isRTL: false },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', isRTL: false },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', isRTL: false },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', isRTL: false },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', isRTL: false },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', isRTL: false },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', isRTL: false },
  { code: 'tl-PH', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', isRTL: false },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRTL: false },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', isRTL: false },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isRTL: false },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', isRTL: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', isRTL: false },
];

/**
 * Language registry for dynamic language management
 */
class LanguageRegistry {
  private languages: Language[] = [...DEFAULT_LANGUAGES];

  /**
   * Register new languages
   */
  registerLanguages(languages: Language[]): void {
    this.languages = [...this.languages, ...languages];
    if (__DEV__) {
      console.log(`[Localization] Registered ${languages.length} languages`);
    }
  }

  /**
   * Get all registered languages
   */
  getLanguages(): Language[] {
    return [...this.languages];
  }

  /**
   * Clear all languages (reset to default)
   */
  clearLanguages(): void {
    this.languages = [...DEFAULT_LANGUAGES];
    if (__DEV__) {
      console.log('[Localization] Cleared language registry');
    }
  }

  /**
   * Get language by code
   */
  getLanguageByCode(code: string): Language | undefined {
    return this.languages.find(lang => lang.code === code);
  }

  /**
   * Search languages by name or native name
   */
  searchLanguages(query: string): Language[] {
    const lowerQuery = query.toLowerCase();
    return this.languages.filter(
      lang =>
        lang.name.toLowerCase().includes(lowerQuery) ||
        lang.nativeName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(code: string): boolean {
    return this.languages.some(lang => lang.code === code);
  }

  /**
   * Get default language
   * Prioritizes en-US, otherwise returns first available
   */
  getDefaultLanguage(): Language {
    const en = this.languages.find(l => l.code === 'en-US');
    return en || this.languages[0] || DEFAULT_LANGUAGES[0];
  }
}

// Singleton instance
export const languageRegistry = new LanguageRegistry();

// Export convenience functions that delegate to registry
export const getLanguageByCode = (code: string): Language | undefined => {
  return languageRegistry.getLanguageByCode(code);
};

export const searchLanguages = (query: string): Language[] => {
  return languageRegistry.searchLanguages(query);
};

export const isLanguageSupported = (code: string): boolean => {
  return languageRegistry.isLanguageSupported(code);
};

export const getDefaultLanguage = (): Language => {
  return languageRegistry.getDefaultLanguage();
};

// Legacy exports for backward compatibility
export const LANGUAGES = languageRegistry.getLanguages();
