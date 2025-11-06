#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { getLocalesDir } = require('./utils/findLocalesDir');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  force: args.includes('--force') || args.includes('-f'),
  keysFilter: args.find(a => a.startsWith('--keys='))?.split('=')[1]?.split(','),
  report: args.includes('--report') || args.includes('-r'),
};

// Statistics tracking
const stats = {
  totalLanguages: 0,
  totalFiles: 0,
  totalKeys: 0,
  translated: 0,
  skipped: 0,
  errors: 0,
};

// Language codes mapping for Google Translate API
const LANGUAGE_MAP = {
  'ar-SA': 'ar', // Arabic
  'bg-BG': 'bg', // Bulgarian
  'cs-CZ': 'cs', // Czech
  'da-DK': 'da', // Danish
  'de-DE': 'de', // German (already complete)
  'el-GR': 'el', // Greek
  'en-AU': 'en', // English (skip)
  'en-CA': 'en', // English (skip)
  'en-GB': 'en', // English (skip)
  'es-ES': 'es', // Spanish (already complete)
  'es-MX': 'es', // Spanish (already complete)
  'fi-FI': 'fi', // Finnish
  'fr-CA': 'fr', // French
  'fr-FR': 'fr', // French (already complete)
  'hi-IN': 'hi', // Hindi
  'hr-HR': 'hr', // Croatian
  'hu-HU': 'hu', // Hungarian
  'id-ID': 'id', // Indonesian
  'it-IT': 'it', // Italian
  'ja-JP': 'ja', // Japanese
  'ko-KR': 'ko', // Korean
  'ms-MY': 'ms', // Malay
  'nl-NL': 'nl', // Dutch
  'no-NO': 'no', // Norwegian
  'pl-PL': 'pl', // Polish
  'pt-BR': 'pt', // Portuguese
  'pt-PT': 'pt', // Portuguese
  'ro-RO': 'ro', // Romanian
  'ru-RU': 'ru', // Russian
  'sk-SK': 'sk', // Slovak
  'sv-SE': 'sv', // Swedish
  'th-TH': 'th', // Thai
  'tl-PH': 'tl', // Tagalog
  'tr-TR': 'tr', // Turkish (already complete)
  'uk-UA': 'uk', // Ukrainian
  'vi-VN': 'vi', // Vietnamese
  'zh-CN': 'zh-CN', // Chinese Simplified
  'zh-TW': 'zh-TW', // Chinese Traditional
};

// Only skip actual brand names - everything else should be translated
// Note: Even common words like "Email", "OK", "Premium" should be localized
const SKIP_WORDS = new Set([
  'Google',
  'Apple',
  'Facebook',
  'Instagram',
  'Twitter',
  'WhatsApp',
]);

/**
 * Simple Google Translate API call using free endpoint
 * Note: This uses Google's unofficial API. For production, use official API with key.
 */
async function translateText(text, targetLang) {
  return new Promise((resolve, _reject) => {
    if (SKIP_WORDS.has(text)) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;

    https
      .get(url, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const translated = parsed[0]
              .map(item => item[0])
              .join('')
              .trim();
            resolve(translated || text);
          } catch (error) {
            console.warn(
              `⚠️ Translation failed for "${text}" to ${targetLang}:`,
              error.message
            );
            resolve(text); // Fallback to original
          }
        });
      })
      .on('error', err => {
        console.warn(
          `⚠️ Network error translating "${text}" to ${targetLang}:`,
          err.message
        );
        resolve(text); // Fallback to original
      });
  });
}

/**
 * Add delay between API calls to avoid rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a value needs translation (is missing or undefined)
 *
 * IMPROVED DETECTION:
 * - Respects --force flag to retranslate everything
 * - Respects --keys filter for selective retranslation
 * - Shows skip reasons in --verbose mode
 * - Protects manual translations by default
 */
