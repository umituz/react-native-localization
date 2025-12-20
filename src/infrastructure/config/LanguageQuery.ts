/**
 * Language Query Functions
 * Provides functions to query and search languages
 */

import { languageRegistry } from './languagesData';
import type { Language } from '../storage/types/LocalizationState';

export const getSupportedLanguages = () => languageRegistry.getLanguages();

export const getLanguageByCode = (code: string): Language | undefined => {
    return languageRegistry.getLanguageByCode(code);
};

export const isLanguageSupported = (code: string): boolean => {
    return languageRegistry.isLanguageSupported(code);
};

export const getDefaultLanguage = (): Language => {
    const langs = languageRegistry.getLanguages();
    const firstLang = langs[0];
    if (firstLang) return firstLang;

    // Final fallback to system defaults if registry is empty
    return languageRegistry.getDefaultLanguage();
};

export const searchLanguages = (query: string): Language[] => {
    const lowerQuery = query.toLowerCase();
    return languageRegistry.getLanguages().filter(
        (lang) =>
            lang.name.toLowerCase().includes(lowerQuery) ||
            lang.nativeName.toLowerCase().includes(lowerQuery)
    );
};
