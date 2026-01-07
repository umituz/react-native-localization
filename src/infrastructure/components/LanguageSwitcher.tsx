/**
 * Language Switcher Component
 * Displays current language and allows switching
 */

import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
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

const renderContent = (
  showFlag: boolean,
  showName: boolean,
  flag: string | undefined,
  nativeName: string,
  color: string | undefined,
  iconStyle: any,
  textStyle: any
) => {
  if (showFlag && showName) {
    return (
      <>
        <Text style={[styles.flag, iconStyle]}>{flag}</Text>
        <Text style={[styles.languageName, { color }, textStyle]}>
          {nativeName}
        </Text>
      </>
    );
  }

  if (showFlag) {
    return <Text style={[styles.flag, iconStyle]}>{flag}</Text>;
  }

  if (showName) {
    return (
      <Text style={[styles.languageName, { color }, textStyle]}>
        {nativeName}
      </Text>
    );
  }

  return <Text style={[styles.icon, { color }, iconStyle]}>🌐</Text>;
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

  const accessibilityProps = useMemo(() => ({
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel || `Current language: ${currentLang.nativeName}`,
    accessibilityHint: disabled ? undefined : 'Double tap to change language',
    accessible: true,
  }), [accessibilityLabel, currentLang.nativeName, disabled]);

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : DEFAULT_CONFIG_VALUES.activeOpacity}
      hitSlop={DEFAULT_CONFIG_VALUES.hitSlop}
      testID={testID}
      disabled={disabled}
      {...accessibilityProps}
    >
      {renderContent(showFlag, showName, currentLang.flag, currentLang.nativeName, color, iconStyle, textStyle)}
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;
