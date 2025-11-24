/**
 * Translation Hook
 *
 * Provides translation function with proper fallbacks
 * - React i18next integration
 * - Direct i18n fallback
 * - Type-safe translation function
 */

import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';

/**
 * Hook for translation functionality
 */
export const useTranslationFunction = (): ((key: string, options?: any) => string) => {
  // Always call useTranslation hook (React hooks rules)
  const translationResult = useTranslation(undefined, { i18n });

  // Use react-i18next if available, otherwise fallback to direct i18n
  if (translationResult?.t && typeof translationResult.t === 'function' && i18n.isInitialized) {
    return (key: string, options?: any): string => {
      const result = translationResult.t(key, options);
      return typeof result === 'string' ? result : String(result);
    };
  } else {
    return (key: string, options?: any): string => {
      // Fallback to direct i18n.t
      if (i18n.isInitialized && typeof i18n.t === 'function') {
        const result = i18n.t(key, options);
        return typeof result === 'string' ? result : String(result);
      }
      // Final fallback: return key
      return key;
    };
  }
};
