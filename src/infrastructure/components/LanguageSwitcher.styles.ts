/**
 * Language Switcher Component Styles
 */

import { StyleSheet } from 'react-native';

const DEFAULT_CONFIG = {
  defaultIconSize: 20,
};

export const styles = StyleSheet.create({
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

export const DEFAULT_CONFIG_VALUES = {
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 } as const,
  activeOpacity: 0.7,
};
