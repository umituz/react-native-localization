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

async function setupLanguages() {
  // Find or create project's locales directory
  const localesDir = getLocalesDir(true); // Create if not exists
  const enUSDir = path.join(localesDir, "en-US");

  console.log("🚀 Setting up language directories and files...\n");

  // Create en-US directory if it doesn't exist
  if (!fs.existsSync(enUSDir)) {
    fs.mkdirSync(enUSDir, { recursive: true });
    console.log(`📁 Created en-US directory: ${enUSDir}`);
  }

  // Get default files from localization package
  const packageRoot = path.dirname(require.resolve('@umituz/react-native-localization/package.json'));
  const packageEnUSDir = path.join(packageRoot, 'src/infrastructure/locales/en-US');
  const defaultFiles = [
    'auth.json',
    'branding.json',
    'datetime.json',
    'errors.json',
    'general.json',
    'navigation.json',
    'onboarding.json',
    'settings.json',
  ];

  // Copy default files from package if they don't exist in project
  let copiedFiles = 0;
  if (fs.existsSync(packageEnUSDir)) {
    for (const file of defaultFiles) {
      const packageFile = path.join(packageEnUSDir, file);
      const projectFile = path.join(enUSDir, file);
      
      if (fs.existsSync(packageFile) && !fs.existsSync(projectFile)) {
        const content = fs.readFileSync(packageFile, "utf8");
        fs.writeFileSync(projectFile, content);
        console.log(`📄 Copied default file: en-US/${file}`);
        copiedFiles++;
      }
    }
  }

  // Automatically discover all JSON files in en-US directory
  const files = fs
    .readdirSync(enUSDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.error("❌ No JSON files found in en-US directory!");
    console.error("   Please add translation files to:", enUSDir);
    process.exit(1);
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
