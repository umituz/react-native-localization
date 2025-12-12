/**
 * Search Input Component
 * 
 * Renders search input for language filtering
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  customStyles?: {
    searchContainer?: any;
    searchInput?: any;
    searchIcon?: any;
    clearButton?: any;
  };
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  customStyles,
}) => {
  return (
    <View style={[styles.searchContainer, customStyles?.searchContainer]}>
      <Text style={[styles.searchIcon, customStyles?.searchIcon]}>🔍</Text>
      <TextInput
        style={[styles.searchInput, customStyles?.searchInput]}
        placeholder={placeholder}
        placeholderTextColor="#666"
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
          <Text style={[styles.clearIcon, customStyles?.searchIcon]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#666',
  },
});