/**
 * AsyncStorage Wrapper
 * Simple wrapper for AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  LANGUAGE: '@localization:language',
} as const;

export const StorageWrapper = {
  async getString(key: string, defaultValue: string): Promise<string> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ?? defaultValue;
    } catch (error) {
      console.warn('[Localization] Failed to get storage value:', error);
      return defaultValue;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('[Localization] Failed to set storage value:', error);
    }
  },
};
