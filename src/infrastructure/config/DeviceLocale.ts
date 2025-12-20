/**
 * Device Locale Detection
 * Detects and maps device locale to supported language
 */

import * as Localization from 'expo-localization';
import { LOCALE_MAPPING } from './LocaleMapping';
import { languageRegistry } from './languagesData';

export const DEFAULT_LANGUAGE = 'en-US';

/**
 * Get device locale and map it to supported language
 * Called ONLY on first launch (when no saved language preference exists)
 */
export const getDeviceLocale = (): string => {
    try {
        const deviceLocale = Localization.getLocales()[0]?.languageTag;

        if (!deviceLocale) {
            return DEFAULT_LANGUAGE;
        }

        // Check exact match
        if (LOCALE_MAPPING[deviceLocale]) {
            return LOCALE_MAPPING[deviceLocale];
        }

        // Extract language code
        const languageCode = deviceLocale.split('-')[0];
        const mappedByCode = languageCode ? LOCALE_MAPPING[languageCode] : undefined;

        // Check language code
        if (mappedByCode) {
            return mappedByCode;
        }

        // Check if directly supported
        if (languageRegistry.isLanguageSupported(deviceLocale)) {
            return deviceLocale;
        }

        return DEFAULT_LANGUAGE;
    } catch {
        return DEFAULT_LANGUAGE;
    }
};
