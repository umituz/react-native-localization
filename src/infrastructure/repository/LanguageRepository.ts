/**
 * Language Repository
 * Manages language data with repository pattern
 * Provides dynamic language management for multiple applications
 */

import type { Language } from '../storage/types/Language';
import { DEFAULT_LANGUAGES } from '../config/constants/defaultLanguages';

class LanguageRepository {
  private languages: Language[] = [...DEFAULT_LANGUAGES];

  registerLanguages(languages: Language[]): void {
    this.languages = [...this.languages, ...languages];
  }

  getLanguages(): Language[] {
    return [...this.languages];
  }

  clearLanguages(): void {
    this.languages = [...DEFAULT_LANGUAGES];
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.languages.find(lang => lang.code === code);
  }

  searchLanguages(query: string): Language[] {
    const lowerQuery = query.toLowerCase();
    return this.languages.filter(
      lang =>
        lang.name.toLowerCase().includes(lowerQuery) ||
        lang.nativeName.toLowerCase().includes(lowerQuery)
    );
  }

  isLanguageSupported(code: string): boolean {
    return this.languages.some(lang => lang.code === code);
  }

  getDefaultLanguage(): Language {
    const en = this.languages.find(l => l.code === 'en-US');
    if (en) return en;
    const first = this.languages[0];
    if (first) return first;
    const systemDefault = DEFAULT_LANGUAGES[0];
    if (systemDefault) return systemDefault;
    throw new Error('No languages registered in repository or defaults');
  }
}

export const languageRepository = new LanguageRepository();
