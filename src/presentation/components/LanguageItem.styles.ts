/**
 * Language Item Component Styles
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
