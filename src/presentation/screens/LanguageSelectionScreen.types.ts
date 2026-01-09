/**
 * Language Selection Screen Types
 */

import type { Language } from '../../infrastructure/storage/types/Language';

export interface LanguageSelectionScreenProps {
  renderLanguageItem?: (item: Language, isSelected: boolean, onSelect: (code: string) => void) => React.ReactNode;
  renderSearchInput?: (value: string, onChange: (value: string) => void, placeholder: string) => React.ReactNode;
  headerTitle?: string;
  onBackPress?: () => void;
  styles?: {
    container?: object;
    searchContainer?: object;
    languageItem?: object;
    languageContent?: object;
    languageText?: object;
    flag?: object;
    nativeName?: object;
    searchInput?: object;
    searchIcon?: object;
    clearButton?: object;
    listContent?: object;
  };
  searchPlaceholder?: string;
  testID?: string;
}
