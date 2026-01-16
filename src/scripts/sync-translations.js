#!/usr/bin/env node

/**
 * Sync Translations Script
 * Synchronizes translation keys from en-US.ts to all other language files
 * Usage: node sync-translations.js [locales-dir] [src-dir-optional]
 */

import fs from 'fs';
import path from 'path';
import { parseTypeScriptFile, generateTypeScriptContent } from './utils/file-parser.js';
import { addMissingKeys, removeExtraKeys } from './utils/sync-helper.js';
import { detectNewKeys } from './utils/key-detector.js';
import { getLangDisplayName } from './utils/translation-config.js';
import { extractUsedKeys } from './utils/key-extractor.js';
import { setDeep } from './utils/object-helper.js';

function syncLanguageFile(enUSPath, targetPath, langCode) {
  const enUS = parseTypeScriptFile(enUSPath);
  let target;

  try {
    target = parseTypeScriptFile(targetPath);
  } catch {
    target = {};
  }

  const newKeys = detectNewKeys(enUS, target);
  const addStats = { added: 0, newKeys: [] };
  const removeStats = { removed: 0, removedKeys: [] };

  addMissingKeys(enUS, target, addStats);
  removeExtraKeys(enUS, target, removeStats);

  const changed = addStats.added > 0 || removeStats.removed > 0;

  if (changed) {
    const content = generateTypeScriptContent(target, langCode);
    fs.writeFileSync(targetPath, content);
  }

  return { ...addStats, ...removeStats, newKeys, changed };
}

function processExtraction(srcDir, enUSPath) {
  if (!srcDir) return;

  console.log(`🔍 Scanning source code: ${srcDir}...`);
  const usedKeys = extractUsedKeys(srcDir);
  console.log(`   Found ${usedKeys.size} unique keys in code.`);

  const enUS = parseTypeScriptFile(enUSPath);
  let addedCount = 0;
  for (const key of usedKeys) {
    if (setDeep(enUS, key, key)) addedCount++;
  }

  if (addedCount > 0) {
    console.log(`   ✨ Added ${addedCount} new keys to en-US.ts`);
    const content = generateTypeScriptContent(enUS, 'en-US');
    fs.writeFileSync(enUSPath, content);
  }
}

function main() {
  const targetDir = process.argv[2] || 'src/domains/localization/infrastructure/locales';
  const srcDir = process.argv[3];
  const localesDir = path.resolve(process.cwd(), targetDir);
  const enUSPath = path.join(localesDir, 'en-US.ts');

  console.log('🚀 Starting translation synchronization...\n');
  if (!fs.existsSync(localesDir) || !fs.existsSync(enUSPath)) {
    console.error(`❌ Localization files not found in: ${localesDir}`);
    process.exit(1);
  }

  processExtraction(srcDir, enUSPath);

  const files = fs.readdirSync(localesDir)
    .filter(f => f.match(/^[a-z]{2}-[A-Z]{2}\.ts$/) && f !== 'en-US.ts')
    .sort();

  console.log(`📊 Languages to sync: ${files.length}\n`);
  files.forEach(file => {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);
    console.log(`🌍 Syncing ${langCode} (${getLangDisplayName(langCode)})...`);
    const result = syncLanguageFile(enUSPath, targetPath, langCode);
    if (result.changed) {
      console.log(`   ✏️  +${result.added} keys, -${result.removed} keys`);
    } else {
      console.log(`   ✅ Already synchronized`);
    }
  });

  console.log(`\n✅ Synchronization completed!`);
}

main();
