/**
 * i18n Configuration Entry Point
 *
 * Delegates to I18nInitializer for setup
 * Exports i18n instance and utility functions
 */

import i18n from 'i18next';
import { I18nInitializer } from './I18nInitializer';

// Initialize i18n immediately
I18nInitializer.initialize();

// Export utility functions
export const addTranslationResources = I18nInitializer.addTranslationResources;

export default i18n;
