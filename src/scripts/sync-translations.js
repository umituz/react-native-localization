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

  console.log(`🔍 Scanning source code and dependencies: ${srcDir}...`);
  const usedKeyMap = extractUsedKeys(srcDir);
  console.log(`   Found ${usedKeyMap.size} unique keys.`);

  const oldEnUS = parseTypeScriptFile(enUSPath);
  const newEnUS = {}; 
  
  let addedCount = 0;
  for (const [key, defaultValue] of usedKeyMap) {
    // Try to keep existing translation if it exists
    const existingValue = key.split('.').reduce((obj, k) => (obj && obj[k]), oldEnUS);
    
    // We treat it as "not translated" if the value is exactly the key string
    const isActuallyTranslated = typeof existingValue === 'string' && existingValue !== key;
    const valueToSet = isActuallyTranslated ? existingValue : defaultValue;
    
    if (setDeep(newEnUS, key, valueToSet)) {
      if (!isActuallyTranslated) addedCount++;
    }
  }

  // Count keys in objects
  const getKeysCount = (obj) => {
    let count = 0;
    const walk = (o) => {
      for (const k in o) {
        if (typeof o[k] === 'object' && o[k] !== null) walk(o[k]);
        else count++;
      }
    };
    walk(obj);
    return count;
  };
  
  const oldTotal = getKeysCount(oldEnUS);
  const newTotal = getKeysCount(newEnUS);
  const removedCount = oldTotal - (newTotal - addedCount);

  console.log(`   ✨ Optimized en-US.ts: ${addedCount} keys populated/updated, pruned ${Math.max(0, removedCount)} unused.`);
  const content = generateTypeScriptContent(newEnUS, 'en-US');
  fs.writeFileSync(enUSPath, content);
}

export function syncTranslations(targetDir, srcDir) {
  const localesDir = path.resolve(process.cwd(), targetDir);
  const enUSPath = path.join(localesDir, 'en-US.ts');

  if (!fs.existsSync(localesDir) || !fs.existsSync(enUSPath)) {
    console.error(`❌ Localization files not found in: ${localesDir}`);
    return false;
  }

  processExtraction(srcDir, enUSPath);

  const files = fs.readdirSync(localesDir)
    .filter(f => f.match(/^[a-z]{2}-[A-Z]{2}\.ts$/) && f !== 'en-US.ts')
    .sort();

  console.log(`📊 Languages to sync: ${files.length}\n`);
  files.forEach(file => {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);
    const result = syncLanguageFile(enUSPath, targetPath, langCode);
    if (result.changed) {
      console.log(`   🌍 ${langCode}: ✏️  +${result.added} keys, -${result.removed} keys`);
    }
  });

  console.log(`\n✅ Synchronization completed!`);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const targetDir = process.argv[2] || 'src/domains/localization/infrastructure/locales';
  const srcDir = process.argv[3];
  console.log('🚀 Starting translation synchronization...\n');
  syncTranslations(targetDir, srcDir);
}
