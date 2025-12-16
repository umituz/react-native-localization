#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Sync Translations Script
 *
 * Synchronizes translation keys from en-US.ts to all other language files.
 * - Adds missing keys (with English values as placeholders)
 * - Removes extra keys not in en-US
 * - Maintains existing translations
 *
 * Usage: node scripts/sync-translations.js [locales-dir]
 * Default: src/domains/localization/infrastructure/locales
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse TypeScript translation file and extract the object
 */
function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract the object from "export default { ... };"
  const match = content.match(/export\s+default\s+(\{[\s\S]*\});?\s*$/);
  if (!match) {
    throw new Error(`Could not parse TypeScript file: ${filePath}`);
  }

  const objectStr = match[1].replace(/;$/, '');

  try {
    // eslint-disable-next-line no-eval
    return eval(`(${objectStr})`);
  } catch (error) {
    throw new Error(`Failed to parse object in ${filePath}: ${error.message}`);
  }
}

/**
 * Generate TypeScript file content from object
 */
function generateTypeScriptContent(obj, langCode) {
  const langName = getLangDisplayName(langCode);

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
      const spaces = ' '.repeat(indent);
      const innerSpaces = ' '.repeat(indent + 2);
      const entries = Object.entries(value)
        .map(([k, v]) => {
          const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
          return `${innerSpaces}${key}: ${stringifyValue(v, indent + 2)}`;
        })
        .join(',\n');
      return `{\n${entries},\n${spaces}}`;
    }

    return String(value);
  }

  const objString = stringifyValue(obj, 0);

  return `/**
 * ${langName} Translations
 * Auto-synced from en-US.ts
 */

export default ${objString};
`;
}

/**
 * Get display name for language code
 */
function getLangDisplayName(code) {
  const names = {
    'ar-SA': 'Arabic (Saudi Arabia)',
    'bg-BG': 'Bulgarian',
    'cs-CZ': 'Czech',
    'da-DK': 'Danish',
    'de-DE': 'German',
    'el-GR': 'Greek',
    'en-AU': 'English (Australia)',
    'en-CA': 'English (Canada)',
    'en-GB': 'English (UK)',
    'en-US': 'English (US)',
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'fi-FI': 'Finnish',
    'fr-CA': 'French (Canada)',
    'fr-FR': 'French (France)',
    'hi-IN': 'Hindi',
    'hr-HR': 'Croatian',
    'hu-HU': 'Hungarian',
    'id-ID': 'Indonesian',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'ms-MY': 'Malay',
    'nl-NL': 'Dutch',
    'no-NO': 'Norwegian',
    'pl-PL': 'Polish',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
    'ro-RO': 'Romanian',
    'ru-RU': 'Russian',
    'sk-SK': 'Slovak',
    'sv-SE': 'Swedish',
    'th-TH': 'Thai',
    'tl-PH': 'Tagalog',
    'tr-TR': 'Turkish',
    'uk-UA': 'Ukrainian',
    'vi-VN': 'Vietnamese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  };
  return names[code] || code;
}

/**
 * Add missing keys from en-US to target
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

/**
 * Remove extra keys not in en-US
 */
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

/**
 * Sync a single language file
 */
function syncLanguageFile(enUSPath, targetPath, langCode) {
  const enUS = parseTypeScriptFile(enUSPath);
  let target;

  try {
    target = parseTypeScriptFile(targetPath);
  } catch {
    target = {};
  }

  const addStats = { added: 0 };
  const removeStats = { removed: 0 };

  addMissingKeys(enUS, target, addStats);
  removeExtraKeys(enUS, target, removeStats);

  const changed = addStats.added > 0 || removeStats.removed > 0;

  if (changed) {
    const content = generateTypeScriptContent(target, langCode);
    fs.writeFileSync(targetPath, content);
  }

  return {
    added: addStats.added,
    removed: removeStats.removed,
    changed,
  };
}

/**
 * Main function
 */
function main() {
  const targetDir = process.argv[2] || 'src/domains/localization/infrastructure/locales';
  const localesDir = path.resolve(process.cwd(), targetDir);

  console.log('🚀 Starting translation synchronization...\n');
  console.log(`📂 Locales directory: ${localesDir}\n`);

  if (!fs.existsSync(localesDir)) {
    console.error(`❌ Locales directory not found: ${localesDir}`);
    process.exit(1);
  }

  const enUSPath = path.join(localesDir, 'en-US.ts');
  if (!fs.existsSync(enUSPath)) {
    console.error(`❌ Base file not found: ${enUSPath}`);
    process.exit(1);
  }

  // Find all language files
  const files = fs.readdirSync(localesDir)
    .filter(f => f.match(/^[a-z]{2}-[A-Z]{2}\.ts$/) && f !== 'en-US.ts')
    .sort();

  console.log(`📊 Languages to sync: ${files.length}\n`);

  let totalAdded = 0;
  let totalRemoved = 0;
  let totalChanged = 0;

  for (const file of files) {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);

    console.log(`🌍 Syncing ${langCode}...`);

    const result = syncLanguageFile(enUSPath, targetPath, langCode);

    if (result.changed) {
      console.log(`   ✏️ +${result.added} keys, -${result.removed} keys`);
      totalAdded += result.added;
      totalRemoved += result.removed;
      totalChanged++;
    } else {
      console.log(`   ✅ Already synchronized`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Languages processed: ${files.length}`);
  console.log(`   Files changed: ${totalChanged}`);
  console.log(`   Keys added: ${totalAdded}`);
  console.log(`   Keys removed: ${totalRemoved}`);

  if (totalChanged > 0) {
    console.log(`\n✅ Synchronization completed!`);
    console.log(`   Next: Run 'node scripts/translate-missing.js' to translate new keys`);
  } else {
    console.log(`\n✅ All languages were already synchronized!`);
  }
}

main();
