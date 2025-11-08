#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { getLocalesDir } = require('./utils/findLocalesDir');

// All 38 languages (excluding en-US)
const LANGUAGES = [
  "ar-SA", // Arabic
  "bg-BG", // Bulgarian
  "cs-CZ", // Czech
  "da-DK", // Danish
  "de-DE", // German
  "el-GR", // Greek
  "en-AU", // English (Australia)
  "en-CA", // English (Canada)
  "en-GB", // English (UK)
  "es-ES", // Spanish (Spain)
  "es-MX", // Spanish (Mexico)
  "fi-FI", // Finnish
  "fr-CA", // French (Canada)
  "fr-FR", // French (France)
  "hi-IN", // Hindi
  "hr-HR", // Croatian
  "hu-HU", // Hungarian
  "id-ID", // Indonesian
  "it-IT", // Italian
  "ja-JP", // Japanese
  "ko-KR", // Korean
  "ms-MY", // Malay
  "nl-NL", // Dutch
  "no-NO", // Norwegian
  "pl-PL", // Polish
  "pt-BR", // Portuguese (Brazil)
  "pt-PT", // Portuguese (Portugal)
  "ro-RO", // Romanian
  "ru-RU", // Russian
  "sk-SK", // Slovak
  "sv-SE", // Swedish
  "th-TH", // Thai
  "tl-PH", // Tagalog
  "tr-TR", // Turkish
  "uk-UA", // Ukrainian
  "vi-VN", // Vietnamese
  "zh-CN", // Chinese Simplified
  "zh-TW", // Chinese Traditional
];

// Default translation files from package
const DEFAULT_FILES = [
  'auth.json',
  'branding.json',
  'datetime.json',
  'errors.json',
  'flashcards.json',
  'general.json',
  'navigation.json',
  'onboarding.json',
  'settings.json',
];

// Get path to package's default en-US files
function getPackageEnUSPath() {
  // Script is in: node_modules/@umituz/react-native-localization/scripts/setup-languages.js
  // Package en-US is in: node_modules/@umituz/react-native-localization/src/infrastructure/locales/en-US
  const scriptDir = __dirname;
  const packageRoot = path.resolve(scriptDir, '..');
  return path.join(packageRoot, 'src/infrastructure/locales/en-US');
}

async function setupLanguages() {
  // Find or create project's locales directory
  const localesDir = getLocalesDir(true); // Create if not exists
  const enUSDir = path.join(localesDir, "en-US");
  const packageEnUSPath = getPackageEnUSPath();

  console.log("🚀 Setting up language directories and files...\n");

  // Create en-US directory if it doesn't exist
  if (!fs.existsSync(enUSDir)) {
    fs.mkdirSync(enUSDir, { recursive: true });
    console.log(`📁 Created directory: en-US/`);
  }

  // Check if en-US directory has any JSON files
  let files = [];
  if (fs.existsSync(enUSDir)) {
    files = fs
      .readdirSync(enUSDir)
      .filter((file) => file.endsWith(".json"))
      .sort();
  }

  // If no files found, copy default files from package
  if (files.length === 0) {
    console.log("📦 No JSON files found in en-US directory.");
    console.log("   Copying default files from package...\n");
    
    if (!fs.existsSync(packageEnUSPath)) {
      console.error("❌ Package default files not found!");
      console.error("   Expected path:", packageEnUSPath);
      console.error("   Please ensure @umituz/react-native-localization is installed.");
      process.exit(1);
    }

    // Copy default files from package
    for (const file of DEFAULT_FILES) {
      const packageFile = path.join(packageEnUSPath, file);
      const targetFile = path.join(enUSDir, file);
      
      if (fs.existsSync(packageFile)) {
        const content = fs.readFileSync(packageFile, "utf8");
        fs.writeFileSync(targetFile, content);
        console.log(`   📄 Created: en-US/${file}`);
        files.push(file);
      } else {
        console.warn(`   ⚠️  Warning: Default file not found in package: ${file}`);
      }
    }
    
    if (files.length === 0) {
      console.error("❌ Failed to copy default files from package!");
      process.exit(1);
    }
    
    console.log("");
  }

  console.log(`📄 Found ${files.length} translation files in en-US:`);
  files.forEach((file) => console.log(`   - ${file}`));
  console.log("");

  let createdDirs = 0;
  let createdFiles = 0;

  for (const langCode of LANGUAGES) {
    const langDir = path.join(localesDir, langCode);

    // Create language directory if it doesn't exist
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
      console.log(`📁 Created directory: ${langCode}/`);
      createdDirs++;
    }

    // Copy each file from en-US
    for (const file of files) {
      const enUSFile = path.join(enUSDir, file);
      const targetFile = path.join(langDir, file);

      if (!fs.existsSync(targetFile)) {
        // Copy the en-US file as a starting point
        const content = fs.readFileSync(enUSFile, "utf8");
        fs.writeFileSync(targetFile, content);
        console.log(`   📄 Created: ${langCode}/${file}`);
        createdFiles++;
      }
    }
  }

  console.log(`\n✅ Setup completed!`);
  console.log(`   Directories created: ${createdDirs}`);
  console.log(`   Files created: ${createdFiles}`);
  console.log(`   Total languages: ${LANGUAGES.length + 1} (including en-US)`);
  console.log(
    `\n📝 Next steps:`,
  );
  console.log(`   1. Add your translation keys to en-US/*.json files`);
  console.log(`   2. Run 'npm run i18n:translate' to auto-translate all languages`);
  console.log(`   3. Run 'npm run i18n:check all' to verify completeness`);
}

setupLanguages().catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exit(1);
});
