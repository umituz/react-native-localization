/**
 * i18next Configuration for Multi-language Support
 * Loads all supported languages from project translations
 *
 * MULTI-LANGUAGE LOADING:
 * - Loads all languages from project translations
 * - Project translations merged with package defaults
 * - Metro bundler resolves all requires at build time
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages';

/**
 * Load package translations (en-US only)
 */
const loadPackageTranslations = (): Record<string, any> => {
  try {
    // Load en-US package translations
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
 * Load project translations for all supported languages
 * Uses filesystem package for dynamic module loading
 */
const loadProjectTranslations = (): Record<string, any> => {
  const translations: Record<string, any> = {};

  // Try to load translations using filesystem package utilities
  // This allows dynamic loading without hardcoded paths
  try {
    // Dynamic loading through filesystem package
    const { loadJsonModules } = require('@umituz/react-native-filesystem');

    // Try to load each language dynamically
    const supportedLanguages = [
      'en-US', 'ar-SA', 'bg-BG', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR',
      'en-AU', 'en-CA', 'en-GB', 'es-ES', 'es-MX', 'fi-FI', 'fr-CA',
      'fr-FR', 'hi-IN', 'hr-HR', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP',
      'ko-KR', 'ms-MY', 'nl-NL', 'no-NO', 'pl-PL', 'pt-BR', 'pt-PT',
      'ro-RO', 'ru-RU', 'sk-SK', 'sv-SE', 'th-TH', 'tl-PH', 'tr-TR',
      'uk-UA', 'vi-VN', 'zh-CN', 'zh-TW'
    ];

    for (const langCode of supportedLanguages) {
      try {
        // Attempt to load language module dynamically
        // This will work if the project has set up locales properly
        const langModule = require(`../../../../../../src/locales/${langCode}`);
        if (langModule?.default || langModule) {
          translations[langCode] = langModule.default || langModule;
        }
      } catch {
        // Language not available - skip silently
      }
    }
  } catch (error) {
    // Filesystem package not available or dynamic loading failed
    // Fallback to no project translations
  }

  return translations;
};

const projectTranslations = loadProjectTranslations();

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
 * Build resources object for all supported languages
 */
const buildResources = (): Record<string, { translation: any }> => {
  const resources: Record<string, { translation: any }> = {};
  
  // Build resources for each supported language
  for (const lang of SUPPORTED_LANGUAGES) {
    const langCode = lang.code;
    const packageTranslation = langCode === 'en-US' ? (packageTranslations['en-US'] || {}) : {};
    const projectTranslation = projectTranslations[langCode] || {};
    
    // For en-US, merge package and project translations
    // For other languages, use project translations only (fallback to en-US handled by i18n)
    if (langCode === 'en-US') {
      resources[langCode] = {
        translation: mergeTranslations(packageTranslation, projectTranslation),
      };
    } else if (projectTranslation && Object.keys(projectTranslation).length > 0) {
      resources[langCode] = {
        translation: projectTranslation,
      };
    }
  }
  
  // Ensure en-US is always present
  if (!resources['en-US']) {
    resources['en-US'] = {
      translation: packageTranslations['en-US'] || {},
    };
  }
  
  return resources;
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
