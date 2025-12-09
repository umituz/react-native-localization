/**
 * Translation Hook
 *
 * Provides translation function with proper fallbacks
 * - React i18next integration
 * - Direct i18n fallback
 * - Type-safe translation function
 * - Auto-namespace detection from dot notation
 */

import i18n from '../config/i18n';

/**
 * Hook for translation functionality
 * Supports both formats:
 * - t('namespace:key.subkey') - explicit namespace
 * - t('namespace.key.subkey') - auto-detected namespace (first segment before dot)
 */
export const useTranslationFunction = (): ((key: string, options?: any) => string) => {
  return (key: string, options?: any): string => {
    if (!i18n.isInitialized || typeof i18n.t !== 'function') {
      return key;
    }

    // If key already has namespace separator (:), use as-is
    if (key.includes(':')) {
      const result = i18n.t(key, options);
      return typeof result === 'string' ? result : String(result);
    }

    // Auto-detect namespace from first dot segment
    // e.g., 'settings.appearance.title' -> namespace: 'settings', key: 'appearance.title'
    const firstDotIndex = key.indexOf('.');
    if (firstDotIndex > 0) {
      const potentialNamespace = key.substring(0, firstDotIndex);
      const restOfKey = key.substring(firstDotIndex + 1);

      // Check if this namespace exists in i18n resources
      const hasNamespace = i18n.hasResourceBundle(i18n.language, potentialNamespace);

      if (hasNamespace) {
        const namespacedKey = `${potentialNamespace}:${restOfKey}`;
        const result = i18n.t(namespacedKey, options);
        // If translation found (not same as key), return it
        if (result !== namespacedKey && result !== restOfKey) {
          return typeof result === 'string' ? result : String(result);
        }
      }
    }

    // Fallback: try original key as-is
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : String(result);
  };
};