function needsTranslation(key, value, enValue) {
  // --force mode: Always translate
  if (options.force) {
    if (options.verbose) {
      console.log(`   🔄 Force mode: translating "${key}"`);
    }
    return true;
  }

  // --keys filter: Only translate specified keys
  if (options.keysFilter && !options.keysFilter.includes(key)) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": not in --keys filter`);
    }
    stats.skipped++;
    return false;
  }

  // Translate if value is missing/undefined
  if (value === undefined || value === null) {
    if (options.verbose) {
      console.log(`   ✅ Translating "${key}": missing value`);
    }
    return true;
  }

  if (typeof value !== 'string') {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": non-string value`);
    }
    stats.skipped++;
    return false;
  }

  // Skip brand names only
  if (SKIP_WORDS.has(value)) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": brand name`);
    }
    stats.skipped++;
    return false;
  }

  // Skip numeric values and placeholders (0.00, phone numbers, etc.)
  if (/^[\d\s.+()-]+$/.test(value)) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": numeric value`);
    }
    stats.skipped++;
    return false;
  }

  // Skip email addresses
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": email address`);
    }
    stats.skipped++;
    return false;
  }

  // Skip URLs
  if (value.startsWith('http://') || value.startsWith('https://')) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": URL`);
    }
    stats.skipped++;
    return false;
  }

  // Skip if already translated (value is different from English)
  // This protects manual translations!
  if (value !== enValue) {
    if (options.verbose) {
      console.log(`   ⏭️  Skipping "${key}": already translated (manual or previous auto)`);
    }
    stats.skipped++;
    return false;
  }

  // If we get here, value exists and equals enValue
  // This means it hasn't been translated yet - TRANSLATE IT!
  if (options.verbose) {
    console.log(`   ✅ Translating "${key}": equals English source`);
  }
  return true;
}

/**
 * Recursively find and translate missing values
 */
async function translateObject(enObj, targetObj, targetLang, path = '') {
  let translatedCount = 0;

  for (const key in enObj) {
    const currentPath = path ? `${path}.${key}` : key;
    stats.totalKeys++;

    if (typeof enObj[key] === 'object' && enObj[key] !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
      }
      translatedCount += await translateObject(
        enObj[key],
        targetObj[key],
        targetLang,
        currentPath
      );
    } else if (typeof enObj[key] === 'string') {
      const originalValue = enObj[key];

      // Skip placeholders like {{count}}, {{mood}}, etc.
      if (originalValue.includes('{{') && originalValue.includes('}}')) {
        if (options.verbose) {
          console.log(
            `   ⏭️  Skipping placeholder: ${currentPath} = "${originalValue}"`
          );
        }
        stats.skipped++;
        continue;
      }

      // Check if needs translation
      if (needsTranslation(key, targetObj[key], originalValue)) {
        if (!options.verbose) {
          // Only show in non-verbose mode (verbose already shows in needsTranslation)
          console.log(`   🔄 Translating: ${currentPath} = "${originalValue}"`);
        }

        try {
          const translated = await translateText(originalValue, targetLang);
          targetObj[key] = translated;
          translatedCount++;
          stats.translated++;

          // Add delay to avoid rate limiting (200ms between requests)
          await delay(200);
        } catch (error) {
          console.error(`   ❌ Failed to translate "${currentPath}":`, error.message);
          stats.errors++;
        }
      }
    }
  }

  return translatedCount;
}

/**
 * Translate missing strings for a single file
 */
