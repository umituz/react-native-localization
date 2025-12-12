/**
 * Simple tests for language registry
 */

import { languageRegistry } from '../../config/languagesData';

describe('LanguageRegistry', () => {
  beforeEach(() => {
    languageRegistry.clearLanguages();
  });

  it('should get default language', () => {
    const defaultLang = languageRegistry.getDefaultLanguage();
    expect(defaultLang).toBeDefined();
    expect(defaultLang.code).toBe('en-US');
  });

  it('should check if language is supported', () => {
    const supported = languageRegistry.isLanguageSupported('en-US');
    expect(supported).toBe(true);
  });

  it('should check if language is not supported', () => {
    const supported = languageRegistry.isLanguageSupported('unknown');
    expect(supported).toBe(false);
  });

  it('should get language by code', () => {
    const language = languageRegistry.getLanguageByCode('en-US');
    expect(language).toBeDefined();
    expect(language?.code).toBe('en-US');
  });

  it('should return undefined for unknown code', () => {
    const language = languageRegistry.getLanguageByCode('unknown');
    expect(language).toBeUndefined();
  });

  it('should search languages', () => {
    const results = languageRegistry.searchLanguages('english');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should get supported languages', () => {
    const languages = languageRegistry.getLanguages();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
    // Should now support many languages (29+)
    expect(languages.length).toBeGreaterThan(20);
  });

  it('should support newly added languages', () => {
    expect(languageRegistry.isLanguageSupported('cs-CZ')).toBe(true);
    expect(languageRegistry.isLanguageSupported('pt-BR')).toBe(true);
    expect(languageRegistry.isLanguageSupported('zh-TW')).toBe(true);
    expect(languageRegistry.isLanguageSupported('el-GR')).toBe(true);
  });

  it('should find language attributes correctly', () => {
    const czech = languageRegistry.getLanguageByCode('cs-CZ');
    expect(czech).toBeDefined();
    expect(czech?.name).toBe('Czech');
    expect(czech?.flag).toBe('🇨🇿');

    const brazil = languageRegistry.getLanguageByCode('pt-BR');
    expect(brazil).toBeDefined();
    expect(brazil?.name).toBe('Portuguese (Brazil)');
  });
});