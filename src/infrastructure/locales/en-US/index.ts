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

// Load all JSON modules automatically using filesystem utility
const translations = loadJsonModules(translationContext);

export default translations;
