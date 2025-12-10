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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDesignTokens, withAlpha, STATIC_TOKENS, type DesignTokens } from '@umituz/react-native-design-system-theme';
import { AtomicIcon, AtomicText } from '@umituz/react-native-design-system-atoms';
import { ScreenLayout } from '@umituz/react-native-design-system-organisms';
import { useLocalization, searchLanguages, Language, LANGUAGES } from '@umituz/react-native-localization';

/**
 * Language Selection Screen Component
 */
export const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, currentLanguage, setLanguage } = useLocalization();
  const tokens = useAppDesignTokens();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(currentLanguage);
  const [isFocused, setIsFocused] = useState(false);

  const filteredLanguages = useMemo(() => {
    return searchLanguages(searchQuery);
  }, [searchQuery]);

  const handleLanguageSelect = async (code: string) => {
    setSelectedCode(code);
    await setLanguage(code);
    navigation.goBack();
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = selectedCode === item.code;

    return (
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.languageItem,
          {
            borderColor: isSelected
              ? tokens.colors.primary
              : tokens.colors.borderLight,
            backgroundColor: isSelected
              ? withAlpha(tokens.colors.primary, 0.1)
              : tokens.colors.surface,
          },
        ])}
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <AtomicText style={StyleSheet.flatten([STATIC_TOKENS.typography.headingLarge, styles.flag])}>
            {item.flag}
          </AtomicText>
          <View style={styles.languageText}>
            <AtomicText
              style={StyleSheet.flatten([
                STATIC_TOKENS.typography.bodyMedium,
                styles.nativeName,
              ])}
            >
              {item.nativeName}
            </AtomicText>
            <AtomicText style={StyleSheet.flatten([{ color: tokens.colors.textSecondary }])}>
              {item.name}
            </AtomicText>
          </View>
        </View>
        {isSelected && (
          <AtomicIcon
            name="CircleCheck"
            size="md"
            color="primary"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout scrollable={false} testID="language-selection-screen">
      {/* Search Input */}
      <View
        style={StyleSheet.flatten([
          styles.searchContainer,
          {
            borderColor: isFocused ? tokens.colors.primary : tokens.colors.borderLight,
            borderWidth: isFocused ? 2 : 1.5,
            backgroundColor: tokens.colors.surface,
          },
        ])}
      >
        <AtomicIcon
          name="Search"
          size="md"
          color="secondary"
          style={styles.searchIcon}
        />
        <TextInput
          style={StyleSheet.flatten([styles.searchInput, { color: tokens.colors.textPrimary }])}
          placeholder={t('settings.languageSelection.searchPlaceholder')}
          placeholderTextColor={tokens.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AtomicIcon
              name="X"
              size="sm"
              color="secondary"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Language List */}
      <FlatList
        data={filteredLanguages}
        renderItem={renderLanguageItem}
        keyExtractor={item => item.code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: STATIC_TOKENS.borders.radius.lg,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: STATIC_TOKENS.typography.bodyMedium.fontSize,
    padding: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: STATIC_TOKENS.spacing.xs,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: STATIC_TOKENS.spacing.md,
    borderRadius: STATIC_TOKENS.borders.radius.lg,
    borderWidth: 2,
    marginBottom: 8,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  flag: {
    fontSize: STATIC_TOKENS.typography.headingLarge.fontSize,
  },
  languageText: {
    flex: 1,
    gap: 2,
  },
  nativeName: {
    fontWeight: '600',
  },
});

export default LanguageSelectionScreen;