async function translateFile(enUSFile, targetFile, langCode) {
  const enUS = JSON.parse(fs.readFileSync(enUSFile, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

  const targetLang = LANGUAGE_MAP[langCode];
  if (!targetLang) {
    console.log(`   ⚠️ No language mapping for ${langCode}, skipping`);
    return 0;
  }

  // Note: English variants (en-AU, en-CA, en-GB) will also be translated
  // Google Translate may use regional variations and accents

  const translatedCount = await translateObject(enUS, target, targetLang);

  if (translatedCount > 0) {
    // Ensure parent directory exists before writing
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(target, null, 2) + '\n');
  }

  return translatedCount;
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
📖 Google Translate Auto-Translation Script

USAGE:
  npm run i18n:translate [options]

OPTIONS:
  --verbose, -v     Show detailed translation decisions
  --force, -f       Force retranslate all keys (overwrite manual translations)
  --keys=key1,key2  Only translate specific keys (comma-separated)
  --report, -r      Show detailed statistics report

EXAMPLES:
  npm run i18n:translate
    → Translate only missing keys, skip manual translations

  npm run i18n:translate --verbose
    → Show why each key is translated or skipped

  npm run i18n:translate --force
    → Retranslate ALL keys, overwriting manual translations

  npm run i18n:translate --keys=save,cancel,delete
    → Only retranslate these specific keys

  npm run i18n:translate --verbose --keys=title
    → Verbose mode for specific key translation

BEHAVIOR:
  ✅ Protects manual translations by default
  ✅ Only translates missing keys or keys that equal English
  ✅ Use --force to override protection
  ✅ Use --keys to selectively retranslate specific keys

NOTE:
  Scripts automatically find your project's locales directory.
  Supported paths:
    - src/domains/localization/infrastructure/locales
    - src/locales
    - locales
`);
  process.exit(0);
}

// Show usage if --help
if (args.includes('--help') || args.includes('-h')) {
  showUsage();
}

/**
 * Main function to translate all missing strings
 */
async function translateAllLanguages() {
  // Find project's locales directory
  const localesDir = getLocalesDir();
  const enUSDir = path.join(localesDir, 'en-US');

  // Automatically discover all JSON files in en-US directory
  const files = fs
    .readdirSync(enUSDir)
    .filter(file => file.endsWith('.json'))
    .sort();

  // Get languages that need translation (skip complete ones)
  const skipLanguages = new Set([
    'en-US', // Base language - skip translation
    'en-AU', // English variant - copy from en-US
    'en-CA', // English variant - copy from en-US
    'en-GB', // English variant - copy from en-US
  ]);

  const allLanguages = fs
    .readdirSync(localesDir)
    .filter(
      dir =>
        !skipLanguages.has(dir) &&
        fs.statSync(path.join(localesDir, dir)).isDirectory()
    )
    .sort();

  console.log('🚀 Starting automatic translation...\n');

  // Show options if any are active
  if (options.verbose || options.force || options.keysFilter || options.report) {
    console.log('⚙️  Active options:');
    if (options.verbose) console.log('   • Verbose mode: ON');
    if (options.force) console.log('   • Force retranslate: ON (⚠️  will overwrite manual translations)');
    if (options.keysFilter) console.log(`   • Keys filter: ${options.keysFilter.join(', ')}`);
    if (options.report) console.log('   • Detailed report: ON');
    console.log('');
  }

  console.log(`📊 Languages to translate: ${allLanguages.length}`);
  console.log(`📄 Files per language: ${files.length}`);
  console.log(
    `⏱️ Estimated time: ~${Math.ceil((allLanguages.length * files.length * 50 * 0.2) / 60)} minutes\n`
  );
  console.log(
    '⚡ Running with optimized speed (200ms delay between translations)\n'
  );

  stats.totalLanguages = allLanguages.length;
  stats.totalFiles = files.length;

  let totalTranslated = 0;
  let totalLanguages = 0;

  for (const langCode of allLanguages) {
    console.log(`\n🌍 Translating ${langCode}...`);
    totalLanguages++;

    let langTranslated = 0;

    for (const file of files) {
      const enUSFile = path.join(enUSDir, file);
      const targetDir = path.join(localesDir, langCode);
      const targetFile = path.join(targetDir, file);

      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Create target file if it doesn't exist (create empty structure)
      if (!fs.existsSync(targetFile)) {
        console.log(`   📝 Creating ${file} (new file)`);
        // Create empty object - translation will populate it
        fs.writeFileSync(targetFile, JSON.stringify({}, null, 2) + '\n');
      }

      const count = await translateFile(enUSFile, targetFile, langCode);
      langTranslated += count;
      totalTranslated += count;

      // Only log files that were actually translated
      if (count > 0) {
        console.log(`   ✅ ${file}: ${count} strings translated`);
      }
    }

    console.log(
      `   📊 ${langCode} summary: ${langTranslated} strings translated`
    );
  }

  console.log(`\n✅ Translation completed!`);
  console.log(`   Languages processed: ${totalLanguages}`);
  console.log(`   Total strings translated: ${totalTranslated}`);

  // Show detailed statistics if --report or --verbose
  if (options.report || options.verbose) {
    console.log(`\n📊 DETAILED STATISTICS:`);
    console.log(`   Total keys processed: ${stats.totalKeys}`);
    console.log(`   Translated: ${stats.translated} (${((stats.translated / stats.totalKeys) * 100).toFixed(1)}%)`);
    console.log(`   Skipped: ${stats.skipped} (${((stats.skipped / stats.totalKeys) * 100).toFixed(1)}%)`);
    if (stats.errors > 0) {
      console.log(`   Errors: ${stats.errors} ❌`);
    }

    console.log(`\n💡 TIPS:`);
    console.log(`   • Manual translations are protected (skipped) by default`);
    console.log(`   • Use --force to retranslate everything`);
    console.log(`   • Use --keys=key1,key2 to retranslate specific keys`);
    console.log(`   • Use --verbose to see why keys are skipped`);
  }

  console.log(
    `\n📝 Next step: Run 'npm run i18n:check' to verify translations.`
  );
}

translateAllLanguages().catch(error => {
  console.error('❌ Translation failed:', error);
  process.exit(1);
});
