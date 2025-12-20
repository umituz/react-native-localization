/**
 * Languages Configuration - Main Export
 * Central export point for all language-related functionality
 */

import { languageRegistry } from './languagesData';
import type { Language } from '../storage/types/LocalizationState';

// Re-export from DeviceLocale
export { DEFAULT_LANGUAGE, getDeviceLocale } from './DeviceLocale';

// Re-export from LanguageQuery
export {
  getSupportedLanguages,
  getLanguageByCode,
  isLanguageSupported,
  getDefaultLanguage,
  searchLanguages,
} from './LanguageQuery';

// Re-export from LocaleMapping
export { LOCALE_MAPPING } from './LocaleMapping';

// Backward compatibility
export const getSUPPORTED_LANGUAGES = () => languageRegistry.getLanguages();
export const getLANGUAGES = () => languageRegistry.getLanguages();
export const SUPPORTED_LANGUAGES: Language[] = languageRegistry.getLanguages();
export const LANGUAGES = SUPPORTED_LANGUAGES;
