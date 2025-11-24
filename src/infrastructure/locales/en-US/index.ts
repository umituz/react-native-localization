/**
 * Auto-loader for en-US translation modules
 *
 * Uses @umituz/react-native-filesystem for professional module loading
 * - Auto-discovers all .json files in this directory
 * - Zero manual updates needed when adding new translation files
 * - Type-safe with TypeScript
 *
 * USAGE:
 * 1. Create new translation file: my_domain.json
 * 2. File is auto-discovered and loaded
 * 3. Access via t('my_domain.key')
 */

import { loadJsonModules } from '@umituz/react-native-filesystem';

// Metro bundler require.context - auto-discover all .json files
// eslint-disable-next-line @typescript-eslint/no-require-imports
const translationContext = (require as any).context('./', false, /\.json$/);

/**
 * Flatten nested objects with dot notation
 */
const flattenObject = (
  obj: Record<string, any>,
  prefix = '',
): Record<string, string> => {
  const flattened: Record<string, string> = {};

  Object.keys(obj).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], newKey));
    } else {
      flattened[newKey] = obj[key];
    }
  });

  return flattened;
};

// Load all JSON modules automatically using filesystem utility
const modules = loadJsonModules(translationContext);

// Flatten all translations with dot notation
// Creates keys like: home.title, goals.title, progress.title
const translations = flattenObject(modules);

export default translations;
