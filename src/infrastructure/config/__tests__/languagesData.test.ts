/**
 * Simple tests for language repository
 */

import { languageRepository } from '../../repository/LanguageRepository';

describe('LanguageRepository', () => {
  beforeEach(() => {
    languageRepository.clearLanguages();
  });

  it('should get default language', () => {
    const defaultLang = languageRepository.getDefaultLanguage();
    expect(defaultLang).toBeDefined();
    expect(defaultLang.code).toBe('en-US');
  });

  it('should check if language is supported', () => {
    const supported = languageRepository.isLanguageSupported('en-US');
    expect(supported).toBe(true);
  });

  it('should check if language is not supported', () => {
    const supported = languageRepository.isLanguageSupported('unknown');
    expect(supported).toBe(false);
  });

  it('should get language by code', () => {
    const language = languageRepository.getLanguageByCode('en-US');
    expect(language).toBeDefined();
    expect(language?.code).toBe('en-US');
  });

  it('should return undefined for unknown code', () => {
    const language = languageRepository.getLanguageByCode('unknown');
    expect(language).toBeUndefined();
  });

  it('should search languages', () => {
    const results = languageRepository.searchLanguages('english');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should get supported languages', () => {
    const languages = languageRepository.getLanguages();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
    // Should now support many languages (29+)
    expect(languages.length).toBeGreaterThan(20);
  });

  it('should support newly added languages', () => {
    expect(languageRepository.isLanguageSupported('cs-CZ')).toBe(true);
    expect(languageRepository.isLanguageSupported('pt-BR')).toBe(true);
    expect(languageRepository.isLanguageSupported('zh-TW')).toBe(true);
    expect(languageRepository.isLanguageSupported('el-GR')).toBe(true);
  });

  it('should find language attributes correctly', () => {
    const czech = languageRepository.getLanguageByCode('cs-CZ');
    expect(czech).toBeDefined();
    expect(czech?.name).toBe('Czech');
    expect(czech?.flag).toBe('🇨🇿');

    const brazil = languageRepository.getLanguageByCode('pt-BR');
    expect(brazil).toBeDefined();
    expect(brazil?.name).toBe('Portuguese (Brazil)');
  });
});