/**
 * Storage Wrapper
 * Uses @umituz/react-native-storage for persistence
 */

import { storageRepository } from '@umituz/react-native-storage';

export const STORAGE_KEYS = {
  LANGUAGE: '@localization:language',
} as const;

export const StorageWrapper = {
  async getString(key: string, defaultValue: string): Promise<string> {
    const result = await storageRepository.getString(key, defaultValue);
    if (result.success && result.data !== null) {
      return result.data;
    }
    return defaultValue;
  },

  async setString(key: string, value: string): Promise<void> {
    await storageRepository.setString(key, value);
  },
};
