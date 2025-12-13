/**
 * Translation Hook
 *
 * Provides translation function with proper fallbacks and performance optimization
 * - React i18next integration
 * - Memoized translation function
 * - Type-safe translation function
 * - Auto-namespace detection from dot notation
 * - Performance optimizations
 */

import { useCallback, useMemo } from 'react';
import i18n from '../config/i18n';
import { translationCache } from '../config/TranslationCache';

export interface TranslationOptions {
  count?: number;
  ns?: string | string[];
  defaultValue?: string;
  [key: string]: any;
}


/**
 * Hook for translation functionality
 * Supports both formats:
 * - t('namespace:key.subkey') - explicit namespace
 * - t('namespace.key.subkey') - auto-detected namespace (first segment before dot)
 */
export const useTranslationFunction = () => {
  const isInitialized = useMemo(() => i18n.isInitialized, []);

  const translate = useCallback((key: string, options: TranslationOptions = {}): string => {
    if (!isInitialized || typeof i18n.t !== 'function') {
      if (__DEV__) {
        console.warn(`[Localization] i18n not initialized, returning key: ${key}`);
      }
      return options.defaultValue || key;
    }

    // Create cache key
    const cacheKey = `${key}:${JSON.stringify(options)}`;

    // Check cache first
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let result: string;

    // If key already has namespace separator (:), use as-is
    if (key.includes(':')) {
      const tempResult = i18n.t(key, options);
      result = typeof tempResult === 'string' ? tempResult : key;
    } else {
      // Auto-detect namespace from first dot segment
      const firstDotIndex = key.indexOf('.');
      if (firstDotIndex > 0) {
        const potentialNamespace = key.substring(0, firstDotIndex);
        const restOfKey = key.substring(firstDotIndex + 1);

        // Check if this namespace exists in i18n resources
        const hasNamespace = i18n.hasResourceBundle(i18n.language, potentialNamespace);

        if (hasNamespace) {
          const namespacedKey = `${potentialNamespace}:${restOfKey}`;
          const namespacedResult = i18n.t(namespacedKey, options);

          // If translation found (not same as key), use it
          if (namespacedResult !== namespacedKey && namespacedResult !== restOfKey) {
            result = typeof namespacedResult === 'string' ? namespacedResult : key;
          } else {
            // Fallback to original key
            const fallbackResult = i18n.t(key, options);
            result = typeof fallbackResult === 'string' ? fallbackResult : key;
          }
        } else {
          // Fallback to original key
          const tempResult = i18n.t(key, options);
          result = typeof tempResult === 'string' ? tempResult : key;
        }
      } else {
        // No dot, use as-is
        const noDotResult = i18n.t(key, options);
        result = typeof noDotResult === 'string' ? noDotResult : key;
      }
    }

    // Convert to string and cache
    const finalResult: string = typeof result === 'string' ? result : key;
    translationCache.set(cacheKey, finalResult);

    return finalResult;
  }, [isInitialized]);

  // Clear cache when language changes
  const clearCache = useCallback(() => {
    translationCache.clear();
    if (__DEV__) {
      console.log('[Localization] Translation cache cleared');
    }
  }, []);

  return {
    t: translate,
    clearCache,
  };
};