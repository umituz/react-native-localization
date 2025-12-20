/**
 * Jest setup file
 */

import React from 'react';

// Mock react-native modules
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    NativeModules: {
      RNCNetInfo: {
        getCurrentState: jest.fn(() => Promise.resolve()),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      },
    },
    View: ({ children, testID, ...props }) => React.createElement('View', { testID, ...props }, children),
    Text: ({ children, testID, ...props }) => React.createElement('Text', { testID, ...props }, children),
    TouchableOpacity: ({ children, testID, onPress, ...props }) =>
      React.createElement('TouchableOpacity', { testID, onPress, ...props }, children),
    TextInput: ({ testID, ...props }) => React.createElement('TextInput', { testID, ...props }),
    FlatList: ({ data, renderItem, keyExtractor, ...props }) =>
      React.createElement('FlatList', { data, renderItem, ...props },
        data && data.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          return React.createElement(React.Fragment, { key }, renderItem({ item, index }));
        })
      ),
    StyleSheet: {
      create: jest.fn(() => ({})),
      flatten: jest.fn((style) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.map(s => typeof s === 'object' ? s : {}));
        }
        return style;
      }),
    },
  };
});

// Mock expo-localization
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  getLocales: () => [{ languageCode: 'en', textDirection: 'ltr' }],
}));

// Mock AsyncStorage - remove this mock since it's not installed

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
    // Support curried version: create()(...) which passes undefined first
    if (!createFn) {
      return (actualCreateFn) => {
        const initialState = actualCreateFn(
          jest.fn(),
          jest.fn(() => ({}))
        );
        return jest.fn(() => initialState);
      };
    }
    // Support non-curried version: create(...)
    const initialState = createFn(
      jest.fn(),
      jest.fn(() => ({}))
    );
    return jest.fn(() => initialState);
  }),
}));

// Mock storage package
jest.mock('@umituz/react-native-storage', () => ({
  storageRepository: {
    getString: jest.fn(() => Promise.resolve(null)),
    setString: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
  },
}));

// Global test utilities
global.__DEV__ = true;

// Silence console warnings in tests
if (__DEV__) {
  console.warn = jest.fn();
  console.error = jest.fn();
}