/**
 * i18n Initializer
 *
 * Handles i18n configuration and initialization
 * - Resource building
 * - i18n setup
 * - React i18next integration
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages';
import { TranslationLoader } from './TranslationLoader';

export class I18nInitializer {
  private static reactI18nextInitialized = false;

  /**
   * Build resources object for all supported languages
   */
  private static buildResources(): Record<string, { translation: any }> {
    const resources: Record<string, { translation: any }> = {};
    const packageTranslations = TranslationLoader.loadPackageTranslations();
    const projectTranslations = TranslationLoader.loadProjectTranslations();

    // Build resources for each supported language
    for (const lang of SUPPORTED_LANGUAGES) {
      const langCode = lang.code;
      const packageTranslation = langCode === 'en-US' ? (packageTranslations['en-US'] || {}) : {};
      const projectTranslation = projectTranslations[langCode] || {};

      // For en-US, merge package and project translations
      // For other languages, use project translations only (fallback to en-US handled by i18n)
      if (langCode === 'en-US') {
        resources[langCode] = {
          translation: TranslationLoader.mergeTranslations(packageTranslation, projectTranslation),
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
  }

  /**
   * Initialize i18next
   */
  static initialize(): void {
    // Prevent multiple initializations
    if (i18n.isInitialized) {
      return;
    }

    try {
      // Use initReactI18next once
      if (!this.reactI18nextInitialized) {
        i18n.use(initReactI18next);
        this.reactI18nextInitialized = true;
      }

      const resources = this.buildResources();

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

        compatibilityJSON: 'v3', // Use v3 format for React Native
        pluralSeparator: '_', // Use underscore separator for plural keys
        keySeparator: '.', // Use dot separator for nested keys

        debug: typeof __DEV__ !== 'undefined' && __DEV__,
      });

    } catch (error) {
      // Don't throw - allow app to continue without i18n
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('❌ i18n initialization error:', error);
      }
    }
  }

  /**
   * Add additional translation resources
   */
  static addTranslationResources(resources: Record<string, { translation: any }>): void {
    for (const [langCode, resource] of Object.entries(resources)) {
      if (resource.translation) {
        const existingTranslations = i18n.getResourceBundle(langCode, 'translation') || {};
        const mergedTranslations = { ...existingTranslations, ...resource.translation };
        i18n.addResourceBundle(langCode, 'translation', mergedTranslations, true, true);
      }
    }
  }
}
