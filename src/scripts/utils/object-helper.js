/**
 * Object Helper
 * Utilities for deep object manipulation
 */

/**
 * Set a value in a nested object, creating intermediate objects if necessary
 * Returns true if the key was newly added, false if it already existed
 */
export function setDeep(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  if (current[lastKey] === undefined) {
    current[lastKey] = value;
    return true;
  }
  
  return false;
}
