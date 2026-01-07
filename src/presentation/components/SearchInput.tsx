/**
 * Search Input Component
 *
 * Renders search input for language filtering
 * Theme-aware component that adapts to light/dark mode
 */

import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// @ts-ignore - Optional peer dependency
import { useAppDesignTokens } from '@umituz/react-native-design-system';
import { styles } from './SearchInput.styles';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  customStyles?: {
    searchContainer?: StyleProp<ViewStyle>;
    searchInput?: StyleProp<TextStyle>;
    searchIcon?: StyleProp<TextStyle>;
    clearButton?: StyleProp<ViewStyle>;
  };
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  customStyles,
}) => {
  const tokens = useAppDesignTokens();

  const themedStyles = useMemo(() => ({
    searchContainer: {
      backgroundColor: tokens.colors.backgroundSecondary,
      borderColor: tokens.colors.border,
    } as ViewStyle,
    searchInput: {
      color: tokens.colors.textPrimary,
    } as TextStyle,
    clearIcon: {
      color: tokens.colors.textSecondary,
    } as TextStyle,
  }), [tokens]);

  return (
    <View style={[styles.searchContainer, themedStyles.searchContainer, customStyles?.searchContainer]}>
      <Text style={[styles.searchIcon, customStyles?.searchIcon]}>🔍</Text>
      <TextInput
        style={[styles.searchInput, themedStyles.searchInput, customStyles?.searchInput]}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.textTertiary}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange('')}
          style={[styles.clearButton, customStyles?.clearButton]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.clearIcon, themedStyles.clearIcon, customStyles?.searchIcon]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
