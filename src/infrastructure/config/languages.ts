/**
 * Languages Configuration - Main Export
 * Central export point for all language-related functionality
 */

import { languageRepository } from '../repository/LanguageRepository';
import type { Language } from '../storage/types/Language';

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
export const getSUPPORTED_LANGUAGES = () => languageRepository.getLanguages();
export const getLANGUAGES = () => languageRepository.getLanguages();
export const SUPPORTED_LANGUAGES: Language[] = languageRepository.getLanguages();
export const LANGUAGES = SUPPORTED_LANGUAGES;
