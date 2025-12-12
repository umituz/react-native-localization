/**
 * Language Selection Screen Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LanguageSelectionScreen } from '../LanguageSelectionScreen';
import { useLocalization } from '../../infrastructure/hooks/useLocalization';
import { searchLanguages } from '../../infrastructure/config/languagesData';

// Mock dependencies
jest.mock('../../infrastructure/hooks/useLocalization');
jest.mock('../../infrastructure/config/languagesData');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

const mockUseLocalization = useLocalization as jest.MockedFunction<typeof useLocalization>;
const mockSearchLanguages = searchLanguages as jest.MockedFunction<typeof searchLanguages>;

const mockLanguage = {
  code: 'en-US',
  name: 'English',
  nativeName: 'English',
  flag: '🇺🇸',
  isRTL: false,
};

describe('LanguageSelectionScreen', () => {
  const mockSetLanguage = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseLocalization.mockReturnValue({
      currentLanguage: 'en-US',
      setLanguage: mockSetLanguage,
      t: jest.fn(),
    } as any);

    mockSearchLanguages.mockReturnValue([mockLanguage]);
  });

  it('should render search input and language list', () => {
    const { getByPlaceholderText, getByText } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
      />
    );

    expect(getByPlaceholderText('Search languages...')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('🇺🇸')).toBeTruthy();
  });

  it('should filter languages when searching', () => {
    const { getByPlaceholderText } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
      />
    );

    fireEvent.changeText(getByPlaceholderText('Search languages...'), 'test');
    expect(mockSearchLanguages).toHaveBeenCalledWith('test');
  });

  it('should select language when item is pressed', async () => {
    const { getByText } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
      />
    );

    fireEvent.press(getByText('English'));
    expect(mockSetLanguage).toHaveBeenCalledWith('en-US');
  });

  it('should show check icon for selected language', () => {
    const { getByText } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
      />
    );

    expect(getByText('✓')).toBeTruthy();
  });

  it('should use custom render function when provided', () => {
    const customRender = jest.fn().mockReturnValue(<div>Custom Item</div>);
    
    render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
        renderLanguageItem={customRender}
      />
    );

    expect(customRender).toHaveBeenCalledWith(
      mockLanguage,
      true,
      expect.any(Function)
    );
  });

  it('should use custom search input when provided', () => {
    const customSearchInput = jest.fn().mockReturnValue(<div>Custom Search</div>);
    
    render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
        renderSearchInput={customSearchInput}
      />
    );

    expect(customSearchInput).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      'Search languages...'
    );
  });

  it('should use custom container when provided', () => {
    const CustomContainer = ({ children }: { children: React.ReactNode }) => (
      <div testID="custom-container">{children}</div>
    );
    
    const { getByTestId } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
        containerComponent={CustomContainer}
      />
    );

    expect(getByTestId('custom-container')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyles = {
      container: { backgroundColor: 'red' },
      languageItem: { borderColor: 'blue' },
    };

    const { getByTestId } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
        styles={customStyles}
      />
    );

    expect(getByTestId('language-selection-screen')).toHaveStyle({ backgroundColor: 'red' });
  });

  it('should use custom test ID when provided', () => {
    const { getByTestId } = render(
      <LanguageSelectionScreen
        searchPlaceholder="Search languages..."
        testID="custom-test-id"
      />
    );

    expect(getByTestId('custom-test-id')).toBeTruthy();
  });
});