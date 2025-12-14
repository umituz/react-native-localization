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
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
// @ts-ignore - Optional peer dependency
import { useAppDesignTokens } from '@umituz/react-native-design-system-theme';
import type { Language } from '../../infrastructure/storage/types/LocalizationState';

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
      backgroundColor: tokens.colors.backgroundSecondary,
      borderColor: tokens.colors.border,
    } as ViewStyle,
    selectedLanguageItem: {
      borderColor: tokens.colors.primary,
      backgroundColor: tokens.colors.primaryLight,
    } as ViewStyle,
    nativeName: {
      color: tokens.colors.textPrimary,
    } as TextStyle,
    languageName: {
      color: tokens.colors.textSecondary,
    } as TextStyle,
    checkIcon: {
      color: tokens.colors.primary,
    } as TextStyle,
  }), [tokens]);

  return (
    <TouchableOpacity
      testID="language-item-test"
      style={[
        styles.languageItem,
        themedStyles.languageItem,
        customStyles?.languageItem,
        isSelected ? [styles.selectedLanguageItem, themedStyles.selectedLanguageItem] : undefined,
      ]}
      onPress={() => onSelect(item.code)}
      activeOpacity={0.7}
    >
      <View style={[styles.languageContent, customStyles?.languageContent]}>
        <Text style={[styles.flag, customStyles?.flag]}>
          {item.flag || '🌐'}
        </Text>
        <View style={[styles.languageText, customStyles?.languageText]}>
          <Text style={[styles.nativeName, themedStyles.nativeName, customStyles?.nativeName]}>
            {item.nativeName}
          </Text>
          <Text style={[styles.languageName, themedStyles.languageName, customStyles?.nativeName]}>
            {item.name}
          </Text>
        </View>
      </View>
      {isSelected && (
        <Text style={[styles.checkIcon, themedStyles.checkIcon, customStyles?.flag]}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedLanguageItem: {
    borderWidth: 2,
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
    marginBottom: 2,
  },
  languageName: {
    fontSize: 14,
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});