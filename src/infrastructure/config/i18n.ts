/**
 * i18n Configuration
 *
 * Auto-initializes i18n with namespace support
 * Usage: t('namespace:key') e.g., t('common:cancel')
 */

import { I18nInitializer } from './I18nInitializer';
import i18n from 'i18next';

I18nInitializer.initialize();

export const addTranslationResources = I18nInitializer.addTranslationResources;
export default i18n;
