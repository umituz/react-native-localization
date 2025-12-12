/**
 * Supported Languages Configuration
 * Complete list of 29 languages supported by the app
 *
 * SINGLE SOURCE OF TRUTH: Imports from constants/languages.ts
 * - All language definitions come from one central location
 * - Ensures consistency across app.json, i18n config, and UI
 * - Automatic synchronization between all language configurations
 *
 * DEVICE LOCALE DETECTION:
 * - First launch: Automatically detects device locale
 * - Fallback: English (en-US) if device locale not supported
 * - User choice: Persists after manual language selection
 */

import * as Localization from 'expo-localization';
import { LANGUAGES as LANGUAGES_DATA } from './languagesData';
import type { Language } from '../storage/types/LocalizationState';

// Single source of truth for supported languages
export const SUPPORTED_LANGUAGES: Language[] = LANGUAGES_DATA;

// Export LANGUAGES as alias for SUPPORTED_LANGUAGES for backward compatibility
export const LANGUAGES = SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE = 'en-US';

/**
 * Locale mapping for device locales to supported app locales
 * Maps short codes and regional variants to en-US
 *
 * SIMPLE MAPPING:
 * - All variants map to en-US (only supported language)
 */
const LOCALE_MAPPING: Record<string, string> = {
  // English variants map to en-US
  'en': 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-US',
  'en-AU': 'en-US',
  'en-CA': 'en-US',
  'en-NZ': 'en-US',
  'en-IE': 'en-US',
  'en-ZA': 'en-US',
  'en-SG': 'en-US',
  'en-IN': 'en-US',

  // Portuguese mappings
  'pt': 'pt-PT', // Default to European Portuguese if ambiguous, or use pt-BR if preferred.
  'pt-BR': 'pt-BR', // Now natively supported
  'pt-PT': 'pt-PT',

  // Spanish variants
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'es-MX': 'es-ES', // Fallback to ES until MX is explicitly added
  'es-AR': 'es-ES',
  'es-US': 'es-ES', // Common in US

  // French variants
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'fr-CA': 'fr-FR', // Fallback to FR until CA is explicitly added
  'fr-BE': 'fr-FR',
  'fr-CH': 'fr-FR',

  // Norwegian (Bokmål to no-NO)
  'no': 'no-NO',
  'nb': 'no-NO',
  'nn': 'no-NO', // Nynorsk fallback

  // Chinese variants
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hans-CN': 'zh-CN',
  'zh-Hant': 'zh-TW', // Map Traditional to zh-TW
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW', // Map HK to TW for Traditional

  // Others
  'ar': 'ar-SA',
  'bg': 'bg-BG',
  'cs': 'cs-CZ',
  'da': 'da-DK',
  'de': 'de-DE',
  'el': 'el-GR', // Greek
  'fi': 'fi-FI',
  'hi': 'hi-IN',
  'hr': 'hr-HR', // Croatian
  'hu': 'hu-HU',
  'id': 'id-ID',
  'it': 'it-IT',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'ms': 'ms-MY',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'ro': 'ro-RO',
  'ru': 'ru-RU',
  'sk': 'sk-SK', // Slovak
  'sv': 'sv-SE',
  'th': 'th-TH',
  'tr': 'tr-TR',
  'uk': 'uk-UA',
  'vi': 'vi-VN',
};

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

export const isLanguageSupported = (code: string): boolean => {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
};

export const getDefaultLanguage = (): Language => {
  return SUPPORTED_LANGUAGES[0]; // en-US
};

/**
 * Get device locale and map it to supported language
 * Called ONLY on first launch (when no saved language preference exists)
 *
 * @returns Supported language code or DEFAULT_LANGUAGE
 *
 * Examples:
 * - Device: "en" → Returns: "en-US"
 * - Device: "en-GB" → Returns: "en-US"
 * - Device: "tr" → Returns: "tr-TR" (if supported)
 * - Device: "de" → Returns: "en-US" (not supported, fallback)
 */
export const getDeviceLocale = (): string => {
  try {
    // Get device locale (e.g., "en-US", "tr-TR", or just "en")
    const deviceLocale = Localization.locale;

    if (!deviceLocale) {
      return DEFAULT_LANGUAGE;
    }

    // Check if exact match exists in LOCALE_MAPPING
    if (LOCALE_MAPPING[deviceLocale]) {
      return LOCALE_MAPPING[deviceLocale];
    }

    // Extract language code (e.g., "en" from "en-US")
    const languageCode = deviceLocale.split('-')[0];

    // Check if language code exists in LOCALE_MAPPING
    if (LOCALE_MAPPING[languageCode]) {
      return LOCALE_MAPPING[languageCode];
    }

    // Check if device locale is directly supported
    if (isLanguageSupported(deviceLocale)) {
      return deviceLocale;
    }

    // Fallback to default language
    return DEFAULT_LANGUAGE;
  } catch (error) {
    // If any error occurs, fallback to default
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Search languages by name or native name
 */
export const searchLanguages = (query: string): Language[] => {
  const lowerQuery = query.toLowerCase();
  return SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(lowerQuery) ||
      lang.nativeName.toLowerCase().includes(lowerQuery)
  );
};
