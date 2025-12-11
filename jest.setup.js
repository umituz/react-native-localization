/**
 * Jest setup file
 */

import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo-localization
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  getLocales: () => [{ languageCode: 'en', textDirection: 'ltr' }],
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock i18next
jest.mock('i18next', () => ({
  init: jest.fn(() => Promise.resolve()),
  t: jest.fn((key) => key),
  changeLanguage: jest.fn(() => Promise.resolve()),
  language: 'en-US',
  isInitialized: true,
  hasResourceBundle: jest.fn(() => false),
  getResourceBundle: jest.fn(() => ({})),
  addResourceBundle: jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: jest.fn((key) => key),
    i18n: {
      changeLanguage: jest.fn(() => Promise.resolve()),
      language: 'en-US',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock Zustand
jest.mock('zustand', () => ({
  create: jest.fn((createFn) => {
    const initialState = createFn(
      jest.fn(),
      jest.fn(() => ({}))
    );
    return jest.fn(() => initialState);
  }),
}));

// Global test utilities
global.__DEV__ = true;

// Silence console warnings in tests
if (__DEV__) {
  console.warn = jest.fn();
  console.error = jest.fn();
}