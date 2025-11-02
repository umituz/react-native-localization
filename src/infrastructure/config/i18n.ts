/**
 * i18next Configuration
 * Nested translation structure - common translations spread, domain translations nested
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';

/**
 * Import all translations from modular folder structure
 * Each locale has an index.ts that merges all JSON files
 *
 * Structure (OFFLINE-ONLY):
 * locales/
 *   en-US/  (universal translations in localization domain)
 *     index.ts (merges common.json, navigation.json, settings.json, onboarding.json, errors.json)
 *
 * All translations are offline-compatible and work without backend.
 */

// Import universal translations from localization domain
import localizationEnUS from '../locales/en-US';

/**
 * Translation Resources
 * Nested structure - domain-based organization with direct key access
 * Example: settings.theme.title, onboarding.welcome.title
 */
const resources = {
  'en-US': {
    translation: {
      ...localizationEnUS,
    },
  },
};

/**
 * Initialize i18next
 */
i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  react: {
    useSuspense: false, // Disable suspense for React Native
  },

  compatibilityJSON: 'v4', // Use i18next v4 JSON format
});

export default i18n;
