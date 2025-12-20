/**
 * Language Item Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LanguageItem } from '../LanguageItem';
import type { Language } from '../../infrastructure/storage/types/LocalizationState';

const mockLanguage: Language = {
  code: 'en-US',
  name: 'English',
  nativeName: 'English',
  flag: '🇺🇸',
  isRTL: false,
};

describe('LanguageItem', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render language information correctly', () => {
    const { getAllByText } = render(
      <LanguageItem
        item={mockLanguage}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(getAllByText('English')).toHaveLength(2); // nativeName and name
    expect(getAllByText('🇺🇸')).toHaveLength(1);
  });

  it('should show check icon when selected', () => {
    const { getByText } = render(
      <LanguageItem
        item={mockLanguage}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('✓')).toBeTruthy();
  });

  it('should not show check icon when not selected', () => {
    const { queryByText } = render(
      <LanguageItem
        item={mockLanguage}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(queryByText('✓')).toBeFalsy();
  });

  it('should call onSelect when pressed', () => {
    const { getByTestId } = render(
      <LanguageItem
        item={mockLanguage}
        isSelected={false}
        onSelect={mockOnSelect}
        testID="language-item-test"
      />
    );

    fireEvent.press(getByTestId('language-item-test'));
    expect(mockOnSelect).toHaveBeenCalledWith('en-US');
  });

  it('should use default flag when none provided', () => {
    const languageWithoutFlag = { ...mockLanguage, flag: undefined };
    const { getByText } = render(
      <LanguageItem
        item={languageWithoutFlag}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('🌐')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyles = {
      languageItem: { backgroundColor: 'red' },
      flag: { fontSize: 30 },
    };

    const { getByTestId } = render(
      <LanguageItem
        item={mockLanguage}
        isSelected={false}
        onSelect={mockOnSelect}
        customStyles={customStyles}
      />
    );

    expect(getByTestId('language-item-test')).toBeTruthy();
  });
});