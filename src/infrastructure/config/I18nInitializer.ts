/**
 * i18n Initializer
 *
 * Handles i18n configuration and initialization with namespace support
 * - Auto-discovers project translations
 * - Namespace-based organization (common, auth, etc.)
 * - React i18next integration
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';
import { TranslationLoader } from './TranslationLoader';

const DEFAULT_NAMESPACE = 'common';

export class I18nInitializer {
  private static reactI18nextInitialized = false;

  /**
   * Build resources object with namespace support
   */
  private static buildResources(): Record<string, Record<string, any>> {
    const packageTranslations = TranslationLoader.loadPackageTranslations();

    // Create namespace-based resources structure
    const resources: Record<string, Record<string, any>> = {
      'en-US': {},
    };

    // Package translations are already in namespace format (alerts, auth, etc.)
    const enUSPackage = packageTranslations['en-US'] || {};

    // Each key in packageTranslations is a namespace
    for (const [namespace, translations] of Object.entries(enUSPackage)) {
      resources['en-US'][namespace] = translations;
    }

    return resources;
  }

  /**
   * Get all available namespaces from package translations
   */
  private static getNamespaces(): string[] {
    const packageTranslations = TranslationLoader.loadPackageTranslations();
    const enUSPackage = packageTranslations['en-US'] || {};
    const namespaces = Object.keys(enUSPackage);

    // Ensure default namespace is included
    if (!namespaces.includes(DEFAULT_NAMESPACE)) {
      namespaces.unshift(DEFAULT_NAMESPACE);
    }

    return namespaces;
  }

  /**
   * Initialize i18next with namespace support
   */
  static initialize(): void {
    if (i18n.isInitialized) {
      return;
    }

    try {
      if (!this.reactI18nextInitialized) {
        i18n.use(initReactI18next);
        this.reactI18nextInitialized = true;
      }

      const resources = this.buildResources();
      const namespaces = this.getNamespaces();

      i18n.init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        ns: namespaces,
        defaultNS: DEFAULT_NAMESPACE,
        fallbackNS: DEFAULT_NAMESPACE,

        interpolation: {
          escapeValue: false,
        },

        react: {
          useSuspense: false,
        },

        compatibilityJSON: 'v3',
        pluralSeparator: '_',
        keySeparator: '.',
        nsSeparator: ':',

        saveMissing: false,
        missingKeyHandler: false,

        debug: false,
      });

    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('[Localization] i18n initialization error:', error);
      }
    }
  }

  /**
   * Add additional translation resources with namespace support
   * @param languageCode - Language code (e.g., 'en-US')
   * @param namespaceResources - Object with namespace keys and translation objects
   */
  static addTranslationResources(
    languageCode: string,
    namespaceResources: Record<string, any>
  ): void {
    for (const [namespace, translations] of Object.entries(namespaceResources)) {
      if (translations && typeof translations === 'object') {
        i18n.addResourceBundle(languageCode, namespace, translations, true, true);
      }
    }
  }
}
