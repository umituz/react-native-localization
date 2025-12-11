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
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
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
   */
  getDefaultLanguage(): Language {
    return this.languages[0] || DEFAULT_LANGUAGES[0];
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
