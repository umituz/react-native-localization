#!/usr/bin/env node

/**
 * Translate Missing Script
 * Translates missing strings from en-US.ts to all other language files
 * Usage: node translate-missing.js [locales-dir] [lang-code-optional]
 */

import fs from 'fs';
import path from 'path';
import { getTargetLanguage, isEnglishVariant, getLangDisplayName } from './utils/translation-config.js';
import { parseTypeScriptFile, generateTypeScriptContent } from './utils/file-parser.js';
import { translateObject } from './utils/translator.js';

async function translateLanguageFile(enUSPath, targetPath, langCode) {
  const targetLang = getTargetLanguage(langCode);

  if (!targetLang) {
    console.log(`   ⚠️  No language mapping for ${langCode}, skipping`);
    return { count: 0, newKeys: [] };
  }

  if (isEnglishVariant(langCode)) {
    console.log(`   ⏭️  Skipping English variant: ${langCode}`);
    return { count: 0, newKeys: [] };
  }

  const enUS = parseTypeScriptFile(enUSPath);
  let target;

  try {
    target = parseTypeScriptFile(targetPath);
  } catch {
    target = {};
  }

  const stats = { count: 0, newKeys: [] };
  await translateObject(enUS, target, targetLang, '', stats);

  if (stats.count > 0) {
    const content = generateTypeScriptContent(target, langCode);
    fs.writeFileSync(targetPath, content);
  }

  return stats;
}

async function main() {
  const targetDir = process.argv[2] || 'src/domains/localization/infrastructure/locales';
  const targetLangCode = process.argv[3];
  const localesDir = path.resolve(process.cwd(), targetDir);
  const enUSPath = path.join(localesDir, 'en-US.ts');

  console.log('🚀 Starting automatic translation...\n');
  if (!fs.existsSync(localesDir) || !fs.existsSync(enUSPath)) {
    console.error(`❌ Localization files not found in: ${localesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(localesDir)
    .filter(f => {
      const isLangFile = f.match(/^[a-z]{2}-[A-Z]{2}\.ts$/) && f !== 'en-US.ts';
      return isLangFile && (!targetLangCode || f === `${targetLangCode}.ts`);
    })
    .sort();

  console.log(`📊 Languages to translate: ${files.length}\n`);

  let totalTranslated = 0;
  for (const file of files) {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);
    console.log(`🌍 Translating ${langCode} (${getLangDisplayName(langCode)})...`);
    const stats = await translateLanguageFile(enUSPath, targetPath, langCode);
    totalTranslated += stats.count;
    if (stats.count > 0) {
      console.log(`   ✅ Translated ${stats.count} strings`);
    } else {
      console.log(`   ✓ Already complete`);
    }
  }

  console.log(`\n✅ Translation completed! (Total: ${totalTranslated})`);
}

main().catch(error => {
  console.error('❌ Translation failed:', error.message);
  process.exit(1);
});
