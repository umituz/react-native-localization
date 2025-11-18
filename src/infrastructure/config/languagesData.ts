/**
 * Language Configuration
 * Strategic language support with 29 languages (top revenue markets only)
 * Optimized for maximum monetization with minimal maintenance cost
 * Generated from App Factory language_config.yaml
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

/**
 * Get language by code
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code);
};

/**
 * Get default language (en-US)
 */
export const getDefaultLanguage = (): Language => {
  return LANGUAGES.find(lang => lang.code === 'en-US')!;
};

/**
 * Search languages by name or native name
 */
export const searchLanguages = (query: string): Language[] => {
  const lowerQuery = query.toLowerCase();
  return LANGUAGES.filter(
    lang =>
      lang.name.toLowerCase().includes(lowerQuery) ||
      lang.nativeName.toLowerCase().includes(lowerQuery)
  );
};
