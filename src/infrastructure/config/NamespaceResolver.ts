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

    const namespaces = new Set([
      ...Object.keys(packageLang),
      ...Object.keys(appTranslations),
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
