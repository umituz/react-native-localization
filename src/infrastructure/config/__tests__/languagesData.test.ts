/**
 * Tests for language registry
 */

import { languageRegistry, DEFAULT_LANGUAGES } from '../src/infrastructure/config/languagesData';
import type { Language } from '../src/domain/repositories/ILocalizationRepository';

describe('LanguageRegistry', () => {
  beforeEach(() => {
    // Reset registry before each test
    languageRegistry.clearLanguages();
  });

  describe('registerLanguages', () => {
    it('should register new languages', () => {
      const newLanguages: Language[] = [
        { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
        { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      ];

      languageRegistry.registerLanguages(newLanguages);

      const languages = languageRegistry.getLanguages();
      expect(languages).toHaveLength(2 + DEFAULT_LANGUAGES.length);
      expect(languages.some(lang => lang.code === 'fr-FR')).toBe(true);
      expect(languages.some(lang => lang.code === 'de-DE')).toBe(true);
    });

    it('should not duplicate existing languages', () => {
      const newLanguages: Language[] = [
        { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      ];

      languageRegistry.registerLanguages(newLanguages);
      const languages = languageRegistry.getLanguages();
      
      const englishLanguages = languages.filter(lang => lang.code === 'en-US');
      expect(englishLanguages).toHaveLength(1);
    });
  });

  describe('getLanguageByCode', () => {
    it('should return language by code', () => {
      const language = languageRegistry.getLanguageByCode('en-US');
      expect(language).toBeDefined();
      expect(language?.code).toBe('en-US');
    });

    it('should return undefined for unknown code', () => {
      const language = languageRegistry.getLanguageByCode('unknown');
      expect(language).toBeUndefined();
    });
  });

  describe('searchLanguages', () => {
    beforeEach(() => {
      languageRegistry.registerLanguages([
        { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
        { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      ]);
    });

    it('should search by name', () => {
      const results = languageRegistry.searchLanguages('french');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('fr-FR');
    });

    it('should search by native name', () => {
      const results = languageRegistry.searchLanguages('Deutsch');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('de-DE');
    });

    it('should be case insensitive', () => {
      const results = languageRegistry.searchLanguages('FRENCH');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('fr-FR');
    });

    it('should return empty array for no matches', () => {
      const results = languageRegistry.searchLanguages('unknown');
      expect(results).toHaveLength(0);
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported language', () => {
      const supported = languageRegistry.isLanguageSupported('en-US');
      expect(supported).toBe(true);
    });

    it('should return false for unsupported language', () => {
      const supported = languageRegistry.isLanguageSupported('unknown');
      expect(supported).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return default language', () => {
      const defaultLang = languageRegistry.getDefaultLanguage();
      expect(defaultLang).toBeDefined();
      expect(defaultLang.code).toBe('en-US');
    });
  });

  describe('clearLanguages', () => {
    it('should reset to default languages', () => {
      languageRegistry.registerLanguages([
        { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      ]);

      expect(languageRegistry.getLanguages()).toHaveLength(DEFAULT_LANGUAGES.length + 1);

      languageRegistry.clearLanguages();

      expect(languageRegistry.getLanguages()).toHaveLength(DEFAULT_LANGUAGES.length);
      expect(languageRegistry.getLanguages()[0].code).toBe('en-US');
    });
  });
});