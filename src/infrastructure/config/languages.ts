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
  // All English variants map to en-US
  'en': 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-US',
  'en-AU': 'en-US',
  'en-CA': 'en-US',
  'en-NZ': 'en-US',
  'en-IE': 'en-US',
  'en-ZA': 'en-US',

  // All other languages map to en-US (fallback)
  'ar': 'en-US',
  'ar-SA': 'en-US',
  'ar-AE': 'en-US',
  'ar-EG': 'en-US',
  'bg': 'en-US',
  'bg-BG': 'en-US',
  'cs': 'en-US',
  'cs-CZ': 'en-US',
  'da': 'en-US',
  'da-DK': 'en-US',
  'de': 'en-US',
  'de-DE': 'en-US',
  'de-AT': 'en-US',
  'de-CH': 'en-US',
  'el': 'en-US',
  'es': 'en-US',
  'es-ES': 'en-US',
  'es-MX': 'en-US',
  'es-AR': 'en-US',
  'fi': 'en-US',
  'fi-FI': 'en-US',
  'fr': 'en-US',
  'fr-FR': 'en-US',
  'fr-CA': 'en-US',
  'fr-BE': 'en-US',
  'fr-CH': 'en-US',
  'hi': 'en-US',
  'hi-IN': 'en-US',
  'hr': 'en-US',
  'hu': 'en-US',
  'hu-HU': 'en-US',
  'id': 'en-US',
  'id-ID': 'en-US',
  'it': 'en-US',
  'it-IT': 'en-US',
  'ja': 'en-US',
  'ja-JP': 'en-US',
  'ko': 'en-US',
  'ko-KR': 'en-US',
  'ms': 'en-US',
  'ms-MY': 'en-US',
  'nb': 'en-US',
  'no': 'en-US',
  'no-NO': 'en-US',
  'nl': 'en-US',
  'nl-NL': 'en-US',
  'nl-BE': 'en-US',
  'pl': 'en-US',
  'pl-PL': 'en-US',
  'pt': 'en-US',
  'pt-PT': 'en-US',
  'pt-BR': 'en-US',
  'ro': 'en-US',
  'ro-RO': 'en-US',
  'ru': 'en-US',
  'ru-RU': 'en-US',
  'sk': 'en-US',
  'sv': 'en-US',
  'sv-SE': 'en-US',
  'th': 'en-US',
  'th-TH': 'en-US',
  'tl': 'en-US',
  'tl-PH': 'en-US',
  'fil': 'en-US',
  'tr': 'en-US',
  'tr-TR': 'en-US',
  'uk': 'en-US',
  'uk-UA': 'en-US',
  'vi': 'en-US',
  'vi-VN': 'en-US',
  'zh': 'en-US',
  'zh-CN': 'en-US',
  'zh-Hans': 'en-US',
  'zh-Hans-CN': 'en-US',
  'zh-Hant': 'en-US',
  'zh-TW': 'en-US',
  'zh-HK': 'en-US',
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
