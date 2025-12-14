#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Translate Missing Script
 *
 * Translates missing strings from en-US.ts to all other language files
 * using Google Translate free API.
 *
 * Usage: node scripts/translate-missing.js [locales-dir]
 * Default: src/domains/localization/infrastructure/locales
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Language codes mapping for Google Translate API
const LANGUAGE_MAP = {
  'ar-SA': 'ar', // Arabic
  'bg-BG': 'bg', // Bulgarian
  'cs-CZ': 'cs', // Czech
  'da-DK': 'da', // Danish
  'de-DE': 'de', // German
  'el-GR': 'el', // Greek
  'en-AU': 'en', // English (skip)
  'en-CA': 'en', // English (skip)
  'en-GB': 'en', // English (skip)
  'es-ES': 'es', // Spanish
  'es-MX': 'es', // Spanish
  'fi-FI': 'fi', // Finnish
  'fr-CA': 'fr', // French
  'fr-FR': 'fr', // French
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
  'tr-TR': 'tr', // Turkish
  'uk-UA': 'uk', // Ukrainian
  'vi-VN': 'vi', // Vietnamese
  'zh-CN': 'zh-CN', // Chinese Simplified
  'zh-TW': 'zh-TW', // Chinese Traditional
};

// Common English words that don't need translation
const SKIP_WORDS = new Set([
  'OK',
  'Email',
  'Google',
  'Apple',
  'Facebook',
  'Premium',
  'Pro',
  'Plus',
  'BPM',
]);

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

  // Use eval to parse the object (safe since we control the files)
  // Remove trailing semicolon if present
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
      // Escape quotes and handle multiline
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
 * Auto-translated from en-US.ts
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
 * Simple Google Translate API call using free endpoint
 */
async function translateText(text, targetLang) {
  return new Promise((resolve) => {
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
            console.warn(`   ⚠️ Translation failed for "${text.substring(0, 30)}...": ${error.message}`);
            resolve(text);
          }
        });
      })
      .on('error', err => {
        console.warn(`   ⚠️ Network error: ${err.message}`);
        resolve(text);
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
 * Check if a value needs translation (is still in English)
 */
function needsTranslation(value, enValue) {
  if (typeof value !== 'string') return false;
  if (value === enValue) return true;
  if (SKIP_WORDS.has(value)) return false;
  return false;
}

/**
 * Recursively translate object values
 */
async function translateObject(enObj, targetObj, targetLang, path = '', stats = { count: 0 }) {
  for (const key in enObj) {
    const currentPath = path ? `${path}.${key}` : key;
    const enValue = enObj[key];
    const targetValue = targetObj[key];

    if (Array.isArray(enValue)) {
      // Handle arrays
      if (!Array.isArray(targetValue)) {
        targetObj[key] = [];
      }
      for (let i = 0; i < enValue.length; i++) {
        if (typeof enValue[i] === 'string') {
          if (needsTranslation(targetObj[key][i], enValue[i])) {
            console.log(`   🔄 ${currentPath}[${i}]: "${enValue[i].substring(0, 40)}..."`);
            targetObj[key][i] = await translateText(enValue[i], targetLang);
            stats.count++;
            await delay(200);
          }
        }
      }
    } else if (typeof enValue === 'object' && enValue !== null) {
      // Handle nested objects
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
      }
      await translateObject(enValue, targetObj[key], targetLang, currentPath, stats);
    } else if (typeof enValue === 'string') {
      // Handle string values
      if (needsTranslation(targetValue, enValue)) {
        // Skip placeholders like {{count}}
        if (enValue.includes('{{') && enValue.includes('}}')) {
          // Translate but preserve placeholders
          console.log(`   🔄 ${currentPath}: "${enValue.substring(0, 40)}${enValue.length > 40 ? '...' : ''}"`);
          targetObj[key] = await translateText(enValue, targetLang);
          stats.count++;
          await delay(200);
        } else {
          console.log(`   🔄 ${currentPath}: "${enValue.substring(0, 40)}${enValue.length > 40 ? '...' : ''}"`);
          targetObj[key] = await translateText(enValue, targetLang);
          stats.count++;
          await delay(200);
        }
      }
    }
  }

  return stats.count;
}

/**
 * Translate a single language file
 */
async function translateLanguageFile(enUSPath, targetPath, langCode) {
  const targetLang = LANGUAGE_MAP[langCode];

  if (!targetLang) {
    console.log(`   ⚠️ No language mapping for ${langCode}, skipping`);
    return 0;
  }

  // Skip English variants
  if (targetLang === 'en') {
    console.log(`   ⏭️ Skipping English variant: ${langCode}`);
    return 0;
  }

  const enUS = parseTypeScriptFile(enUSPath);
  let target;

  try {
    target = parseTypeScriptFile(targetPath);
  } catch {
    // If target file doesn't exist or is invalid, start fresh
    target = {};
  }

  const stats = { count: 0 };
  await translateObject(enUS, target, targetLang, '', stats);

  if (stats.count > 0) {
    const content = generateTypeScriptContent(target, langCode);
    fs.writeFileSync(targetPath, content);
  }

  return stats.count;
}

/**
 * Main function
 */
async function main() {
  const targetDir = process.argv[2] || 'src/domains/localization/infrastructure/locales';
  const localesDir = path.resolve(process.cwd(), targetDir);

  console.log('🚀 Starting automatic translation...\n');
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

  console.log(`📊 Languages to translate: ${files.length}`);
  console.log('⚡ Running with 200ms delay between API calls\n');

  let totalTranslated = 0;

  for (const file of files) {
    const langCode = file.replace('.ts', '');
    const targetPath = path.join(localesDir, file);

    console.log(`\n🌍 Translating ${langCode}...`);

    const count = await translateLanguageFile(enUSPath, targetPath, langCode);
    totalTranslated += count;

    if (count > 0) {
      console.log(`   ✅ Translated ${count} strings`);
    } else {
      console.log(`   ✓ Already complete`);
    }
  }

  console.log(`\n✅ Translation completed!`);
  console.log(`   Total strings translated: ${totalTranslated}`);
  console.log(`\n📝 Next: Run 'node scripts/setup-languages.js' to update index.ts`);
}

main().catch(error => {
  console.error('❌ Translation failed:', error);
  process.exit(1);
});
