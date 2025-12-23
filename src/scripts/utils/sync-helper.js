#!/usr/bin/env node

/**
 * Sync Helper
 * Helper functions for synchronizing translation keys
 */

function addMissingKeys(sourceObj, targetObj, stats = { added: 0, newKeys: [] }) {
  for (const key in sourceObj) {
    const sourceValue = sourceObj[key];
    const isNewKey = !Object.prototype.hasOwnProperty.call(targetObj, key);

    if (isNewKey) {
      targetObj[key] = sourceValue;
      stats.added++;
      stats.newKeys.push(key);
    } else if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue)
    ) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
      }
      addMissingKeys(sourceValue, targetObj[key], stats);
    }
  }
  return stats;
}

function removeExtraKeys(sourceObj, targetObj, stats = { removed: 0, removedKeys: [] }) {
  for (const key in targetObj) {
    const isExtraKey = !Object.prototype.hasOwnProperty.call(sourceObj, key);

    if (isExtraKey) {
      delete targetObj[key];
      stats.removed++;
      stats.removedKeys.push(key);
    } else if (
      typeof sourceObj[key] === 'object' &&
      sourceObj[key] !== null &&
      !Array.isArray(sourceObj[key]) &&
      typeof targetObj[key] === 'object' &&
      targetObj[key] !== null &&
      !Array.isArray(targetObj[key])
    ) {
      removeExtraKeys(sourceObj[key], targetObj[key], stats);
    }
  }
  return stats;
}

module.exports = {
  addMissingKeys,
  removeExtraKeys,
};
