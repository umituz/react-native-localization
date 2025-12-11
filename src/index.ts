/**
 * React Native Localization
 * i18n with namespace support for React Native apps
 */

// Hooks
export { useLocalization } from './infrastructure/hooks/useLocalization';
export { useLocalizationStore } from './infrastructure/storage/LocalizationStore';
export { useTranslationFunction } from './infrastructure/hooks/useTranslation';

// Components
export { LocalizationProvider } from './infrastructure/components/LocalizationProvider';
export { LanguageSwitcher } from './infrastructure/components/LanguageSwitcher';
export { useLanguageNavigation } from './infrastructure/components/useLanguageNavigation';

// Configuration
export { default as i18n } from './infrastructure/config/i18n';
export { I18nInitializer } from './infrastructure/config/I18nInitializer';
export {
  SUPPORTED_LANGUAGES,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isLanguageSupported,
  getDefaultLanguage,
  getDeviceLocale,
  searchLanguages,
} from './infrastructure/config/languages';

// Presentation
export { LanguageSelectionScreen } from './presentation/screens/LanguageSelectionScreen';

// Types
export type { Language, ILocalizationRepository } from './domain/repositories/ILocalizationRepository';
