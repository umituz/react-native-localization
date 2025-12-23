#!/usr/bin/env node

/**
 * Translate Missing Script
 * Translates missing strings from en-US.ts to all other language files
 * Usage: node translate-missing.js [locales-dir]
 */

const fs = require('fs');
const path = require('path');
const { getTargetLanguage, isEnglishVariant, getLangDisplayName } = require('./utils/translation-config');
const { parseTypeScriptFile, generateTypeScriptContent } = require('./utils/file-parser');
const { translateObject } = require('./utils/translator');

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
  const targetDir = process.argv[2] || 'src/domains/localization/translations';
  const targetLangCode = process.argv[3];
  const localesDir = path.resolve(process.cwd(), targetDir);

  console.log('🚀 Starting automatic translation...\n');
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

  console.log(`📊 Languages to translate: ${files.length}`);
  console.log('⚡ Running with 200ms delay between API calls\n');

  let totalTranslated = 0;
  let totalNewKeys = 0;

  for (const file of files) {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);

    console.log(`\n🌍 Translating ${langCode} (${getLangDisplayName(langCode)})...`);

    const stats = await translateLanguageFile(enUSPath, targetPath, langCode);
    totalTranslated += stats.count;
    totalNewKeys += stats.newKeys.length;

    if (stats.count > 0) {
      console.log(`   ✅ Translated ${stats.count} strings`);
      if (stats.newKeys.length > 0) {
        console.log(`   🆕 ${stats.newKeys.length} new keys translated`);
      }
    } else {
      console.log(`   ✓ Already complete`);
    }
  }

  console.log(`\n✅ Translation completed!`);
  console.log(`   Total strings translated: ${totalTranslated}`);
  if (totalNewKeys > 0) {
    console.log(`   New keys translated: ${totalNewKeys}`);
  }
  console.log(`\n📝 Next: Run 'npm run i18n:setup' to update index.ts`);
}

main().catch((error) => {
  console.error('❌ Translation failed:', error.message);
  process.exit(1);
});
