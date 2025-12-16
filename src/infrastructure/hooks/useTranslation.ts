/**
 * Translation Hook
 *
 * Provides translation function with proper language change reactivity
 * - React i18next integration for automatic language change detection
 * - Auto-namespace detection from dot notation
 * - Type-safe translation function
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';

export interface TranslationOptions {
  count?: number;
  ns?: string | string[];
  defaultValue?: string;
  [key: string]: unknown;
}

/**
 * Hook for translation functionality
 * Uses react-i18next for automatic language change reactivity
 *
 * Supports both formats:
 * - t('namespace:key.subkey') - explicit namespace
 * - t('namespace.key.subkey') - auto-detected namespace (first segment before dot)
 */
export const useTranslationFunction = () => {
  const { t: i18nextT, ready } = useTranslation(undefined, { i18n });

  const translate = useCallback((key: string, defaultValueOrOptions?: string | TranslationOptions): string => {
    const options: TranslationOptions = typeof defaultValueOrOptions === 'string'
      ? { defaultValue: defaultValueOrOptions }
      : defaultValueOrOptions || {};

    if (!ready || !i18n.isInitialized) {
      return options.defaultValue || key;
    }

    // If key already has namespace separator (:), use as-is
    if (key.includes(':')) {
      const result = i18nextT(key, options);
      return typeof result === 'string' ? result : key;
    }

    // Auto-detect namespace from first dot segment
    const firstDotIndex = key.indexOf('.');
    if (firstDotIndex > 0) {
      const potentialNamespace = key.substring(0, firstDotIndex);
      const restOfKey = key.substring(firstDotIndex + 1);
      const hasNamespace = i18n.hasResourceBundle(i18n.language, potentialNamespace);

      if (hasNamespace) {
        const namespacedKey = `${potentialNamespace}:${restOfKey}`;
        const namespacedResult = i18nextT(namespacedKey, options);

        if (namespacedResult !== namespacedKey && namespacedResult !== restOfKey) {
          return typeof namespacedResult === 'string' ? namespacedResult : key;
        }
      }
    }

    // Fallback to original key
    const result = i18nextT(key, options);
    return typeof result === 'string' ? result : key;
  }, [i18nextT, ready]);

  return {
    t: translate,
  };
};