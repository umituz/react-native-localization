/**
 * i18n Configuration
 *
 * Auto-initializes i18n with project translations
 */

import { I18nInitializer } from './I18nInitializer';
import i18n from 'i18next';

// Initialize i18n automatically
I18nInitializer.initialize();

// Export for advanced usage
export const addTranslationResources = I18nInitializer.addTranslationResources;
export default i18n;
