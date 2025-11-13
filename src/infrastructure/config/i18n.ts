/**
 * i18next Configuration
 * Nested translation structure - common translations spread, domain translations nested
 *
 * AUTOMATIC LANGUAGE LOADING:
 * - Uses require.context to auto-discover all language directories
 * - No manual imports needed - all languages loaded automatically
 * - Project translations merged with package defaults
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';

/**
 * AUTOMATIC LANGUAGE LOADING
 * 
 * Uses Metro bundler's require.context to automatically discover and load
 * all language directories. No manual imports needed!
 * 
 * Structure:
 * locales/
 *   ar-SA/index.ts
 *   bg-BG/index.ts
 *   en-US/index.ts
 *   ... (all languages auto-discovered)
 */

// Auto-load all package locale directories using require.context
// This automatically discovers all language folders (ar-SA, bg-BG, en-US, etc.)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageLocalesContext = (require as any).context('../locales', true, /\/index\.ts$/);

/**
 * Load all package translations automatically
 * Extracts language code from path (e.g., './ar-SA/index.ts' -> 'ar-SA')
 */
const loadPackageTranslations = (): Record<string, any> => {
  const packageTranslations: Record<string, any> = {};
  
  packageLocalesContext.keys().forEach((key: string) => {
    // Extract language code from path: './ar-SA/index.ts' -> 'ar-SA'
    const match = key.match(/\.\/([^/]+)\/index\.ts$/);
    if (match) {
      const languageCode = match[1];
      try {
        const translations = packageLocalesContext(key);
        packageTranslations[languageCode] = translations.default || translations;
      } catch (error) {
        // Ignore individual language loading errors
      }
    }
  });
  
  return packageTranslations;
};

const packageTranslations = loadPackageTranslations();

/**
 * Try to load project-specific translations
 * Metro bundler will resolve these at build time if they exist
 * If they don't exist, the require will fail gracefully
 */
let projectTranslations: Record<string, any> = {};

// Try to load project translations from common paths
// Metro bundler will include these if they exist at build time
try {
  // Try DDD structure path with require.context for automatic discovery
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const projectLocalesContext = (require as any).context('../../../../../../src/domains/localization/infrastructure/locales', true, /\/index\.ts$/);
  
  projectLocalesContext.keys().forEach((key: string) => {
    const match = key.match(/\.\/([^/]+)\/index\.ts$/);
    if (match) {
      const languageCode = match[1];
      try {
        const translations = projectLocalesContext(key);
        if (!projectTranslations[languageCode]) {
          projectTranslations[languageCode] = {};
        }
        projectTranslations[languageCode] = translations.default || translations;
      } catch (error) {
        // Ignore individual language loading errors
      }
    }
  });
} catch (e1) {
  try {
    // Try alternative DDD structure path
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const projectLocalesContext = (require as any).context('../../../../../../domains/localization/infrastructure/locales', true, /\/index\.ts$/);
    
    projectLocalesContext.keys().forEach((key: string) => {
      const match = key.match(/\.\/([^/]+)\/index\.ts$/);
      if (match) {
        const languageCode = match[1];
        try {
          const translations = projectLocalesContext(key);
          if (!projectTranslations[languageCode]) {
            projectTranslations[languageCode] = {};
          }
          projectTranslations[languageCode] = translations.default || translations;
        } catch (error) {
          // Ignore individual language errors
        }
      }
    });
  } catch (e2) {
    try {
      // Try simple structure path
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const projectLocalesContext = (require as any).context('../../../../../../src/locales', true, /\/index\.ts$/);
      
      projectLocalesContext.keys().forEach((key: string) => {
        const match = key.match(/\.\/([^/]+)\/index\.ts$/);
        if (match) {
          const languageCode = match[1];
          try {
            const translations = projectLocalesContext(key);
            if (!projectTranslations[languageCode]) {
              projectTranslations[languageCode] = {};
            }
            projectTranslations[languageCode] = translations.default || translations;
          } catch (error) {
            // Ignore individual language errors
          }
        }
      });
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
 * Build resources object for all languages
 * Automatically includes all package languages + project languages
 */
const buildResources = (): Record<string, { translation: any }> => {
  const resources: Record<string, { translation: any }> = {};
  
  // Get all unique language codes from both package and project translations
  const allLanguageCodes = new Set([
    ...Object.keys(packageTranslations),
    ...Object.keys(projectTranslations),
  ]);
  
  // Build resources for each language
  allLanguageCodes.forEach((languageCode) => {
    const packageTranslation = packageTranslations[languageCode] || {};
    const projectTranslation = projectTranslations[languageCode] || {};
    
    resources[languageCode] = {
      translation: mergeTranslations(packageTranslation, projectTranslation),
    };
  });
  
  return resources;
};

const resources = buildResources();

// Debug: Log loaded resources in development (only once to prevent spam)
// Use global flag to prevent multiple logs when module is imported multiple times
if (typeof global !== 'undefined' && !(global as any).__i18n_resources_logged) {
  /* eslint-disable-next-line no-console */
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log('🌍 i18n Resources loaded:', {
      languages: Object.keys(resources),
      enUSKeys: resources['en-US']?.translation ? Object.keys(resources['en-US'].translation) : [],
      hasGoals: !!resources['en-US']?.translation?.goals,
      navigationKeys: resources['en-US']?.translation?.navigation ? Object.keys(resources['en-US'].translation.navigation) : [],
      hasMilestones: !!resources['en-US']?.translation?.navigation?.milestones,
      hasStatistics: !!resources['en-US']?.translation?.navigation?.statistics,
    });
    (global as any).__i18n_resources_logged = true;
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
        goalsTitle: i18n.t('goals.list.title', { defaultValue: 'NOT_FOUND' }),
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
