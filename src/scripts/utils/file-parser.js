import fs from 'fs';
import { getLangDisplayName } from './translation-config.js';

/**
 * File Parser
 * Parse and generate TypeScript translation files
 */

export function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export\s+default\s+(\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error(`Could not parse TypeScript file: ${filePath}`);
  }

  const objectStr = match[1].replace(/;$/, '');

  try {
    // Basic evaluation for simple objects
    // eslint-disable-next-line no-eval
    return eval(`(${objectStr})`);
  } catch (error) {
    console.warn(`\n⚠️  Warning: Could not fully parse ${filePath}. Files with complex imports/spreads are currently limited.`);
    return {}; // Return empty to avoid breaking the whole process
  }
}

export function stringifyValue(value, indent = 2) {
  if (typeof value === 'string') {
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => stringifyValue(v, indent + 2));
    return `[${items.join(', ')}]`;
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return '{}';
    }

    const spaces = ' '.repeat(indent);
    const innerSpaces = ' '.repeat(indent + 2);
    const entriesStr = entries
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => {
        const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `${innerSpaces}${key}: ${stringifyValue(v, indent + 2)}`;
      })
      .join(',\n');
    return `{\n${entriesStr},\n${spaces}}`;
  }

  return String(value);
}

export function generateTypeScriptContent(obj, langCode) {
  const langName = getLangDisplayName(langCode);
  const isBase = langCode === 'en-US';
  const objString = stringifyValue(obj, 0);

  return `/**
 * ${langName} Translations
 * ${isBase ? 'Base translations file' : 'Auto-synced from en-US.ts'}
 */

export default ${objString};
`;
}
