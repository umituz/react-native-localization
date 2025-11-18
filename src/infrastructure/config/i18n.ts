/**
 * i18next Configuration for English-only
 * Simple translation structure - only en-US supported
 *
 * SINGLE LANGUAGE LOADING:
 * - Only loads en-US translations
 * - Project translations merged with package defaults
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';

/**
 * Load en-US package translations
 */
const loadPackageTranslations = (): Record<string, any> => {
  try {
    // Load only en-US translations
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const translations = require('../locales/en-US');
    return { 'en-US': translations.default || translations };
  } catch (error) {
    // Fallback to empty translations
    return { 'en-US': {} };
  }
};

const packageTranslations = loadPackageTranslations();

/**
 * Try to load project-specific en-US translations
 * Metro bundler will resolve these at build time if they exist
 * If they don't exist, the require will fail gracefully
 */
let projectTranslations: Record<string, any> = {};

// Try to load project translations from common paths
try {
  // Try DDD structure path
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const translations = require('../../../../../../src/domains/localization/infrastructure/locales/en-US');
  projectTranslations['en-US'] = translations.default || translations;
} catch (e1) {
  try {
    // Try alternative DDD structure path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const translations = require('../../../../../../domains/localization/infrastructure/locales/en-US');
    projectTranslations['en-US'] = translations.default || translations;
  } catch (e2) {
    try {
      // Try simple structure path
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const translations = require('../../../../../../src/locales/en-US');
      projectTranslations['en-US'] = translations.default || translations;
    } catch (e3) {
      // No project translations found - this is OK, use package defaults only
    }
  }
}

/**
 * Translation Resources
 * Merge package defaults with project-specific translations
 * Project translations override package defaults (deep merge)
 */
const mergeTranslations = (packageTranslations: any, projectTranslations: any): any => {
  if (!projectTranslations || Object.keys(projectTranslations).length === 0) {
    return packageTranslations;
  }

  // Deep merge: project translations override package defaults
  const merged = { ...packageTranslations };
  
  for (const key in projectTranslations) {
    if (projectTranslations.hasOwnProperty(key)) {
      if (
        typeof projectTranslations[key] === 'object' &&
        projectTranslations[key] !== null &&
        !Array.isArray(projectTranslations[key]) &&
        typeof packageTranslations[key] === 'object' &&
        packageTranslations[key] !== null &&
        !Array.isArray(packageTranslations[key])
      ) {
        // Deep merge nested objects
        merged[key] = mergeTranslations(packageTranslations[key], projectTranslations[key]);
      } else {
        // Override with project translation
        merged[key] = projectTranslations[key];
      }
    }
  }
  
  return merged;
};

/**
 * Build resources object for en-US only
 */
const buildResources = (): Record<string, { translation: any }> => {
  const packageTranslation = packageTranslations['en-US'] || {};
  const projectTranslation = projectTranslations['en-US'] || {};

  return {
    'en-US': {
      translation: mergeTranslations(packageTranslation, projectTranslation),
    },
  };
};

const resources = buildResources();

// Debug: Log loaded resources in development (only once to prevent spam)
if (typeof globalThis !== 'undefined' && !(globalThis as any).__i18n_resources_logged) {
  /* eslint-disable-next-line no-console */
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('🌍 i18n Resources loaded:', {
      languages: Object.keys(resources),
      enUSKeys: resources['en-US']?.translation ? Object.keys(resources['en-US'].translation) : [],
    });
    (globalThis as any).__i18n_resources_logged = true;
  }
}

// Global flag to ensure initReactI18next is only used once
let reactI18nextInitialized = false;

/**
 * Initialize i18next
 * CRITICAL: Check i18n.isInitialized to prevent multiple initializations
 * This prevents "i18next is already initialized" warnings when module is imported multiple times
 */
const initializeI18n = () => {
  // CRITICAL: Check if i18n is already initialized (prevents multiple init calls)
  if (i18n.isInitialized) {
    return;
  }

  try {
    // Check if initReactI18next is available
    if (!initReactI18next) {
      throw new Error('initReactI18next is undefined');
    }
    
    // CRITICAL: Only use initReactI18next once (prevents context registration issues)
    if (!reactI18nextInitialized) {
      i18n.use(initReactI18next);
      reactI18nextInitialized = true;
    }
    
    i18n.init({
      resources,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,

      interpolation: {
        escapeValue: false, // React already escapes values
      },

      react: {
        useSuspense: false, // Disable suspense for React Native
      },

      compatibilityJSON: 'v3', // Use v3 format for React Native (no Intl.PluralRules support)
      pluralSeparator: '_', // Use underscore separator for plural keys
      keySeparator: '.', // Use dot separator for nested keys
      
      // Debug options
      debug: typeof __DEV__ !== 'undefined' && __DEV__,
    });
    
    // Debug: Verify initialization
    /* eslint-disable-next-line no-console */
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log('✅ i18n initialized:', {
        language: i18n.language,
        hasResource: !!i18n.getResourceBundle(i18n.language, 'translation'),
      });
    }
  } catch (error) {
    /* eslint-disable-next-line no-console */
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('❌ i18n initialization error:', error);
    }
    // Don't throw - allow app to continue without i18n
  }
};

// Initialize immediately - no need to defer
// React Native and React are ready when this module loads
// Deferring causes race conditions with useTranslation hook
// CRITICAL: i18n.isInitialized check prevents multiple initializations
initializeI18n();

export default i18n;
