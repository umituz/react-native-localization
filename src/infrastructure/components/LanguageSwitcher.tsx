import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '../storage/LocalizationStore';
import { getLanguageByCode, getDefaultLanguage } from '../config/languages';
import { Language } from '../../domain/repositories/ILocalizationRepository';

interface LanguageSwitcherProps {
  showName?: boolean;
  showFlag?: boolean;
  color?: string;
  navigationScreen?: string;
  style?: any;
  textStyle?: any;
}

const languageSwitcherConfig = {
  defaultIconSize: 20,
  defaultNavigationScreen: 'LanguageSelection',
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showName = false,
  showFlag = true,
  color,
  navigationScreen = languageSwitcherConfig.defaultNavigationScreen,
  style,
  textStyle,
}) => {
  const navigation = useNavigation();
  const { currentLanguage } = useLocalization();
  const currentLang = getLanguageByCode(currentLanguage) || getDefaultLanguage();

  const navigateToLanguageSelection = () => {
    if (navigation && navigationScreen) {
      navigation.navigate(navigationScreen as never);
    }
  };

  const iconColor = color || '#000000';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={navigateToLanguageSelection}
      activeOpacity={0.7}
      hitSlop={languageSwitcherConfig.hitSlop}
    >
      {showFlag && (
        <Text style={[styles.flag, textStyle]}>{currentLang.flag}</Text>
      )}
      {showName && (
        <Text style={[styles.languageName, { color: iconColor }, textStyle]}>
          {currentLang.nativeName}
        </Text>
      )}
      {!showName && !showFlag && (
        <Text style={[styles.icon, { color: iconColor }]}>🌐</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  flag: {
    fontSize: 20,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
  },
});

export default LanguageSwitcher;

