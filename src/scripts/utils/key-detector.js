/**
 * Key Detector
 * Detects new, missing, and removed keys between source and target objects
 */

export function detectNewKeys(sourceObj, targetObj, path = '', newKeys = []) {
  for (const key in sourceObj) {
    const currentPath = path ? `${path}.${key}` : key;
    const sourceValue = sourceObj[key];
    const targetValue = targetObj[key];

    if (!Object.prototype.hasOwnProperty.call(targetObj, key)) {
      newKeys.push({ path: currentPath, value: sourceValue });
    } else if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue)
    ) {
      if (typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
        detectNewKeys(sourceValue, targetValue, currentPath, newKeys);
      }
    }
  }
  return newKeys;
}

export function detectMissingKeys(sourceObj, targetObj, path = '', missingKeys = []) {
  for (const key in targetObj) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!Object.prototype.hasOwnProperty.call(sourceObj, key)) {
      missingKeys.push(currentPath);
    } else if (
      typeof sourceObj[key] === 'object' &&
      sourceObj[key] !== null &&
      !Array.isArray(sourceObj[key]) &&
      typeof targetObj[key] === 'object' &&
      targetObj[key] !== null &&
      !Array.isArray(targetObj[key])
    ) {
      detectMissingKeys(sourceObj[key], targetObj[key], currentPath, missingKeys);
    }
  }
  return missingKeys;
}
