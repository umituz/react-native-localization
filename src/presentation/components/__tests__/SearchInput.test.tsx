/**
 * Search Input Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render with placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Search languages..."
      />
    );

    expect(getByPlaceholderText('Search languages...')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Search languages..."
      />
    );

    fireEvent.changeText(getByPlaceholderText('Search languages...'), 'test');
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should show clear button when text is present', () => {
    const { getByText } = render(
      <SearchInput
        value="test"
        onChange={mockOnChange}
        placeholder="Search languages..."
      />
    );

    expect(getByText('✕')).toBeTruthy();
  });

  it('should not show clear button when text is empty', () => {
    const { queryByText } = render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Search languages..."
      />
    );

    expect(queryByText('✕')).toBeFalsy();
  });

  it('should clear text when clear button is pressed', () => {
    const { getByText } = render(
      <SearchInput
        value="test"
        onChange={mockOnChange}
        placeholder="Search languages..."
      />
    );

    fireEvent.press(getByText('✕'));
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should apply custom styles', () => {
    const customStyles = {
      searchContainer: { backgroundColor: 'red' },
      searchInput: { fontSize: 20 },
    };

    const { getByPlaceholderText } = render(
      <SearchInput
        value=""
        onChange={mockOnChange}
        placeholder="Search languages..."
        customStyles={customStyles}
      />
    );

    expect(getByPlaceholderText('Search languages...')).toBeTruthy();
  });
});