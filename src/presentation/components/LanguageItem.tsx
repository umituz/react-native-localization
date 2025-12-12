/**
 * Language Item Component
 * 
 * Renders a single language item in the language selection list
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import type { Language } from '../../infrastructure/storage/types/LocalizationState';

interface LanguageItemProps {
  item: Language;
  isSelected: boolean;
  onSelect: (code: string) => void;
  customStyles?: {
    languageItem?: any;
    languageContent?: any;
    languageText?: any;
    flag?: any;
    nativeName?: any;
  };
}

export const LanguageItem: React.FC<LanguageItemProps> = ({
  item,
  isSelected,
  onSelect,
  customStyles,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.languageItem,
        customStyles?.languageItem,
        isSelected && styles.selectedLanguageItem,
      ]}
      onPress={() => onSelect(item.code)}
      activeOpacity={0.7}
    >
      <View style={[styles.languageContent, customStyles?.languageContent]}>
        <Text style={[styles.flag, customStyles?.flag]}>
          {item.flag || '🌐'}
        </Text>
        <View style={[styles.languageText, customStyles?.languageText]}>
          <Text style={[styles.nativeName, customStyles?.nativeName]}>
            {item.nativeName}
          </Text>
          <Text style={[styles.languageName, customStyles?.nativeName]}>
            {item.name}
          </Text>
        </View>
      </View>
      {isSelected && (
        <Text style={[styles.checkIcon, customStyles?.flag]}>✓</Text>
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
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  selectedLanguageItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
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
    color: '#333',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 14,
    color: '#666',
  },
  checkIcon: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});