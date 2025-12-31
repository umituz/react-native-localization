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

    // Initialize with package translations
    const resources: Record<string, Record<string, any>> = { ...packageTranslations };

    // Ensure initial language exists
    if (!resources[languageCode]) {
      resources[languageCode] = {};
    }

    // Process app translations
    for (const [key, value] of Object.entries(appTranslations)) {
      // Check if the key is a language code (format: xx-XX)
      const isLanguageKey = /^[a-z]{2}-[A-Z]{2}$/.test(key);

      if (isLanguageKey) {
        // It's a language key (e.g., "en-US")
        const lang = key;
        if (!resources[lang]) {
          resources[lang] = {};
        }

        // Merge namespaces for this language
        if (value && typeof value === 'object') {
          const namespaces = Object.keys(value);
          const isFlatMap = namespaces.every(nsKey => typeof value[nsKey] === 'string');
          
          if (isFlatMap) {
            // It's a flat map (e.g. { hello: 'Hello' }), wrap in 'common'
            const defaultNs = 'common';
            resources[lang][defaultNs] = TranslationLoader.mergeTranslations(
              resources[lang][defaultNs] || {},
              value
            );
          } else {
            // It's already namespaced (e.g. { auth: {...} })
            for (const [namespace, translations] of Object.entries(value)) {
              resources[lang][namespace] = TranslationLoader.mergeTranslations(
                resources[lang][namespace] || {},
                translations as Record<string, any>
              );
            }
          }
        }
      } else {
        // It's a namespace for the default/current language (backward compatibility)
        if (value && typeof value === 'object') {
          resources[languageCode][key] = TranslationLoader.mergeTranslations(
            resources[languageCode][key] || {},
            value
          );
        }
      }
    }

    return resources;
  }
}
