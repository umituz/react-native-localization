/**
 * Namespace Resolver
 * Resolves available namespaces from translations
 */

import { TranslationLoader } from './TranslationLoader';

const DEFAULT_NAMESPACE = 'common';

export class NamespaceResolver {
  /**
   * Get all available namespaces from package and app translations
   */
  static getNamespaces(
    appTranslations: Record<string, any>,
    languageCode: string
  ): string[] {
    const packageTranslations = TranslationLoader.loadPackageTranslations();
    const packageLang = packageTranslations[languageCode] || {};

    let appNamespaces: string[] = [];

    // Check if appTranslations has language keys (format: xx-XX)
    const hasLanguageKeys = Object.keys(appTranslations).some(key =>
      /^[a-z]{2}-[A-Z]{2}$/.test(key)
    );

    if (hasLanguageKeys) {
      // If structured by language, get namespaces from the requested language
      const langTranslations = appTranslations[languageCode];
      if (langTranslations && typeof langTranslations === 'object') {
        appNamespaces = Object.keys(langTranslations);
      }
    } else {
      // If structured by namespace (legacy/simple), keys are namespaces
      appNamespaces = Object.keys(appTranslations);
    }

    const namespaces = new Set([
      ...Object.keys(packageLang),
      ...appNamespaces,
    ]);

    if (!namespaces.has(DEFAULT_NAMESPACE)) {
      namespaces.add(DEFAULT_NAMESPACE);
    }

    return Array.from(namespaces);
  }

  static getDefaultNamespace(): string {
    return DEFAULT_NAMESPACE;
  }
}
