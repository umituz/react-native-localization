/**
 * Language Selection Screen
 *
 * Language picker with search functionality
 *
 * Generic language selector that can be customized by consuming applications
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization, searchLanguages, Language } from '../../index';
import { LanguageItem } from '../components/LanguageItem';
import { SearchInput } from '../components/SearchInput';

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
  searchPlaceholder: string;
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
  searchPlaceholder,
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

  const renderItem = ({ item }: { item: Language }) => {
    const isSelected = selectedCode === item.code;

    if (renderLanguageItem) {
      const customItem = renderLanguageItem(item, isSelected, handleLanguageSelect);
      return <>{customItem}</>;
    }

    return (
      <LanguageItem
        item={item}
        isSelected={isSelected}
        onSelect={handleLanguageSelect}
        customStyles={customStyles}
      />
    );
  };

  const renderSearchInputComponent = () => {
    if (renderSearchInput) {
      return renderSearchInput(searchQuery, setSearchQuery, searchPlaceholder);
    }

    return (
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={searchPlaceholder}
        customStyles={customStyles}
      />
    );
  };

  const content = (
    <View style={[styles.container, customStyles?.container]} testID={testID}>
      {renderSearchInputComponent()}
      <FlatList
        data={filteredLanguages}
        renderItem={renderItem}
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
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});

export default LanguageSelectionScreen;