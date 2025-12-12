/**
 * Translation Cache Tests
 */

import { TranslationCache } from '../TranslationCache';

describe('TranslationCache', () => {
  let cache: TranslationCache;

  beforeEach(() => {
    cache = new TranslationCache();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should clear all values', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should limit cache size to maxSize', () => {
    // Create a small cache for testing
    const smallCache = new TranslationCache();
    (smallCache as any).maxSize = 2;

    smallCache.set('key1', 'value1');
    smallCache.set('key2', 'value2');
    smallCache.set('key3', 'value3'); // Should remove key1

    expect(smallCache.get('key1')).toBeUndefined();
    expect(smallCache.get('key2')).toBe('value2');
    expect(smallCache.get('key3')).toBe('value3');
  });
});