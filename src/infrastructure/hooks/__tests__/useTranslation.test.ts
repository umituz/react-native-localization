/**
 * Tests for useTranslation hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useTranslationFunction } from '../src/infrastructure/hooks/useTranslation';

// Mock i18next
const mockI18n = {
  isInitialized: true,
  t: jest.fn(),
  hasResourceBundle: jest.fn(),
  language: 'en-US',
};

jest.mock('../src/infrastructure/config/i18n', () => mockI18n);

describe('useTranslationFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return translation function', () => {
    const { result } = renderHook(() => useTranslationFunction());
    
    expect(result.current).toHaveProperty('t');
    expect(result.current).toHaveProperty('clearCache');
    expect(typeof result.current.t).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
  });

  describe('translation function', () => {
    it('should return key when i18n not initialized', () => {
      mockI18n.isInitialized = false;
      
      const { result } = renderHook(() => useTranslationFunction());
      const translation = result.current.t('test.key');
      
      expect(translation).toBe('test.key');
    });

    it('should handle namespaced keys with colon', () => {
      mockI18n.isInitialized = true;
      mockI18n.t.mockReturnValue('Translated value');
      
      const { result } = renderHook(() => useTranslationFunction());
      const translation = result.current.t('namespace:key.subkey');
      
      expect(mockI18n.t).toHaveBeenCalledWith('namespace:key.subkey', {});
      expect(translation).toBe('Translated value');
    });

    it('should auto-detect namespace from dot notation', () => {
      mockI18n.isInitialized = true;
      mockI18n.hasResourceBundle.mockReturnValue(true);
      mockI18n.t.mockReturnValue('Auto-detected translation');
      
      const { result } = renderHook(() => useTranslationFunction());
      const translation = result.current.t('settings.appearance.title');
      
      expect(mockI18n.hasResourceBundle).toHaveBeenCalledWith('en-US', 'settings');
      expect(mockI18n.t).toHaveBeenCalledWith('settings:appearance.title', {});
      expect(translation).toBe('Auto-detected translation');
    });

    it('should fallback to original key when namespace not found', () => {
      mockI18n.isInitialized = true;
      mockI18n.hasResourceBundle.mockReturnValue(false);
      mockI18n.t.mockReturnValue('Original key translation');
      
      const { result } = renderHook(() => useTranslationFunction());
      const translation = result.current.t('settings.title');
      
      expect(mockI18n.hasResourceBundle).toHaveBeenCalledWith('en-US', 'settings');
      expect(mockI18n.t).toHaveBeenCalledWith('settings.title', {});
      expect(translation).toBe('Original key translation');
    });

    it('should handle translation options', () => {
      mockI18n.isInitialized = true;
      mockI18n.t.mockReturnValue('Translated with options');
      
      const { result } = renderHook(() => useTranslationFunction());
      const options = { count: 1, defaultValue: 'Default value' };
      const translation = result.current.t('test.key', options);
      
      expect(mockI18n.t).toHaveBeenCalledWith('test.key', options);
      expect(translation).toBe('Translated with options');
    });

    it('should use default value when provided and i18n not initialized', () => {
      mockI18n.isInitialized = false;
      
      const { result } = renderHook(() => useTranslationFunction());
      const options = { defaultValue: 'Default translation' };
      const translation = result.current.t('test.key', options);
      
      expect(translation).toBe('Default translation');
    });

    it('should cache translations', () => {
      mockI18n.isInitialized = true;
      mockI18n.t.mockReturnValue('Cached translation');
      
      const { result } = renderHook(() => useTranslationFunction());
      
      // First call
      const translation1 = result.current.t('test.key', { count: 1 });
      expect(mockI18n.t).toHaveBeenCalledTimes(1);
      
      // Second call with same key and options
      const translation2 = result.current.t('test.key', { count: 1 });
      expect(mockI18n.t).toHaveBeenCalledTimes(1); // Should not call again
      
      expect(translation1).toBe(translation2);
    });

    it('should handle non-string translations', () => {
      mockI18n.isInitialized = true;
      mockI18n.t.mockReturnValue(123);
      
      const { result } = renderHook(() => useTranslationFunction());
      const translation = result.current.t('test.key');
      
      expect(translation).toBe('123');
    });
  });

  describe('clearCache', () => {
    it('should clear translation cache', () => {
      mockI18n.isInitialized = true;
      mockI18n.t.mockReturnValue('Translation');
      
      const { result } = renderHook(() => useTranslationFunction());
      
      // Add to cache
      result.current.t('test.key');
      
      // Clear cache
      act(() => {
        result.current.clearCache();
      });
      
      // Should call i18n.t again after cache clear
      result.current.t('test.key');
      expect(mockI18n.t).toHaveBeenCalledTimes(2);
    });
  });
});