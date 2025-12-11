/**
 * Language Selection Screen
 *
 * Language picker with search functionality
 *
 * App Factory - Universal Language Selector
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Text,
} from 'react-native';
// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization, searchLanguages, Language, LANGUAGES } from '@umituz/react-native-localization';

interface LanguageSelectionScreenProps {
  /**
   * Custom component for rendering language items
   */
  renderLanguageItem?: (item: Language, isSelected: boolean, onSelect: (code: string) => void) => React.ReactNode;
  /**
   * Custom component for search input
   */
  renderSearchInput?: (value: string, onChange: (value: string) => void, placeholder: string) => React.ReactNode;
  /**
   * Custom component for container
   */
  containerComponent?: React.ComponentType<{ children: React.ReactNode }>;
  /**
   * Custom styles
   */
  styles?: {
    container?: any;
    searchContainer?: any;
    languageItem?: any;
    languageContent?: any;
    languageText?: any;
    flag?: any;
    nativeName?: any;
    searchInput?: any;
    searchIcon?: any;
    clearButton?: any;
    listContent?: any;
  };
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Language Selection Screen Component
 * Generic language selector that can be customized by consuming applications
 */
export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  renderLanguageItem,
  renderSearchInput,
  containerComponent: Container,
  styles: customStyles,
  searchPlaceholder = 'Search languages...',
  testID = 'language-selection-screen',
}) => {
  const navigation = useNavigation();
  const { t, currentLanguage, setLanguage } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(currentLanguage);

  const filteredLanguages = useMemo(() => {
    return searchLanguages(searchQuery);
  }, [searchQuery]);

  const handleLanguageSelect = async (code: string) => {
    setSelectedCode(code);
    await setLanguage(code);
    navigation.goBack();
  };

  const defaultRenderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = selectedCode === item.code;

    if (renderLanguageItem) {
      return renderLanguageItem(item, isSelected, handleLanguageSelect);
    }

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          customStyles?.languageItem,
          isSelected && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.7}
      >
        <View style={[styles.languageContent, customStyles?.languageContent]}>
          <Text style={[styles.flag, customStyles?.flag]}>
            {item.flag || '🌐'}
          </Text>
          <View style={[styles.languageText, customStyles?.languageText]}>
            <Text style={[styles.nativeName, customStyles?.nativeName]}>
              {item.nativeName}
            </Text>
            <Text style={[styles.languageName, customStyles?.nativeName]}>
              {item.name}
            </Text>
          </View>
        </View>
        {isSelected && (
          <Text style={[styles.checkIcon, customStyles?.flag]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  const defaultRenderSearchInput = () => {
    if (renderSearchInput) {
      return renderSearchInput(searchQuery, setSearchQuery, searchPlaceholder);
    }

    return (
      <View style={[styles.searchContainer, customStyles?.searchContainer]}>
        <Text style={[styles.searchIcon, customStyles?.searchIcon]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, customStyles?.searchInput]}
          placeholder={searchPlaceholder}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={[styles.clearButton, customStyles?.clearButton]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.clearIcon, customStyles?.searchIcon]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const content = (
    <View style={[styles.container, customStyles?.container]} testID={testID}>
      {defaultRenderSearchInput()}
      <FlatList
        data={filteredLanguages}
        renderItem={defaultRenderLanguageItem}
        keyExtractor={item => item.code}
        contentContainerStyle={[styles.listContent, customStyles?.listContent]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );

  return Container ? <Container>{content}</Container> : content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedLanguageItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 14,
    color: '#666',
  },
  checkIcon: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default LanguageSelectionScreen;

