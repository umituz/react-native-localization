/**
 * Simple tests for useTranslation hook
 */

import { useTranslationFunction } from '../useTranslation';

// Mock React hooks
jest.mock('react', () => ({
  useMemo: jest.fn((fn) => fn()),
  useCallback: jest.fn((fn) => fn),
}));

// Mock i18next
jest.mock('../../config/i18n', () => ({
  isInitialized: true,
  t: jest.fn((key) => key),
  hasResourceBundle: jest.fn(() => false),
  language: 'en-US',
}));

describe('useTranslationFunction', () => {
  it('should return translation function', () => {
    const { t, clearCache } = useTranslationFunction();
    
    expect(typeof t).toBe('function');
    expect(typeof clearCache).toBe('function');
  });

  it('should return key when translation not found', () => {
    const { t } = useTranslationFunction();
    const result = t('test.key');
    
    expect(result).toBe('test.key');
  });

  it('should handle translation options', () => {
    const { t } = useTranslationFunction();
    const result = t('test.key', { count: 1 });
    
    expect(typeof result).toBe('string');
  });

  it('should clear cache', () => {
    const { t, clearCache } = useTranslationFunction();
    
    // Add to cache
    t('test.key');
    
    // Clear cache
    expect(() => clearCache()).not.toThrow();
  });
});