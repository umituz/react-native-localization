/**
 * Tests for LanguageSwitcher component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LanguageSwitcher } from '../src/infrastructure/components/LanguageSwitcher';

// Mock hooks
jest.mock('../src/infrastructure/hooks/useLocalization', () => ({
  useLocalization: () => ({
    currentLanguage: 'en-US',
  }),
}));

jest.mock('../src/infrastructure/config/languagesData', () => ({
  languageRegistry: {
    getLanguageByCode: jest.fn((code) => ({
      code,
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
  const defaultProps = {
    testID: 'language-switcher',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with flag', () => {
    const { getByTestId, getByText } = render(
      <LanguageSwitcher {...defaultProps} showFlag />
    );

    expect(getByTestId('language-switcher')).toBeTruthy();
    expect(getByText('🇺🇸')).toBeTruthy();
  });

  it('should render correctly with name', () => {
    const { getByTestId, getByText } = render(
      <LanguageSwitcher {...defaultProps} showName />
    );

    expect(getByTestId('language-switcher')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
  });

  it('should render correctly with both flag and name', () => {
    const { getByTestId, getByText } = render(
      <LanguageSwitcher {...defaultProps} showFlag showName />
    );

    expect(getByTestId('language-switcher')).toBeTruthy();
    expect(getByText('🇺🇸')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
  });

  it('should render default icon when neither flag nor name shown', () => {
    const { getByTestId, getByText } = render(
      <LanguageSwitcher {...defaultProps} showFlag={false} showName={false} />
    );

    expect(getByTestId('language-switcher')).toBeTruthy();
    expect(getByText('🌐')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('language-switcher'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByTestId('language-switcher'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const customTextStyle = { color: 'blue' };
    
    const { getByTestId, getByText } = render(
      <LanguageSwitcher
        {...defaultProps}
        showFlag
        style={customStyle}
        textStyle={customTextStyle}
      />
    );

    const container = getByTestId('language-switcher');
    const flag = getByText('🇺🇸');
    
    expect(container.props.style). expect.arrayContaining([customStyle]);
    expect(flag.props.style). expect.arrayContaining([customTextStyle]);
  });

  it('should apply custom color', () => {
    const { getByText } = render(
      <LanguageSwitcher {...defaultProps} showName color="#ff0000" />
    );

    const nameText = getByText('English');
    expect(nameText.props.style). expect.arrayContaining([{ color: '#ff0000' }]);
  });

  it('should have correct accessibility properties', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} accessibilityLabel="Language selector" />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.accessible).toBe(true);
    expect(switcher.props.accessibilityRole).toBe('button');
    expect(switcher.props.accessibilityLabel).toBe('Language selector');
  });

  it('should have correct accessibility hint when not disabled', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.accessibilityHint).toBe('Double tap to change language');
  });

  it('should not have accessibility hint when disabled', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} disabled />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.accessibilityHint).toBeUndefined();
  });

  it('should have disabled styling when disabled', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} disabled />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.style). expect.arrayContaining([{ opacity: 0.5 }]);
  });

  it('should have correct active opacity', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.activeOpacity).toBe(0.7);
  });

  it('should have active opacity of 1 when disabled', () => {
    const { getByTestId } = render(
      <LanguageSwitcher {...defaultProps} disabled />
    );

    const switcher = getByTestId('language-switcher');
    expect(switcher.props.activeOpacity).toBe(1);
  });
});