# @umituz/react-native-localization

Universal localization system for React Native apps with i18n support. Built with Domain-Driven Design principles and TypeScript.

## Features

- **29+ Language Support**: Pre-configured support for 29 languages including RTL languages (Arabic)
- **Automatic Device Locale Detection**: Automatically detects and applies device language on first launch
- **Persistent Language Preferences**: Saves user's language choice using AsyncStorage
- **Type-Safe**: Full TypeScript support with type definitions
- **Zero Configuration**: Works out of the box with sensible defaults
- **Production Ready**: Battle-tested in production apps
- **Lightweight**: Minimal dependencies with tree-shakeable exports

## Installation

```bash
npm install @umituz/react-native-localization
# or
yarn add @umituz/react-native-localization
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install zustand i18next react-i18next expo-localization @react-native-async-storage/async-storage
```

## Quick Start

### 1. Wrap Your App with LocalizationProvider

```tsx
import { LocalizationProvider } from '@umituz/react-native-localization';

export default function App() {
  return (
    <LocalizationProvider>
      <YourApp />
    </LocalizationProvider>
  );
}
```

### 2. Use Localization in Your Components

```tsx
import { useLocalization } from '@umituz/react-native-localization';

function MyComponent() {
  const { t, currentLanguage, setLanguage } = useLocalization();

  return (
    <View>
      <Text>{t('general.welcome')}</Text>
      <Text>Current Language: {currentLanguage}</Text>
      <Button title="Switch to Turkish" onPress={() => setLanguage('tr-TR')} />
    </View>
  );
}
```

## API Reference

### `useLocalization()`

Main hook to access localization functionality.

**Returns:**
- `t`: Translation function
- `currentLanguage`: Current language code (e.g., 'en-US')
- `currentLanguageObject`: Full language object with metadata
- `isRTL`: Boolean indicating if current language is RTL
- `isInitialized`: Boolean indicating if localization is ready
- `supportedLanguages`: Array of all supported languages
- `setLanguage`: Function to change language
- `initialize`: Function to manually initialize (auto-called by provider)

### `LocalizationProvider`

Component that initializes the localization system. Wrap your app with this component.

```tsx
<LocalizationProvider>
  <App />
</LocalizationProvider>
```

### Helper Functions

#### `getLanguageByCode(code: string)`

Get language object by language code.

```tsx
import { getLanguageByCode } from '@umituz/react-native-localization';

const language = getLanguageByCode('en-US');
// Returns: { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false }
```

#### `getDefaultLanguage()`

Get the default language object (English US).

```tsx
import { getDefaultLanguage } from '@umituz/react-native-localization';

const defaultLang = getDefaultLanguage();
```

#### `getDeviceLocale()`

Get device's locale and map it to a supported language.

```tsx
import { getDeviceLocale } from '@umituz/react-native-localization';

const deviceLanguage = getDeviceLocale();
```

## Supported Languages

The package comes with pre-configured support for 29 languages:

| Language | Code | RTL |
|----------|------|-----|
| English | en-US | No |
| Arabic | ar-SA | Yes |
| Bulgarian | bg-BG | No |
| Czech | cs-CZ | No |
| Danish | da-DK | No |
| German | de-DE | No |
| Spanish | es-ES | No |
| Finnish | fi-FI | No |
| French | fr-FR | No |
| Hindi | hi-IN | No |
| Hungarian | hu-HU | No |
| Indonesian | id-ID | No |
| Italian | it-IT | No |
| Japanese | ja-JP | No |
| Korean | ko-KR | No |
| Malay | ms-MY | No |
| Dutch | nl-NL | No |
| Norwegian | no-NO | No |
| Polish | pl-PL | No |
| Portuguese | pt-PT | No |
| Romanian | ro-RO | No |
| Russian | ru-RU | No |
| Swedish | sv-SE | No |
| Thai | th-TH | No |
| Filipino | tl-PH | No |
| Turkish | tr-TR | No |
| Ukrainian | uk-UA | No |
| Vietnamese | vi-VN | No |
| Chinese (Simplified) | zh-CN | No |

## Translation Structure

The package includes common translations organized by domain:

- `animation`: Animation-related translations
- `audio`: Audio-related translations
- `datetime`: Date and time translations
- `emoji`: Emoji-related translations
- `errors`: Error messages
- `forms`: Form labels and validation
- `general`: General UI text
- `icons`: Icon labels
- `location`: Location-related translations
- `media`: Media-related translations
- `navigation`: Navigation labels
- `onboarding`: Onboarding flow text
- `settings`: Settings screen text
- `toast`: Toast notification messages

### Example Translation Usage

```tsx
// Access nested translations
t('general.welcome')
t('errors.network.title')
t('settings.language.title')
```

## Advanced Usage

### Language Selector Component

```tsx
import { useLocalization, SUPPORTED_LANGUAGES } from '@umituz/react-native-localization';
import { FlatList, TouchableOpacity, Text } from 'react-native';

function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLocalization();

  return (
    <FlatList
      data={SUPPORTED_LANGUAGES}
      keyExtractor={(item) => item.code}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setLanguage(item.code)}>
          <Text>
            {item.flag} {item.nativeName}
            {currentLanguage === item.code && ' ✓'}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

### RTL Support

```tsx
import { useLocalization } from '@umituz/react-native-localization';
import { I18nManager } from 'react-native';

function MyComponent() {
  const { isRTL } = useLocalization();

  // Apply RTL layout
  React.useEffect(() => {
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  return <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }} />;
}
```

### Custom Translations

You can extend the translations by adding your own:

```tsx
import { i18n } from '@umituz/react-native-localization';

// Add custom translations
i18n.addResources('en-US', 'translation', {
  myFeature: {
    title: 'My Feature',
    description: 'Feature description'
  }
});

// Use in components
const { t } = useLocalization();
console.log(t('myFeature.title')); // 'My Feature'
```

## TypeScript Support

The package is written in TypeScript and includes full type definitions.

```tsx
import type { Language } from '@umituz/react-native-localization';

const language: Language = {
  code: 'en-US',
  name: 'English',
  nativeName: 'English',
  flag: '🇺🇸',
  rtl: false
};
```

## Architecture

Built with Domain-Driven Design (DDD) principles:

- **Domain Layer**: Core business logic and interfaces
- **Infrastructure Layer**: Implementation details (storage, i18n config, locales)
- **Presentation Layer**: React components and hooks

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT

## Author

Ümit UZ <umit@umituz.com>

## Repository

https://github.com/umituz/react-native-localization
