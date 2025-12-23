#!/usr/bin/env node

/**
 * Translation Configuration
 * Language mappings and constants for translation system
 */

const LANGUAGE_MAP = {
  'ar-SA': 'ar',
  'bg-BG': 'bg',
  'cs-CZ': 'cs',
  'da-DK': 'da',
  'de-DE': 'de',
  'el-GR': 'el',
  'en-AU': 'en',
  'en-CA': 'en',
  'en-GB': 'en',
  'es-ES': 'es',
  'es-MX': 'es',
  'fi-FI': 'fi',
  'fr-CA': 'fr',
  'fr-FR': 'fr',
  'hi-IN': 'hi',
  'hr-HR': 'hr',
  'hu-HU': 'hu',
  'id-ID': 'id',
  'it-IT': 'it',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'ms-MY': 'ms',
  'nl-NL': 'nl',
  'no-NO': 'no',
  'pl-PL': 'pl',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'ro-RO': 'ro',
  'ru-RU': 'ru',
  'sk-SK': 'sk',
  'sv-SE': 'sv',
  'th-TH': 'th',
  'tl-PH': 'tl',
  'tr-TR': 'tr',
  'uk-UA': 'uk',
  'vi-VN': 'vi',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
};

const SKIP_WORDS = new Set([
  'Google',
  'Apple',
  'Facebook',
  'Instagram',
  'Twitter',
  'YouTube',
  'WhatsApp',
]);

const LANGUAGE_NAMES = {
  'ar-SA': 'Arabic (Saudi Arabia)',
  'bg-BG': 'Bulgarian',
  'cs-CZ': 'Czech',
  'da-DK': 'Danish',
  'de-DE': 'German',
  'el-GR': 'Greek',
  'en-AU': 'English (Australia)',
  'en-CA': 'English (Canada)',
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Mexico)',
  'fi-FI': 'Finnish',
  'fr-CA': 'French (Canada)',
  'fr-FR': 'French (France)',
  'hi-IN': 'Hindi',
  'hr-HR': 'Croatian',
  'hu-HU': 'Hungarian',
  'id-ID': 'Indonesian',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'ms-MY': 'Malay',
  'nl-NL': 'Dutch',
  'no-NO': 'Norwegian',
  'pl-PL': 'Polish',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  'ro-RO': 'Romanian',
  'ru-RU': 'Russian',
  'sk-SK': 'Slovak',
  'sv-SE': 'Swedish',
  'th-TH': 'Thai',
  'tl-PH': 'Tagalog',
  'tr-TR': 'Turkish',
  'uk-UA': 'Ukrainian',
  'vi-VN': 'Vietnamese',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
};

function getLangDisplayName(code) {
  return LANGUAGE_NAMES[code] || code;
}

function getTargetLanguage(langCode) {
  return LANGUAGE_MAP[langCode];
}

function shouldSkipWord(word) {
  return SKIP_WORDS.has(word);
}

function isEnglishVariant(langCode) {
  const targetLang = LANGUAGE_MAP[langCode];
  return targetLang === 'en';
}

module.exports = {
  LANGUAGE_MAP,
  SKIP_WORDS,
  LANGUAGE_NAMES,
  getLangDisplayName,
  getTargetLanguage,
  shouldSkipWord,
  isEnglishVariant,
};
