/**
 * Language Selection Screen
 * Generic language selector with search functionality
 */

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useAppDesignTokens } from '@umituz/react-native-design-system';
import { useLanguageSelection } from '../../infrastructure/hooks/useLanguageSelection';
import { LanguageItem } from '../components/LanguageItem';
import { SearchInput } from '../components/SearchInput';
import type { Language } from '../../infrastructure/storage/types/LocalizationState';

interface LanguageSelectionScreenProps {
  renderLanguageItem?: (item: Language, isSelected: boolean, onSelect: (code: string) => void) => React.ReactNode;
  renderSearchInput?: (value: string, onChange: (value: string) => void, placeholder: string) => React.ReactNode;
  containerComponent?: React.ComponentType<{ children: React.ReactNode }>;
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
  searchPlaceholder: string;
  testID?: string;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  renderLanguageItem,
  renderSearchInput,
  containerComponent: Container,
  styles: customStyles,
  searchPlaceholder,
  testID = 'language-selection-screen',
}) => {
  const navigation = useNavigation();
  const tokens = useAppDesignTokens();
  const {
    searchQuery,
    setSearchQuery,
    selectedCode,
    filteredLanguages,
    handleLanguageSelect,
  } = useLanguageSelection();

  const onSelect = (code: string) => {
    handleLanguageSelect(code, () => navigation.goBack());
  };

  const renderItem = ({ item }: { item: Language }) => {
    const isSelected = selectedCode === item.code;

    if (renderLanguageItem) {
      return <>{renderLanguageItem(item, isSelected, onSelect)}</>;
    }

    return (
      <LanguageItem
        item={item}
        isSelected={isSelected}
        onSelect={onSelect}
        customStyles={customStyles}
      />
    );
  };

  const renderSearchComponent = () => {
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
    <View style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }, customStyles?.container]} testID={testID}>
      {renderSearchComponent()}
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