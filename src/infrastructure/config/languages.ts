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
import { LANGUAGES } from './languagesData';
import { Language } from '../../domain/repositories/ILocalizationRepository';

// Single source of truth for supported languages
export const SUPPORTED_LANGUAGES: Language[] = LANGUAGES;

export const DEFAULT_LANGUAGE = 'en-US';

/**
 * Locale mapping for device locales to supported app locales
 * Maps short codes (e.g., "en") and iOS variants (e.g., "en-GB", "zh-Hans") to our supported locales
 *
 * COMPREHENSIVE MAPPING:
 * - Short codes (ar, bg, cs, da, de, etc.) → Full locale codes (ar-SA, bg-BG, etc.)
 * - iOS regional variants → Our standard locales
 * - All 29 supported languages included
 */
const LOCALE_MAPPING: Record<string, string> = {
  // Arabic
  'ar': 'ar-SA',
  'ar-SA': 'ar-SA',
  'ar-AE': 'ar-SA',
  'ar-EG': 'ar-SA',

  // Bulgarian
  'bg': 'bg-BG',
  'bg-BG': 'bg-BG',

  // Czech
  'cs': 'cs-CZ',
  'cs-CZ': 'cs-CZ',

  // Danish
  'da': 'da-DK',
  'da-DK': 'da-DK',

  // German
  'de': 'de-DE',
  'de-DE': 'de-DE',
  'de-AT': 'de-DE',
  'de-CH': 'de-DE',

  // Greek (iOS has el, we map to en-US fallback since we don't support Greek)
  'el': 'en-US',

  // English variants
  'en': 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-US',
  'en-AU': 'en-US',
  'en-CA': 'en-US',
  'en-NZ': 'en-US',
  'en-IE': 'en-US',
  'en-ZA': 'en-US',

  // Spanish
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'es-MX': 'es-ES',
  'es-AR': 'es-ES',

  // Finnish
  'fi': 'fi-FI',
  'fi-FI': 'fi-FI',

  // French
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'fr-CA': 'fr-FR',
  'fr-BE': 'fr-FR',
  'fr-CH': 'fr-FR',

  // Hindi
  'hi': 'hi-IN',
  'hi-IN': 'hi-IN',

  // Croatian (iOS has hr, we map to en-US fallback since we don't support Croatian)
  'hr': 'en-US',

  // Hungarian
  'hu': 'hu-HU',
  'hu-HU': 'hu-HU',

  // Indonesian
  'id': 'id-ID',
  'id-ID': 'id-ID',

  // Italian
  'it': 'it-IT',
  'it-IT': 'it-IT',

  // Japanese
  'ja': 'ja-JP',
  'ja-JP': 'ja-JP',

  // Korean
  'ko': 'ko-KR',
  'ko-KR': 'ko-KR',

  // Malay
  'ms': 'ms-MY',
  'ms-MY': 'ms-MY',

  // Norwegian (iOS uses nb for Norwegian Bokmål)
  'nb': 'no-NO',
  'no': 'no-NO',
  'no-NO': 'no-NO',

  // Dutch
  'nl': 'nl-NL',
  'nl-NL': 'nl-NL',
  'nl-BE': 'nl-NL',

  // Polish
  'pl': 'pl-PL',
  'pl-PL': 'pl-PL',

  // Portuguese
  'pt': 'pt-PT',
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-PT',

  // Romanian
  'ro': 'ro-RO',
  'ro-RO': 'ro-RO',

  // Russian
  'ru': 'ru-RU',
  'ru-RU': 'ru-RU',

  // Slovak (iOS has sk, we map to en-US fallback since we don't support Slovak)
  'sk': 'en-US',

  // Swedish
  'sv': 'sv-SE',
  'sv-SE': 'sv-SE',

  // Thai
  'th': 'th-TH',
  'th-TH': 'th-TH',

  // Filipino/Tagalog
  'tl': 'tl-PH',
  'tl-PH': 'tl-PH',
  'fil': 'tl-PH',

  // Turkish
  'tr': 'tr-TR',
  'tr-TR': 'tr-TR',

  // Ukrainian
  'uk': 'uk-UA',
  'uk-UA': 'uk-UA',

  // Vietnamese
  'vi': 'vi-VN',
  'vi-VN': 'vi-VN',

  // Chinese Simplified (iOS uses zh-Hans)
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-Hans-CN': 'zh-CN',

  // Chinese Traditional (iOS uses zh-Hant, we map to zh-CN since we only support Simplified)
  'zh-Hant': 'zh-CN',
  'zh-TW': 'zh-CN',
  'zh-HK': 'zh-CN',
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
    console.warn('[Localization] Failed to detect device locale:', error);
    return DEFAULT_LANGUAGE;
  }
};
