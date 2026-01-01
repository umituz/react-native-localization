/**
 * i18n Initializer
 *
 * Namespace-based i18n configuration
 * Usage: t('namespace:key') e.g., t('common:cancel')
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './languages';
import { ResourceBuilder } from './ResourceBuilder';
import { NamespaceResolver } from './NamespaceResolver';

export class I18nInitializer {
  private static reactI18nextInitialized = false;

  static initialize(
    appTranslations: Record<string, any>,
    languageCode: string = DEFAULT_LANGUAGE
  ): void {
    if (i18n.isInitialized) {
      return;
    }

    try {
      if (!this.reactI18nextInitialized) {
        i18n.use(initReactI18next);
        this.reactI18nextInitialized = true;
      }

      const resources = ResourceBuilder.buildResources(appTranslations, languageCode);
      const namespaces = NamespaceResolver.getNamespaces(appTranslations, languageCode);
      const defaultNamespace = NamespaceResolver.getDefaultNamespace();

      i18n.init({
        resources,
        lng: languageCode,
        fallbackLng: DEFAULT_LANGUAGE,
        ns: namespaces,
        defaultNS: defaultNamespace,
        fallbackNS: defaultNamespace,
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
        compatibilityJSON: 'v4',
        pluralSeparator: '_',
        keySeparator: '.',
        nsSeparator: ':',
        saveMissing: false,
        missingKeyHandler: false,
        debug: false,
        returnEmptyString: false,
        returnNull: false,
      });
    } catch {
      // Silent error handling
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
