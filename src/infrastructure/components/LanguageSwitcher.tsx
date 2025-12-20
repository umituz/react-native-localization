/**
 * Language Switcher Component
 * Displays current language and allows switching
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguageSwitcher } from './useLanguageSwitcher';

export interface LanguageSwitcherProps {
  showName?: boolean;
  showFlag?: boolean;
  color?: string;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
  iconStyle?: any;
  testID?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const DEFAULT_CONFIG = {
  defaultIconSize: 20,
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 } as const,
  defaultColor: '#000000',
  activeOpacity: 0.7,
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showName = false,
  showFlag = true,
  color,
  onPress,
  style,
  textStyle,
  iconStyle,
  testID = 'language-switcher',
  disabled = false,
  accessibilityLabel,
}) => {
  const { currentLang, handlePress } = useLanguageSwitcher({ onPress, disabled });

  const iconColor = useMemo(() => color || DEFAULT_CONFIG.defaultColor, [color]);

  const accessibilityProps = useMemo(() => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || `Current language: ${currentLang.nativeName}`,
    accessibilityHint: disabled ? undefined : 'Double tap to change language',
    accessible: true,
  }), [accessibilityLabel, currentLang.nativeName, disabled]);

  const renderContent = () => {
    if (showFlag && showName) {
      return (
        <>
          <Text style={[styles.flag, iconStyle]}>{currentLang.flag}</Text>
          <Text style={[styles.languageName, { color: iconColor }, textStyle]}>
            {currentLang.nativeName}
          </Text>
        </>
      );
    }

    if (showFlag) {
      return <Text style={[styles.flag, iconStyle]}>{currentLang.flag}</Text>;
    }

    if (showName) {
      return (
        <Text style={[styles.languageName, { color: iconColor }, textStyle]}>
          {currentLang.nativeName}
        </Text>
      );
    }

    return <Text style={[styles.icon, { color: iconColor }, iconStyle]}>🌐</Text>;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : DEFAULT_CONFIG.activeOpacity}
      hitSlop={DEFAULT_CONFIG.hitSlop}
      testID={testID}
      disabled={disabled}
      {...accessibilityProps}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  flag: {
    fontSize: DEFAULT_CONFIG.defaultIconSize,
    textAlign: 'center',
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    fontSize: DEFAULT_CONFIG.defaultIconSize,
    textAlign: 'center',
  },
});

export default LanguageSwitcher;
