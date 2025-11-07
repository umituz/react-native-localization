/**
 * React Native Localization
 * Universal localization system with i18n support for React Native apps
 */

// Hooks
export { useLocalization, useLocalizationStore } from './infrastructure/storage/LocalizationStore';

// Components
export { LocalizationProvider } from './infrastructure/components/LocalizationProvider';
export { LanguageSwitcher } from './infrastructure/components/LanguageSwitcher';
export { useLanguageNavigation } from './infrastructure/components/useLanguageNavigation';

// Configuration
export { default as i18n } from './infrastructure/config/i18n';
export {
  SUPPORTED_LANGUAGES,
  LANGUAGES, // Alias for SUPPORTED_LANGUAGES (backward compatibility)
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isLanguageSupported,
  getDefaultLanguage,
  getDeviceLocale,
  searchLanguages,
} from './infrastructure/config/languages';

// Types
export type { Language, ILocalizationRepository } from './domain/repositories/ILocalizationRepository';
