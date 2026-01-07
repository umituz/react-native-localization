/**
 * Language Query Functions
 * Provides functions to query and search languages
 */

import { languageRepository } from '../repository/LanguageRepository';
import type { Language } from '../storage/types/Language';

export const getSupportedLanguages = () => languageRepository.getLanguages();

export const getLanguageByCode = (code: string): Language | undefined => {
    return languageRepository.getLanguageByCode(code);
};

export const isLanguageSupported = (code: string): boolean => {
    return languageRepository.isLanguageSupported(code);
};

export const getDefaultLanguage = (): Language => {
    const langs = languageRepository.getLanguages();
    const firstLang = langs[0];
    if (firstLang) return firstLang;

    // Final fallback to system defaults if repository is empty
    return languageRepository.getDefaultLanguage();
};

export const searchLanguages = (query: string): Language[] => {
    const lowerQuery = query.toLowerCase();
    return languageRepository.getLanguages().filter(
        (lang) =>
            lang.name.toLowerCase().includes(lowerQuery) ||
            lang.nativeName.toLowerCase().includes(lowerQuery)
    );
};
