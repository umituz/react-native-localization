/**
 * Language Selection Screen
 * Generic language selector with search functionality
 */

import React from 'react';
import { FlatList } from 'react-native';
// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
// @ts-ignore - Optional peer dependency
import { 
  useAppDesignTokens, 
  SearchBar, 
  ScreenLayout,
  NavigationHeader
} from '@umituz/react-native-design-system';
import { useLanguageSelection } from '../../infrastructure/hooks/useLanguageSelection';
import { LanguageItem } from '../components/LanguageItem';
import type { Language } from '../../infrastructure/storage/types/Language';
import { styles } from './LanguageSelectionScreen.styles';

interface LanguageSelectionScreenProps {
  renderLanguageItem?: (item: Language, isSelected: boolean, onSelect: (code: string) => void) => React.ReactNode;
  renderSearchInput?: (value: string, onChange: (value: string) => void, placeholder: string) => React.ReactNode;
  headerTitle?: string;
  onBackPress?: () => void;
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
  searchPlaceholder?: string;
  testID?: string;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  renderLanguageItem,
  renderSearchInput,
  headerTitle,
  onBackPress,
  styles: customStyles,
  searchPlaceholder = "settings.languageSelection.searchPlaceholder",
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
      navigation.goBack();
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

