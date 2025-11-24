/**
 * i18n Initializer
 *
 * Handles i18n configuration and initialization
 * - Auto-discovers project translations
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
   * Auto-discover project translations from common paths
   */
  private static loadProjectTranslations(): Record<string, any> {
    const possiblePaths = [
      './src/locales/en-US',           // App structure
      './locales/en-US',               // Alternative app structure
      '../src/locales/en-US',          // Relative from package
    ];

    for (const path of possiblePaths) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const translations = require(path);
        return translations.default || translations;
      } catch {
        // Try next path
      }
    }

    return {};
  }

  /**
   * Build resources object for all supported languages
   */
  private static buildResources(): Record<string, { translation: any }> {
    const resources: Record<string, { translation: any }> = {};
    const packageTranslations = TranslationLoader.loadPackageTranslations();
    const projectTranslations = this.loadProjectTranslations();

    // For en-US, merge package and project translations
    resources['en-US'] = {
      translation: TranslationLoader.mergeTranslations(
        packageTranslations['en-US'] || {},
        projectTranslations
      ),
    };

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
