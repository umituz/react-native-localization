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
 * Deferred initialization to avoid React Native renderer conflicts
 */
let isInitialized = false;

const initializeI18n = () => {
  if (isInitialized) return;

  try {
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.log('[i18n] Initializing i18next...');
    
    // Check if initReactI18next is available
    if (!initReactI18next) {
      throw new Error('initReactI18next is undefined');
    }
    
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.log('[i18n] initReactI18next found, initializing...');
    
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
    
    isInitialized = true;
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.log('[i18n] i18next initialized successfully');
  } catch (error) {
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.error('[i18n] Initialization error:', error);
    // Don't throw - allow app to continue without i18n
    /* eslint-disable-next-line no-console */
    if (__DEV__) console.warn('[i18n] Continuing without i18n initialization');
  }
};

// Defer initialization until React is ready
// React Native doesn't have window, so we check for global
if (typeof global !== 'undefined') {
  // Use setTimeout to defer initialization
  setTimeout(() => {
    initializeI18n();
  }, 0);
} else {
  // Fallback: initialize immediately
  initializeI18n();
}

export default i18n;
