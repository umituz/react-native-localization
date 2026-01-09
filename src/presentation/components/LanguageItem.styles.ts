/**
 * Language Item Component Styles
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
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
    flexShrink: 1,
  },
  nativeName: {
    // Styling moved to themedStyles in component for token support
  },
  languageName: {
    // Styling moved to themedStyles in component for token support
  },
  checkIcon: {
    // Replaced by AtomicIcon
  },
});

