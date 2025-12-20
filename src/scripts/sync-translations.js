#!/usr/bin/env node

/**
 * Sync Translations Script
 * Synchronizes translation keys from en-US.ts to all other language files
 * Usage: node sync-translations.js [locales-dir]
 */

const fs = require('fs');
const path = require('path');
const { parseTypeScriptFile, generateTypeScriptContent } = require('./utils/file-parser');
const { addMissingKeys, removeExtraKeys } = require('./utils/sync-helper');
const { getLangDisplayName } = require('./utils/translation-config');

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

function main() {
  const targetDir = process.argv[2] || 'src/domains/localization/translations';
  const targetLangCode = process.argv[3]; // Optional specific language to sync
  const localesDir = path.resolve(process.cwd(), targetDir);

  console.log('🚀 Starting translation synchronization...\n');
  console.log(`📂 Locales directory: ${localesDir}`);
  if (targetLangCode) {
    console.log(`🎯 Target language: ${targetLangCode}`);
  }
  console.log('');

  if (!fs.existsSync(localesDir)) {
    console.error(`❌ Locales directory not found: ${localesDir}`);
    process.exit(1);
  }

  const enUSPath = path.join(localesDir, 'en-US.ts');
  if (!fs.existsSync(enUSPath)) {
    console.error(`❌ Base file not found: ${enUSPath}`);
    process.exit(1);
  }

  const files = fs.readdirSync(localesDir)
    .filter(f => {
      const isLangFile = f.match(/^[a-z]{2}-[A-Z]{2}\.ts$/) && f !== 'en-US.ts';
      if (!isLangFile) return false;
      if (targetLangCode) {
        return f === `${targetLangCode}.ts`;
      }
      return true;
    })
    .sort();

  if (targetLangCode && files.length === 0) {
    console.warn(`⚠️  Target language file ${targetLangCode}.ts not found in ${targetDir}`);
  }

  console.log(`📊 Languages to sync: ${files.length}\n`);

  let totalAdded = 0;
  let totalRemoved = 0;
  let totalChanged = 0;

  for (const file of files) {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);

    console.log(`🌍 Syncing ${langCode} (${getLangDisplayName(langCode)})...`);

    const result = syncLanguageFile(enUSPath, targetPath, langCode);

    if (result.changed) {
      console.log(`   ✏️  +${result.added} keys, -${result.removed} keys`);
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
    console.log(`   Next: Run 'npm run i18n:translate' to translate new keys`);
  } else {
    console.log(`\n✅ All languages were already synchronized!`);
  }
}

main();
