#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Pre-Publish Script
 * 
 * This script runs automatically before npm publish to ensure:
 * 1. en-US translation files are ready
 * 2. en-US index.ts loader is generated
 * 3. All required files are in place
 * 
 * Runs automatically via "prepublishOnly" npm script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const EN_US_DIR = path.join(PACKAGE_ROOT, 'src/infrastructure/locales/en-US');
const EN_US_INDEX = path.join(EN_US_DIR, 'index.ts');

console.log('🔍 Pre-publish checks...\n');

// Check if en-US directory exists
if (!fs.existsSync(EN_US_DIR)) {
  console.error('❌ en-US directory not found!');
  console.error(`   Expected: ${EN_US_DIR}`);
  process.exit(1);
}

// Check if en-US has JSON files
const jsonFiles = fs.readdirSync(EN_US_DIR)
  .filter(file => file.endsWith('.json'))
  .sort();

if (jsonFiles.length === 0) {
  console.error('❌ No JSON translation files found in en-US directory!');
  process.exit(1);
}

console.log(`✅ Found ${jsonFiles.length} translation files in en-US:`);
jsonFiles.forEach(file => console.log(`   - ${file}`));

// Generate index.ts if it doesn't exist or is outdated
const needsIndexUpdate = !fs.existsSync(EN_US_INDEX) || 
  jsonFiles.some(file => {
    const filePath = path.join(EN_US_DIR, file);
    const indexStat = fs.statSync(EN_US_INDEX);
    const fileStat = fs.statSync(filePath);
    return fileStat.mtime > indexStat.mtime;
  });

if (needsIndexUpdate) {
  console.log('\n📝 Generating en-US index.ts loader...');
  try {
    // Run createLocaleLoaders script for en-US
    const createLoaderScript = path.join(PACKAGE_ROOT, 'scripts/createLocaleLoaders.js');
    execSync(`node "${createLoaderScript}" en-US`, {
      stdio: 'inherit',
      cwd: PACKAGE_ROOT,
    });
    console.log('✅ en-US index.ts generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate en-US index.ts:', error.message);
    process.exit(1);
  }
} else {
  console.log('\n✅ en-US index.ts is up to date');
}

// Verify index.ts exists
if (!fs.existsSync(EN_US_INDEX)) {
  console.error('❌ en-US/index.ts not found after generation!');
  process.exit(1);
}

console.log('\n✅ Pre-publish checks passed!');
console.log('   Package is ready to publish.\n');

