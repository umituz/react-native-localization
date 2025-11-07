#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Translation Key Analyzer
 *
 * Analyzes React Native apps to find all translation keys used
 * in screens and compares them against available translations.
 *
 * Usage:
 *   npm run i18n:analyze
 *   node node_modules/@umituz/react-native-localization/scripts/analyze-keys.js
 *
 * Features:
 * - Extracts all t('...') calls from .tsx/.ts files
 * - Validates against en-US translation files
 * - Reports missing keys
 * - Reports unused keys (in JSON but not in code)
 * - Generates comprehensive report
 */

const fs = require('fs');
const path = require('path');
const { getLocalesDir } = require('./utils/findLocalesDir');

/**
 * Extract translation keys from a TypeScript/TSX file
 * Looks for patterns: t('key'), t("key"), t(`key`)
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();

  // Regex patterns for t('key'), t("key"), t(`key`)
  const patterns = [
    /t\(['"]([^'"]+)['"]\)/g,  // t('key') or t("key")
    /t\(`([^`]+)`\)/g,          // t(`key`)
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1].trim();

      // Skip invalid keys
      if (
        !key ||                           // Empty
        key.length < 3 ||                 // Too short (single chars like '/', '-')
        key.includes('${') ||             // Variables ${var}
        key.includes('{{') ||             // Handlebars {{var}}
        /^[A-Z][a-z]+$/.test(key) ||      // Single words like "Main", "Settings" (likely screen names)
        /^[a-z]+$/.test(key) ||           // Single words like "button", "icon" (likely prop values)
        /^[a-z]+-[a-z]+$/.test(key)       // Kebab-case like "onboarding-complete" (likely testIDs)
      ) {
        continue;
      }

      keys.add(key);
    }
  }

  return keys;
}

/**
 * Recursively find all TypeScript/TSX files in a directory
 */
function findSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .git, build directories
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build' || entry.name === 'lib') {
      continue;
    }

    if (entry.isDirectory()) {
      findSourceFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Load all translation keys from JSON files
 */
function loadTranslationKeys(localesDir, locale = 'en-US') {
  const localeDir = path.join(localesDir, locale);
  const keys = new Set();

  if (!fs.existsSync(localeDir)) {
    return keys;
  }

  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const namespace = file.replace('.json', '');

    extractKeysFromObject(content, namespace, keys);
  }

  return keys;
}

/**
 * Recursively extract keys from translation object
 */
function extractKeysFromObject(obj, prefix, keys) {
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      extractKeysFromObject(obj[key], fullKey, keys);
    } else if (typeof obj[key] === 'string') {
      keys.add(fullKey);
    }
  }
}

/**
 * Analyze translation keys for current project
 */
function analyzeProject() {
  console.log(`\n🔍 Analyzing translation keys for current project...\n`);

  // Find project's locales directory
  const localesDir = getLocalesDir();
  const projectRoot = process.cwd();

  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📁 Locales directory: ${localesDir}\n`);

  // Find all source files in src directory
  const srcDir = path.join(projectRoot, 'src');
  const sourceFiles = findSourceFiles(srcDir);
  console.log(`📄 Found ${sourceFiles.length} source files\n`);

  // Extract keys from source code
  const usedKeys = new Set();
  for (const file of sourceFiles) {
    const keys = extractKeysFromFile(file);
    keys.forEach(key => usedKeys.add(key));
  }

  console.log(`🔑 Found ${usedKeys.size} translation keys in source code\n`);

  // Load translation keys
  const translationKeys = loadTranslationKeys(localesDir);
  console.log(`📚 Found ${translationKeys.size} translation keys in en-US JSON files\n`);

  // Find missing keys (used in code but not in translations)
  const missingKeys = [];
  usedKeys.forEach(key => {
    if (!translationKeys.has(key)) {
      missingKeys.push(key);
    }
  });

  // Find unused keys (in translations but not used in code)
  const unusedKeys = [];
  translationKeys.forEach(key => {
    if (!usedKeys.has(key)) {
      unusedKeys.push(key);
    }
  });

  // Generate report
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 TRANSLATION KEY ANALYSIS REPORT\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (missingKeys.length === 0) {
    console.log('✅ All translation keys found in JSON files!\n');
  } else {
    console.log(`❌ Missing Keys: ${missingKeys.length}\n`);
    console.log('Keys used in code but NOT found in translation files:\n');
    missingKeys.sort().forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log('');
  }

  if (unusedKeys.length > 0) {
    console.log(`⚠️  Unused Keys: ${unusedKeys.length}\n`);
    console.log('Keys in translation files but NOT used in code:\n');
    unusedKeys.sort().forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📈 Summary:\n');
  console.log(`   Total keys in code:        ${usedKeys.size}`);
  console.log(`   Total keys in translations: ${translationKeys.size}`);
  console.log(`   Missing keys:              ${missingKeys.length}`);
  console.log(`   Unused keys:               ${unusedKeys.length}`);
  if (usedKeys.size > 0) {
    console.log(`   Coverage:                  ${Math.round((1 - missingKeys.length / usedKeys.size) * 100)}%`);
  }
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (missingKeys.length > 0) {
    console.log('💡 Next Steps:\n');
    console.log('   1. Add missing keys to en-US JSON files');
    console.log('   2. Run: npm run i18n:translate to auto-translate');
    console.log('   3. Re-run this analyzer to verify\n');
    process.exit(1);
  } else {
    console.log('✅ Translation check passed!\n');
    process.exit(0);
  }
}

// Main
analyzeProject();

