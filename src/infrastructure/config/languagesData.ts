/**
 * Language Data Exports
 * Centralized exports for language management
 */

import { languageRepository } from '../repository/LanguageRepository';
import { DEFAULT_LANGUAGES } from './constants/defaultLanguages';
import type { Language } from '../storage/types/Language';

export { languageRepository };
export { DEFAULT_LANGUAGES };
export type { Language };

export const getLanguageByCode = (code: string) =>
  languageRepository.getLanguageByCode(code);

export const searchLanguages = (query: string) =>
  languageRepository.searchLanguages(query);

export const isLanguageSupported = (code: string) =>
  languageRepository.isLanguageSupported(code);

export const getDefaultLanguage = () =>
  languageRepository.getDefaultLanguage();

export const LANGUAGES = languageRepository.getLanguages();
