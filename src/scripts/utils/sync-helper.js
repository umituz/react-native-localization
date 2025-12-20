#!/usr/bin/env node

/**
 * Sync Helper
 * Helper functions for synchronizing translation keys
 */

function addMissingKeys(enObj, targetObj, stats = { added: 0 }) {
  for (const key in enObj) {
    if (!Object.prototype.hasOwnProperty.call(targetObj, key)) {
      targetObj[key] = enObj[key];
      stats.added++;
    } else if (
      typeof enObj[key] === 'object' &&
      enObj[key] !== null &&
      !Array.isArray(enObj[key])
    ) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
      }
      addMissingKeys(enObj[key], targetObj[key], stats);
    }
  }
  return stats;
}

function removeExtraKeys(enObj, targetObj, stats = { removed: 0 }) {
  for (const key in targetObj) {
    if (!Object.prototype.hasOwnProperty.call(enObj, key)) {
      delete targetObj[key];
      stats.removed++;
    } else if (
      typeof enObj[key] === 'object' &&
      enObj[key] !== null &&
      !Array.isArray(enObj[key]) &&
      typeof targetObj[key] === 'object' &&
      targetObj[key] !== null &&
      !Array.isArray(targetObj[key])
    ) {
      removeExtraKeys(enObj[key], targetObj[key], stats);
    }
  }
  return stats;
}

module.exports = {
  addMissingKeys,
  removeExtraKeys,
};
