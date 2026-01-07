/**
 * Default Languages Configuration
 * Applications can override this by providing their own language list
 */

import type { Language } from '../../storage/types/Language';

export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', isRTL: false },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', isRTL: false },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', isRTL: false },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', isRTL: false },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', isRTL: false },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', isRTL: false },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', isRTL: false },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮', isRTL: false },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isRTL: false },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', isRTL: false },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', isRTL: false },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', isRTL: false },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', isRTL: false },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', isRTL: false },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', isRTL: false },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', isRTL: false },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', isRTL: false },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', isRTL: false },
  { code: 'tl-PH', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', isRTL: false },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRTL: false },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', isRTL: false },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isRTL: false },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', isRTL: false },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', isRTL: false },
];
