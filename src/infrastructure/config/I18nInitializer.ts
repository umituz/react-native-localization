/**
 * i18n Initializer
 *
 * Namespace-based i18n configuration
 * Usage: t('namespace:key') e.g., t('common:cancel')
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';
import { TranslationLoader } from './TranslationLoader';

const DEFAULT_NAMESPACE = 'common';

export class I18nInitializer {
  private static reactI18nextInitialized = false;
  private static appTranslations: Record<string, any> = {};

  /**
   * Register app translations (call before initialize)
   */
  static registerAppTranslations(translations: Record<string, any>): void {
    this.appTranslations = translations;
  }

  /**
   * Build resources with package + registered app translations
   */
  private static buildResources(): Record<string, Record<string, any>> {
    const packageTranslations = TranslationLoader.loadPackageTranslations();

    const resources: Record<string, Record<string, any>> = {
      'en-US': {},
    };

    const enUSPackage = packageTranslations['en-US'] || {};

    // Add package namespaces
    for (const [namespace, translations] of Object.entries(enUSPackage)) {
      resources['en-US'][namespace] = translations;
    }

    // Merge app translations (app overrides package)
    for (const [namespace, translations] of Object.entries(this.appTranslations)) {
      if (resources['en-US'][namespace]) {
        resources['en-US'][namespace] = TranslationLoader.mergeTranslations(
          resources['en-US'][namespace],
          translations
        );
      } else {
        resources['en-US'][namespace] = translations;
      }
    }

    return resources;
  }

  private static getNamespaces(): string[] {
    const packageTranslations = TranslationLoader.loadPackageTranslations();
    const enUSPackage = packageTranslations['en-US'] || {};

    const namespaces = new Set([
      ...Object.keys(enUSPackage),
      ...Object.keys(this.appTranslations),
    ]);

    if (!namespaces.has(DEFAULT_NAMESPACE)) {
      namespaces.add(DEFAULT_NAMESPACE);
    }

    return Array.from(namespaces);
  }

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
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
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
        console.error('[Localization] init error:', error);
      }
    }
  }

  /**
   * Add translations at runtime
   */
  static addTranslations(
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
