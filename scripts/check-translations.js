#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { getLocalesDir } = require('./utils/findLocalesDir');

// Function to get all keys from an object recursively
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

// Function to get value by key path
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Function to compare two translation objects
function compareTranslations(enUS, targetLang, filePath, langCode) {
  const enKeys = getAllKeys(enUS);
  const targetKeys = getAllKeys(targetLang);

  const missingInTarget = enKeys.filter(key => !targetKeys.includes(key));
  const extraInTarget = targetKeys.filter(key => !enKeys.includes(key));

  const issues = [];

  // Check for missing keys in target language
  if (missingInTarget.length > 0) {
    issues.push({
      type: 'missing',
      message: `Missing keys in ${langCode}: ${missingInTarget.join(', ')}`,
      keys: missingInTarget,
    });
  }

  // Check for extra keys in target language
  if (extraInTarget.length > 0) {
    issues.push({
      type: 'extra',
      message: `Extra keys in ${langCode}: ${extraInTarget.join(', ')}`,
      keys: extraInTarget,
    });
  }

  // Check for empty or placeholder values in target language
  enKeys.forEach(key => {
    if (targetKeys.includes(key)) {
      const enValue = getValueByPath(enUS, key);
      const targetValue = getValueByPath(targetLang, key);

      // Skip checking if the value is the same and it's a common English word that doesn't need translation
      const commonEnglishWords = [
        'Premium',
        'EULA',
        'Plan',
        'OK',
        'API',
        'URL',
        'iOS',
        'Android',
        'minute',
        'min',
        'Sessions',
        'Points',
        'Nature',
        'Instrumental',
        'Piano',
        'Silence',
        'Pause',
        'Gratitude',
        'Notes',
        '5 min',
        '10 min',
        '15 min',
        '20 min',
        '30 min',
        '{{count}} min',
        '{{duration}} min',
        '{{duration}} • {{cycles}} cycles',
        'No',
        'Error',
        'Try Again',
        'Back',
        'Oops! Something went wrong',
        "We encountered an unexpected error. Don't worry, your meditation data is safe.",
        "This screen doesn't exist.",
        'Go to home screen!',
        'No meditation cards available',
        "Thank you for reporting this bug! We'll investigate and fix it as soon as possible.",
        "Thank you for your feature request! We'll consider it for future updates.",
        'Thank you for your suggestion! We appreciate your input and will review it carefully.',
        'Your feedback has been submitted successfully. We appreciate your input!',
        'Continue',
        'Go Home',
        'Start Meditating',
        'Begin Your Journey',
        'Detailed statistics',
        'Achievement badges',
        'Weekly/monthly reports',
        'Sign Up',
        'Sign In',
        'Breathe In',
        'Hold',
        'Breathe Out',
        'Rest',
        'Find a comfortable seated position',
        'Focus on slow, controlled movements',
        "Don't force the breath, let it flow naturally",
        'Cycle {{current}} of {{total}}',
        '{{inhale}}s in • {{hold}}s hold • {{exhale}}s out',
        'Total elapsed: {{time}}',
        'Cancel',
        'End Session',
        'Reset',
        "Today's Progress",
        'See All',
        'Total Time',
        'Streak',
        'Last Session',
        'minutes completed',
        'Find a quiet, comfortable space',
        'Focus on your breath naturally',
        'Let thoughts come and go without judgment',
        'Start with shorter sessions and build up',
        'Legal',
        'Loading sounds...',
      ];
      const shouldSkip =
        commonEnglishWords.includes(enValue) && targetValue === enValue;

      // Check if value needs translation
      // Skip if already translated (different from English) - protects manual translations
      const isAlreadyTranslated = targetValue !== enValue;
      
      if (
        !shouldSkip &&
        !isAlreadyTranslated &&
        (!targetValue ||
          (typeof targetValue === 'string' && targetValue.trim() === '') ||
          targetValue === enValue ||
          targetValue.includes('[NEEDS TRANSLATION]') ||
          targetValue.includes('[MISSING:') ||
          targetValue.includes('[ÇEVİRİ GEREKLİ:') ||
          targetValue.includes('[TRANSLATE:'))
      ) {
        issues.push({
          type: 'translation',
          message: `Key "${key}" has empty, missing, or untranslated value`,
          key: key,
          enValue: enValue,
          targetValue: targetValue,
        });
      }
    }
  });

  return {
    file: filePath,
    issues: issues,
    totalEnKeys: enKeys.length,
    totalTargetKeys: targetKeys.length,
    missingCount: missingInTarget.length,
    extraCount: extraInTarget.length,
  };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const targetLanguage = args.find(arg => !arg.startsWith('--'));

  if (!targetLanguage) {
    console.log('Kullanım: npm run i18n:check <dil-kodu>');
    console.log('Örnek: npm run i18n:check de-DE');
    console.log('Örnek: npm run i18n:check fr-FR');
    console.log('Örnek: npm run i18n:check tr-TR');
    console.log(
      'Örnek: npm run i18n:check spanish (tüm İspanyolca varyantları)'
    );
    console.log(
      '\nTüm dilleri kontrol etmek için: npm run i18n:check all'
    );
    process.exit(1);
  }

  // Find project's locales directory
  const localesDir = getLocalesDir();
  const enUSDir = path.join(localesDir, 'en-US');

  // 🔥 CRITICAL FIX: Auto-discover all JSON files (NO HARDCODED LIST!)
  // This ensures check-translations works with ANY en-US file structure
  const files = fs
    .readdirSync(enUSDir)
    .filter(file => file.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.error('❌ No JSON files found in en-US directory!');
    process.exit(1);
  }

  console.log(`🔍 Discovered ${files.length} translation files in en-US:\n   ${files.join(', ')}\n`);

  // Get all language directories
  const allLanguageDirs = fs
    .readdirSync(localesDir)
    .filter(dir => {
      const fullPath = path.join(localesDir, dir);
      return fs.statSync(fullPath).isDirectory() && dir !== 'en-US';
    })
    .sort();

  // Determine which languages to process
  let languageDirs = allLanguageDirs;
  if (targetLanguage !== 'all') {
    if (targetLanguage === 'spanish' || targetLanguage === 'es') {
      // Check all Spanish variants
      languageDirs = allLanguageDirs.filter(dir => dir.startsWith('es-'));
      if (languageDirs.length === 0) {
        console.log('❌ No Spanish variants found.');
        process.exit(1);
      }
    } else if (allLanguageDirs.includes(targetLanguage)) {
      languageDirs = [targetLanguage];
    } else {
      console.log(
        `❌ Language ${targetLanguage} not found. Available languages: ${allLanguageDirs.join(', ')}`
      );
      process.exit(1);
    }
  }

  let totalIssues = 0;
  let totalMissing = 0;
  let totalExtra = 0;
  let totalTranslationIssues = 0;
  let languagesWithIssues = 0;

  console.log(
    `🔍 Checking ${languageDirs.length} language(s) against English (en-US)...\n`
  );

  // Check each language
  languageDirs.forEach(langCode => {
    const langDir = path.join(localesDir, langCode);
    let langIssues = 0;
    let langMissing = 0;
    let langExtra = 0;
    let langTranslationIssues = 0;

    console.log(`\n🌍 Checking ${langCode}...`);

    files.forEach(file => {
      const enUSPath = path.join(enUSDir, file);
      const langPath = path.join(langDir, file);

      if (!fs.existsSync(enUSPath)) {
        console.log(`   ❌ English file not found: ${file}`);
        return;
      }

      if (!fs.existsSync(langPath)) {
        console.log(`   ❌ ${langCode} file not found: ${file}`);
        return;
      }

      try {
        const enUS = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));
        const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

        const comparison = compareTranslations(enUS, langData, file, langCode);

        if (comparison.issues.length === 0) {
          console.log(`   ✅ ${file}: Complete`);
        } else {
          console.log(
            `   📄 ${file}: ${comparison.missingCount} missing, ${comparison.extraCount} extra, ${comparison.issues.filter(i => i.type === 'translation').length} untranslated`
          );

          // Show detailed issues for debugging
          comparison.issues.forEach(issue => {
            if (issue.type === 'translation') {
              console.log(
                `     🔍 ${issue.key}: "${issue.enValue}" → "${issue.targetValue || '[EMPTY]'}"`
              );
            } else if (issue.type === 'extra') {
              console.log(`     ➕ Extra keys: ${issue.keys.join(', ')}`);
            } else if (issue.type === 'missing') {
              console.log(`     ➖ Missing keys: ${issue.keys.join(', ')}`);
            }
            langIssues++;
            totalIssues++;
            if (issue.type === 'missing') {
              langMissing += issue.keys.length;
              totalMissing += issue.keys.length;
            } else if (issue.type === 'extra') {
              langExtra += issue.keys.length;
              totalExtra += issue.keys.length;
            } else if (issue.type === 'translation') {
              langTranslationIssues++;
              totalTranslationIssues++;
            }
          });
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${file}: ${error.message}`);
      }
    });

    // Summary for this language
    if (langIssues === 0) {
      console.log(`   🎉 ${langCode}: All translations complete!`);
    } else {
      languagesWithIssues++;
      console.log(
        `   ⚠️  ${langCode}: ${langIssues} issues (${langMissing} missing, ${langExtra} extra, ${langTranslationIssues} translation issues)`
      );
    }
  });

  console.log('\n📊 Summary:');
  console.log(`   Languages checked: ${languageDirs.length}`);
  console.log(`   Languages with issues: ${languagesWithIssues}`);
  console.log(`   Total issues found: ${totalIssues}`);
  console.log(`   Missing keys: ${totalMissing}`);
  console.log(`   Extra keys: ${totalExtra}`);
  console.log(`   Translation issues: ${totalTranslationIssues}`);

  if (totalIssues === 0) {
    console.log('\n🎉 All translations are complete and correct!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${languagesWithIssues} language(s) need attention.`);
    process.exit(1);
  }
}

main();
