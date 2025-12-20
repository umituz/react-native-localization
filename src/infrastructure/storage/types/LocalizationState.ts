/**
 * Localization State Interface
 * Defines the shape of localization state management
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isRTL?: boolean;
}

export interface LocalizationState {
  currentLanguage: string;
  isRTL: boolean;
  isInitialized: boolean;
  supportedLanguages: Language[];
}

export interface LocalizationActions {
  initialize: () => Promise<void>;
  setLanguage: (languageCode: string) => Promise<void>;
  reset: () => void;
}

export interface LocalizationGetters {
  getCurrentLanguage: () => Language | undefined;
  isLanguageSupported: (code: string) => boolean;
  getSupportedLanguages: () => Language[];
}