/**
 * Language Switcher Component
 * Displays current language and allows switching
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
// @ts-ignore - Optional peer dependency
import { useAppDesignTokens, AtomicText } from '@umituz/react-native-design-system';
import { useLanguageSwitcher } from './useLanguageSwitcher';
import { styles, DEFAULT_CONFIG_VALUES } from './LanguageSwitcher.styles';

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
  const tokens = useAppDesignTokens();
  const { currentLang, handlePress } = useLanguageSwitcher({ onPress, disabled });

  const accessibilityProps = useMemo(() => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || `Current language: ${currentLang.nativeName}`,
    accessibilityHint: disabled ? undefined : 'Double tap to change language',
    accessible: true,
  }), [accessibilityLabel, currentLang.nativeName, disabled]);

  const textColor = color || tokens.colors.textPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { gap: tokens.spacing.xs },
        style, 
        disabled && styles.disabled
      ]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : DEFAULT_CONFIG_VALUES.activeOpacity}
      hitSlop={DEFAULT_CONFIG_VALUES.hitSlop}
      testID={testID}
      disabled={disabled}
      {...accessibilityProps}
    >
      {showFlag && (
        <AtomicText style={[styles.flag, iconStyle]}>
          {currentLang.flag || '🌐'}
        </AtomicText>
      )}
      {showName && (
        <AtomicText 
          type="bodySmall" 
          style={[styles.languageName, { color: textColor, fontWeight: '600' }, textStyle]}
        >
          {currentLang.nativeName}
        </AtomicText>
      )}
      {!showFlag && !showName && (
        <AtomicText style={[styles.icon, { color: textColor }, iconStyle]}>
          🌐
        </AtomicText>
      )}
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;

