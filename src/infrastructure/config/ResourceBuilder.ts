/**
 * Resource Builder
 * Builds i18n resources from package and app translations
 */

import { TranslationLoader } from './TranslationLoader';

export class ResourceBuilder {
  /**
   * Build resources with package + app translations
   */
  static buildResources(
    appTranslations: Record<string, any>,
    languageCode: string
  ): Record<string, Record<string, any>> {
    const packageTranslations = TranslationLoader.loadPackageTranslations();

    const resources: Record<string, Record<string, any>> = {
      [languageCode]: {},
    };

    const packageLang = packageTranslations[languageCode] || {};

    // Add package namespaces
    for (const [namespace, translations] of Object.entries(packageLang)) {
      resources[languageCode][namespace] = translations;
    }

    // Merge app translations (app overrides package)
    for (const [namespace, translations] of Object.entries(appTranslations)) {
      if (resources[languageCode][namespace]) {
        resources[languageCode][namespace] = TranslationLoader.mergeTranslations(
          resources[languageCode][namespace],
          translations
        );
      } else {
        resources[languageCode][namespace] = translations;
      }
    }

    return resources;
  }
}
