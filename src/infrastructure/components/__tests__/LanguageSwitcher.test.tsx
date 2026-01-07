/**
 * Simple tests for LanguageSwitcher component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { LanguageSwitcher } from '../LanguageSwitcher';

// Mock React Native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: jest.fn(() => ({})),
    flatten: jest.fn((styles) => styles),
  },
}));

// Mock hooks
jest.mock('../../hooks/useLocalization', () => ({
  useLocalization: () => ({
    currentLanguage: 'en-US',
  }),
}));

jest.mock('../../repository/LanguageRepository', () => ({
  languageRepository: {
    getLanguageByCode: jest.fn(() => ({
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    })),
    getDefaultLanguage: () => ({
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    }),
  },
}));

describe('LanguageSwitcher', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <LanguageSwitcher testID="language-switcher" />
    );

    expect(getByTestId('language-switcher')).toBeTruthy();
  });

  it('should render with flag', () => {
    const { getByText } = render(
      <LanguageSwitcher testID="language-switcher" showFlag />
    );

    expect(getByText('🇺🇸')).toBeTruthy();
  });

  it('should render with name', () => {
    const { getByText } = render(
      <LanguageSwitcher testID="language-switcher" showName />
    );

    expect(getByText('English')).toBeTruthy();
  });

  it('should handle onPress', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <LanguageSwitcher testID="language-switcher" onPress={mockOnPress} />
    );

    // Simulate press
    const component = getByTestId('language-switcher');
    component.props.onPress();
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be accessible', () => {
    const { getByTestId } = render(
      <LanguageSwitcher testID="language-switcher" />
    );

    const component = getByTestId('language-switcher');
    expect(component.props.accessible).toBe(true);
    expect(component.props.accessibilityRole).toBe('button');
  });
});