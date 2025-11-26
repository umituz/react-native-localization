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
  // Use direct i18n.t for reliability (no React context issues)
  return (key: string, options?: any): string => {
    if (i18n.isInitialized && typeof i18n.t === 'function') {
      const result = i18n.t(key, options);
      return typeof result === 'string' ? result : String(result);
    }
    // Final fallback: return key
    return key;
  };
};
