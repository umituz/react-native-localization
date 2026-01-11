/**
 * Language Item Component
 *
 * Renders a single language item in the language selection list
 * Theme-aware component that adapts to light/dark mode
 */

import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// @ts-ignore - Optional peer dependency
import { useAppDesignTokens, AtomicText, AtomicIcon } from '@umituz/react-native-design-system';
import type { Language } from '../../infrastructure/storage/types/Language';
import { styles } from './LanguageItem.styles';

interface LanguageItemProps {
  item: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
  customStyles?: {
    languageItem?: StyleProp<ViewStyle>;
    languageContent?: StyleProp<ViewStyle>;
    languageText?: StyleProp<ViewStyle>;
    flag?: StyleProp<TextStyle>;
    nativeName?: StyleProp<TextStyle>;
  };
}

export const LanguageItem: React.FC<LanguageItemProps> = ({
  item,
  isSelected,
  onSelect,
  customStyles,
}) => {
  const tokens = useAppDesignTokens();

  const themedStyles = useMemo(() => ({
    languageItem: {
      padding: tokens.spacing.md,
      borderRadius: tokens.borders.radius.md,
      backgroundColor: tokens.colors.backgroundSecondary,
      borderColor: tokens.colors.border,
      marginBottom: tokens.spacing.sm,
    } as ViewStyle,
    selectedLanguageItem: {
      borderColor: tokens.colors.primary,
      backgroundColor: tokens.colors.primaryContainer,
      borderWidth: 2,
    } as ViewStyle,
    nativeName: {
      color: tokens.colors.textPrimary,
      marginBottom: tokens.spacing.xs / 2,
    } as TextStyle,
    languageName: {
      color: tokens.colors.textSecondary,
    } as TextStyle,
  }), [tokens]);

  return (
    <TouchableOpacity
      testID="language-item-test"
      style={[
        styles.languageItem,
        themedStyles.languageItem,
        isSelected ? [styles.selectedLanguageItem, themedStyles.selectedLanguageItem] : undefined,
        customStyles?.languageItem,
      ]}
      onPress={() => {
        if (__DEV__) {
          console.log('[LanguageItem] TouchableOpacity pressed:', item.code, item.nativeName);
        }
        onSelect(item.code);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.languageContent, customStyles?.languageContent]}>
        <AtomicText style={[styles.flag, customStyles?.flag]}>
          {item.flag || '🌐'}
        </AtomicText>
        <View style={[styles.languageText, { gap: tokens.spacing.xs / 2 }, customStyles?.languageText]}>
          <AtomicText 
            type="bodyMedium" 
            style={[themedStyles.nativeName, { fontWeight: '700' }, customStyles?.nativeName]}
          >
            {item.nativeName}
          </AtomicText>
          <AtomicText 
            type="labelMedium" 
            style={[themedStyles.languageName, customStyles?.nativeName]}
          >
            {item.name}
          </AtomicText>
        </View>
      </View>
      {isSelected && (
        <AtomicIcon name="checkmark" size="sm" color="primary" />
      )}
    </TouchableOpacity>
  );
};

