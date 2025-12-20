#!/usr/bin/env node

/**
 * File Parser
 * Parse and generate TypeScript translation files
 */

const fs = require('fs');
const { getLangDisplayName } = require('./translation-config');

function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export\s+default\s+(\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error(`Could not parse TypeScript file: ${filePath}`);
  }

  const objectStr = match[1].replace(/;$/, '');

  try {
    return eval(`(${objectStr})`);
  } catch (error) {
    throw new Error(`Failed to parse object in ${filePath}: ${error.message}`);
  }
}

function stringifyValue(value, indent = 2) {
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
      .map(([k, v]) => {
        const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `${innerSpaces}${key}: ${stringifyValue(v, indent + 2)}`;
      })
      .join(',\n');
    return `{\n${entriesStr},\n${spaces}}`;
  }

  return String(value);
}

function generateTypeScriptContent(obj, langCode) {
  const langName = getLangDisplayName(langCode);
  const objString = stringifyValue(obj, 0);

  return `/**
 * ${langName} Translations
 * Auto-translated from en-US.ts
 */

export default ${objString};
`;
}

module.exports = {
  parseTypeScriptFile,
  generateTypeScriptContent,
};
