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

// Function to remove a key from an object by path
function removeKeyByPath(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      return false; // Path doesn't exist
    }
    current = current[keys[i]];
  }
  
  const lastKey = keys[keys.length - 1];
  if (current.hasOwnProperty(lastKey)) {
    delete current[keys[keys.length - 1]];
    
    // Clean up empty parent objects
    if (keys.length > 1) {
      let parent = obj;
      for (let i = 0; i < keys.length - 2; i++) {
        parent = parent[keys[i]];
      }
      const parentKey = keys[keys.length - 2];
      if (Object.keys(parent[parentKey]).length === 0) {
        delete parent[parentKey];
      }
    }
    
    return true;
  }
  return false;
}

// Function to remove unused keys from a translation file
function removeUnusedKeys(enUS, targetLang, filePath, langCode, dryRun = false) {
  const enKeys = getAllKeys(enUS);
  const targetKeys = getAllKeys(targetLang);
  
  const extraKeys = targetKeys.filter(key => !enKeys.includes(key));
  
  if (extraKeys.length === 0) {
    return { removed: 0, keys: [] };
  }
  
  // Create a deep copy to modify
  const cleanedLang = JSON.parse(JSON.stringify(targetLang));
  
  let removedCount = 0;
  for (const key of extraKeys) {
    if (removeKeyByPath(cleanedLang, key)) {
      removedCount++;
    }
  }
  
  if (!dryRun && removedCount > 0) {
    // Write cleaned file
    const targetFile = filePath;
    fs.writeFileSync(targetFile, JSON.stringify(cleanedLang, null, 2) + '\n', 'utf8');
  }
  
  return { removed: removedCount, keys: extraKeys };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const targetLanguage = args.find(arg => !arg.startsWith('--'));
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const allLanguages = args.includes('--all') || args.includes('-a');
  
  if (!targetLanguage && !allLanguages) {
    console.log('Usage: npm run i18n:remove-unused <language-code> [--dry-run]');
    console.log('Example: npm run i18n:remove-unused tr-TR');
    console.log('Example: npm run i18n:remove-unused tr-TR --dry-run (preview only, no removal)');
    console.log('Example: npm run i18n:remove-unused --all (all languages)');
    process.exit(1);
  }
  
  // Find project's locales directory
  const localesDir = getLocalesDir();
  const enUSDir = path.join(localesDir, 'en-US');
  
  // Auto-discover all JSON files
  const files = fs
    .readdirSync(enUSDir)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  if (files.length === 0) {
    console.error('❌ No JSON files found in en-US directory!');
    process.exit(1);
  }
  
  // Get language directories
  const allLanguageDirs = fs
    .readdirSync(localesDir)
    .filter(dir => {
      const fullPath = path.join(localesDir, dir);
      return fs.statSync(fullPath).isDirectory() && dir !== 'en-US';
    })
    .sort();
  
  // Determine which languages to process
  let languageDirs = allLanguageDirs;
  if (!allLanguages) {
    if (targetLanguage === 'spanish' || targetLanguage === 'es') {
      languageDirs = allLanguageDirs.filter(dir => dir.startsWith('es-'));
    } else if (allLanguageDirs.includes(targetLanguage)) {
      languageDirs = [targetLanguage];
    } else {
      console.log(`❌ Language ${targetLanguage} not found. Available: ${allLanguageDirs.join(', ')}`);
      process.exit(1);
    }
  }
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  let totalRemoved = 0;
  let totalFiles = 0;
  
  console.log(`🧹 Removing unused keys from ${languageDirs.length} language(s)...\n`);
  
  languageDirs.forEach(langCode => {
    const langDir = path.join(localesDir, langCode);
    let langRemoved = 0;
    let langFiles = 0;
    
    console.log(`\n🌍 Processing ${langCode}...`);
    
    files.forEach(file => {
      const enUSPath = path.join(enUSDir, file);
      const langPath = path.join(langDir, file);
      
      if (!fs.existsSync(enUSPath)) {
        return;
      }
      
      if (!fs.existsSync(langPath)) {
        return;
      }
      
      try {
        const enUS = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));
        const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
        
        const result = removeUnusedKeys(enUS, langData, langPath, langCode, dryRun);
        
        if (result.removed > 0) {
          langRemoved += result.removed;
          langFiles++;
          totalRemoved += result.removed;
          totalFiles++;
          
          if (dryRun) {
            console.log(`   🔍 ${file}: Would remove ${result.removed} key(s): ${result.keys.slice(0, 5).join(', ')}${result.keys.length > 5 ? '...' : ''}`);
          } else {
            console.log(`   ✅ ${file}: Removed ${result.removed} unused key(s): ${result.keys.slice(0, 5).join(', ')}${result.keys.length > 5 ? '...' : ''}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${file}: ${error.message}`);
      }
    });
    
    if (langRemoved === 0) {
      console.log(`   ✅ ${langCode}: No unused keys found`);
    } else {
      console.log(`   📊 ${langCode}: Removed ${langRemoved} unused key(s) from ${langFiles} file(s)`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Languages processed: ${languageDirs.length}`);
  console.log(`   Files modified: ${totalFiles}`);
  console.log(`   Total keys removed: ${totalRemoved}`);
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to actually remove the keys.');
  } else if (totalRemoved > 0) {
    console.log('\n✅ Unused keys removed successfully!');
  } else {
    console.log('\n✅ No unused keys found!');
  }
}

main();

