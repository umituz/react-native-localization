# @umituz/react-native-localization

English-only localization system for React Native apps with i18n support. Built with Domain-Driven Design principles and TypeScript.

## Features

- **English-Only Support**: Optimized for English (en-US) language only
- **Automatic Device Locale Detection**: Maps all device locales to English (en-US)
- **Persistent Language Preferences**: Saves user's language choice using AsyncStorage
- **Simple Translation Management**: Easy-to-use translation files for English content
- **Type-Safe**: Full TypeScript support with type definitions
- **Zero Configuration**: Works out of the box with sensible defaults
- **Production Ready**: Battle-tested in production apps
- **Lightweight**: Minimal dependencies with tree-shakeable exports
- **Domain-Driven Design**: Follows DDD principles with clear separation of concerns

## Architecture Overview

This package follows Domain-Driven Design principles:

```
📁 src/
├── domain/           # Business entities and interfaces
├── infrastructure/   # Storage, config, and external services
└── presentation/     # Hooks and components for UI
```

### Package vs Project Translations

**Package Translations (This Package):**
- Core UI translations (buttons, alerts, navigation)
- Device-specific translations (camera, location, etc.)
- Generic business logic translations

**Project Translations (Your App):**
- App-specific translations
- Business domain translations
- Feature-specific content

**Why This Separation?**
- Package stays lightweight and reusable
- Projects maintain full control over their translations
- Easy updates without affecting project-specific content
- Clear separation of concerns

## Installation

```bash
npm install @umituz/react-native-localization
# or
yarn add @umituz/react-native-localization
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install zustand i18next react-i18next expo-localization @umituz/react-native-storage
```

**Note:** `@umituz/react-native-storage` is required for persistent language preferences. It provides type-safe storage operations following Domain-Driven Design principles.

## Quick Start

### Step 1: Install Package Translations (Core UI)

```bash
npm install @umituz/react-native-localization
```

### Step 2: Create Your Project's Localization Domain

Create a localization domain in your project following DDD principles:

```
📁 src/domains/localization/
├── index.ts                    # Domain exports
├── infrastructure/
│   ├── locales/
│   │   ├── en-US/
│   │   │   ├── index.ts        # Auto-loader (uses filesystem package)
│   │   │   ├── auth.json       # Authentication translations
│   │   │   ├── home.json       # Home screen translations
│   │   │   ├── settings.json   # Settings translations
│   │   │   └── [feature].json  # Feature-specific translations
│   │   └── [other-languages]/  # Future language support
│   └── config/
│       └── i18n.ts             # Project i18n configuration
└── presentation/
    └── hooks/
        └── useLocalization.ts  # Project-specific hooks (optional)
```

**Example from Vivoim App:**
```
📁 src/domains/localization/
├── index.ts
└── infrastructure/
    └── locales/
        └── en-US/
            ├── auth.json       # Login, signup, password
            ├── chat.json       # Chat messages, typing
            ├── common.json     # Shared UI elements
            ├── community.json  # Social features
            ├── creations.json  # Content creation
            ├── editor.json     # Image/video editing
            ├── home.json       # Dashboard, navigation
            ├── index.ts        # Auto-loader
            ├── navigation.json # App navigation
            ├── paywall.json    # Subscription features
            ├── premium.json    # Premium content
            ├── profile.json    # User profiles
            ├── projects.json   # Project management
            ├── settings.json   # App settings
            ├── support.json    # Help & support
            ├── templates.json  # Content templates
            ├── text2image.json # AI image generation
            └── wallet.json     # Payments, credits
```

**Why This Structure?**
- **Separation of Concerns**: Package handles core UI, project handles business logic
- **Scalability**: Easy to add new features without touching core package
- **Maintainability**: Clear ownership of translations
- **Reusability**: Same package works across hundreds of apps

### Step 3: Set Up Project Translations

**src/domains/localization/infrastructure/locales/en-US/index.ts:**
```typescript
import { loadJsonModules } from "@umituz/react-native-filesystem";

// Metro bundler require.context - auto-discover all .json files
// eslint-disable-next-line @typescript-eslint/no-require-imports
const translationContext = (require as any).context("./", false, /\.json$/);

// Load all JSON modules using filesystem package utilities
const translations = loadJsonModules(translationContext);

export default translations;
```

**src/domains/localization/infrastructure/locales/en-US/your-feature.json:**
```json
{
  "title": "Your Feature Title",
  "description": "Feature description",
  "button": {
    "save": "Save Changes",
    "cancel": "Cancel"
  }
}
```

### Step 4: Configure Project i18n

**src/domains/localization/infrastructure/config/i18n.ts:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from '@umituz/react-native-localization';

// Load project translations
const loadProjectTranslations = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../locales/en-US');
  } catch {
    return {};
  }
};

