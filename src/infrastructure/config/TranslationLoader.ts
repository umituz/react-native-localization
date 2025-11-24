/**
 * Translation Loader
 *
 * Handles loading of translations from different sources
 * - Package translations
 * - Project translations
 * - Resource merging
 */

export class TranslationLoader {
  /**
   * Load package translations (en-US only)
   */
  static loadPackageTranslations(): Record<string, any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const translations = require('../locales/en-US');
      return { 'en-US': translations.default || translations };
    } catch (error) {
      return { 'en-US': {} };
    }
  }

  /**
   * Load project translations for all supported languages
   * Currently returns empty as projects manage their own translations
   */
  static loadProjectTranslations(): Record<string, any> {
    return {};
  }

  /**
   * Merge package defaults with project-specific translations
   */
  static mergeTranslations(
    packageTranslations: any,
    projectTranslations: any
  ): any {
    if (!projectTranslations || Object.keys(projectTranslations).length === 0) {
      return packageTranslations;
    }

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
          merged[key] = this.mergeTranslations(
            packageTranslations[key],
            projectTranslations[key]
          );
        } else {
          // Override with project translation
          merged[key] = projectTranslations[key];
        }
      }
    }

    return merged;
  }
}
