/**
 * Localization Repository Interface
 * Defines language configuration and types
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface ILocalizationRepository {
  getSupportedLanguages(): Language[];
  getLanguageByCode(code: string): Language | undefined;
  isLanguageSupported(code: string): boolean;
}