const projectTranslations = loadProjectTranslations();

// Configure i18n with project translations
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        translation: projectTranslations.default || projectTranslations
      }
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

### Step 5: Wrap Your App

```tsx
import { LocalizationProvider } from '@umituz/react-native-localization';
import './domains/localization/infrastructure/config/i18n'; // Initialize project i18n

export default function App() {
  return (
    <LocalizationProvider>
      <YourApp />
    </LocalizationProvider>
  );
}
```

### Step 6: Use in Components

**Option A: Use Package Localization (Recommended for UI components)**
```tsx
import { useLocalization } from '@umituz/react-native-localization';

function MyComponent() {
  const { t } = useLocalization();

  return (
    <View>
      <Text>{t('general.save')}</Text> {/* From package */}
      <Text>{t('yourFeature.title')}</Text> {/* From your project */}
    </View>
  );
}
```

**Option B: Use Project Localization (For business logic)**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('yourFeature.title')}</Text> {/* From your project */}
    </View>
  );
}
```

#### **Add Project Translations to Package i18n**

For better integration, add your project translations to the package i18n instance:

```typescript
import { addTranslationResources } from '@umituz/react-native-localization';

// In your project's i18n config
const projectTranslations = require('./locales/en-US');

addTranslationResources({
  'en-US': {
    translation: projectTranslations.default || projectTranslations,
  },
  // Add other languages as needed
});
```

This ensures all translations work through the same i18n instance, preventing conflicts.

### Step 7: Translation Management

#### Adding New Translations

1. **Create JSON file** in `src/domains/localization/infrastructure/locales/en-US/`
2. **Add translations** following flat or nested structure
3. **Auto-loading** happens automatically via `index.ts`

#### Translation File Structure

**Flat Structure (Recommended for simple features):**
```json
// settings.json
{
  "title": "Settings",
  "language": "Language",
  "theme": "Theme",
  "notifications": "Notifications"
}
```

**Nested Structure (For complex features):**
```json
// auth.json
{
  "login": {
    "title": "Welcome Back",
    "email": "Email Address",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "signIn": "Sign In"
  },
  "register": {
    "title": "Create Account",
    "confirmPassword": "Confirm Password",
    "signUp": "Sign Up"
  }
}
```

#### Usage in Components

```tsx
// Flat structure
t('settings.title') // "Settings"

// Nested structure
t('auth.login.title') // "Welcome Back"
t('auth.register.signUp') // "Sign Up"
```

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

<<<<<<< HEAD
### Project-Specific Translations
=======
### Locale Loaders Generation

The package includes a script to automatically generate locale loader files (`index.ts`) for all language directories. This script scans all JSON translation files and creates proper TypeScript import statements.

**Generate loaders for all languages:**

```bash
npm run locales:generate
```

**Generate loader for a specific language:**

```bash
npm run locales:generate:lang en-US
npm run locales:generate:lang tr-TR
```

This will create an `index.ts` file in each locale directory that imports all JSON translation files. The generated files should not be edited manually.

### Custom Translations
>>>>>>> 5546c313bf9daab92c37ccf9b442a19a399a52c2

The package includes common translations. For project-specific translations:

1. **Create your translation files** in your project:
   ```
   src/domains/localization/infrastructure/locales/
     en-US/
       myFeature.json
       auth.json
     tr-TR/
       myFeature.json
       auth.json
   ```

2. **Load project translations** in your app initialization:
   ```tsx
   import { i18n } from '@umituz/react-native-localization';
   import myFeatureEnUS from './locales/en-US/myFeature.json';
   import myFeatureTrTR from './locales/tr-TR/myFeature.json';
   
   // Add project translations
   i18n.addResources('en-US', 'translation', myFeatureEnUS);
   i18n.addResources('tr-TR', 'translation', myFeatureTrTR);
   ```

3. **Use in components**:
   ```tsx
   const { t } = useLocalization();
   console.log(t('myFeature.title')); // 'My Feature'
   ```

### Translation Management Scripts

The package includes scripts for managing translations:

```bash
# Setup language directories (creates all language folders from en-US)
npm run i18n:setup

# Translate missing keys using Google Translate
npm run i18n:translate

# Check translation completeness
npm run i18n:check <language-code>
npm run i18n:check all  # Check all languages

# Remove unused translation keys
npm run i18n:remove-unused <language-code>
npm run i18n:remove-unused --all  # Remove from all languages
```

**Workflow:**
1. Add new keys to `en-US/*.json` files
2. Run `npm run i18n:setup` to create language directories
3. Run `npm run i18n:translate` to auto-translate missing keys
4. Run `npm run i18n:check all` to verify completeness
5. Review and refine translations manually if needed

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
