/**
 * Language Selection Screen
 * Generic language selector with search functionality
 */

import React from 'react';
import { FlatList } from 'react-native';
// @ts-ignore - Optional peer dependency
import {
  useAppDesignTokens,
  SearchBar,
  ScreenLayout,
  NavigationHeader,
  AppNavigation,
} from '@umituz/react-native-design-system';
import { useLanguageSelection } from '../../infrastructure/hooks/useLanguageSelection';
import { LanguageItem } from '../components/LanguageItem';
import type { Language } from '../../infrastructure/storage/types/Language';
import type { LanguageSelectionScreenProps } from './LanguageSelectionScreen.types';
import { styles } from './LanguageSelectionScreen.styles';

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  renderLanguageItem,
  renderSearchInput,
  headerTitle,
  onBackPress,
  styles: customStyles,
  searchPlaceholder = "settings.languageSelection.searchPlaceholder",
  testID = 'language-selection-screen',
}) => {
  const tokens = useAppDesignTokens();
  const {
    searchQuery,
    setSearchQuery,
    selectedCode,
    filteredLanguages,
    handleLanguageSelect,
  } = useLanguageSelection();

  const onSelect = async (code: string) => {
    await handleLanguageSelect(code, () => AppNavigation.goBack());
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
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={searchPlaceholder}
        containerStyle={[
          { marginBottom: tokens.spacing.md },
          customStyles?.searchContainer
        ]}
        inputStyle={customStyles?.searchInput}
      />
    );
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      AppNavigation.goBack();
    }
  };

  return (
    <ScreenLayout
      testID={testID}
      scrollable={false}
      edges={['top', 'bottom', 'left', 'right']}
      backgroundColor={tokens.colors.backgroundPrimary}
      header={
        <NavigationHeader 
          title={headerTitle || ""} 
          onBackPress={handleBack} 
        />
      }
      containerStyle={customStyles?.container}
    >
      {renderSearchComponent()}
      <FlatList
        data={filteredLanguages}
        renderItem={renderItem}
        keyExtractor={item => item.code}
        contentContainerStyle={[
          styles.listContent, 
          { paddingBottom: tokens.spacing.xl },
          customStyles?.listContent
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </ScreenLayout>
  );
};

export default LanguageSelectionScreen;

