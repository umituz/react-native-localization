#!/usr/bin/env node
/**
 * Utility to find project's locales directory
 * Searches common paths for localization files
 */

const fs = require('fs');
const path = require('path');

/**
 * Find locales directory in project
 * @returns {string|null} Path to locales directory or null if not found
 */
function findLocalesDir() {
  const projectRoot = process.cwd();
  
  // Common paths to search
  const possiblePaths = [
    // DDD structure
    path.join(projectRoot, 'src/domains/localization/infrastructure/locales'),
    path.join(projectRoot, 'src/domains/i18n/infrastructure/locales'),
    path.join(projectRoot, 'src/infrastructure/localization/locales'),
    // Simple structure
    path.join(projectRoot, 'src/locales'),
    path.join(projectRoot, 'locales'),
    path.join(projectRoot, 'translations'),
    // Alternative DDD
    path.join(projectRoot, 'src/features/localization/locales'),
  ];
  
  // Find first existing path with en-US directory
  for (const possiblePath of possiblePaths) {
    const enUSPath = path.join(possiblePath, 'en-US');
    if (fs.existsSync(possiblePath) && fs.existsSync(enUSPath)) {
      return possiblePath;
    }
  }
  
  return null;
}

/**
 * Get or create locales directory
 * @param {boolean} createIfNotExists - Create directory if it doesn't exist (for setup script)
 * @returns {string} Path to locales directory
 */
function getLocalesDir(createIfNotExists = false) {
  let localesDir = findLocalesDir();
  
  if (!localesDir) {
    if (createIfNotExists) {
      // Try to create in most common location
      const projectRoot = process.cwd();
      localesDir = path.join(projectRoot, 'src/domains/localization/infrastructure/locales');
      const enUSDir = path.join(localesDir, 'en-US');
      
      if (!fs.existsSync(localesDir)) {
        fs.mkdirSync(localesDir, { recursive: true });
        fs.mkdirSync(enUSDir, { recursive: true });
        console.log(`✅ Created locales directory: ${localesDir}`);
      }
      
      return localesDir;
    }
    
    console.error('❌ Locales directory not found!');
    console.error('\nPlease create a locales directory in one of these locations:');
    console.error('  - src/domains/localization/infrastructure/locales');
    console.error('  - src/locales');
    console.error('  - locales');
    console.error('\nOr run: npm run i18n:setup');
    process.exit(1);
  }
  
  return localesDir;
}

module.exports = { findLocalesDir, getLocalesDir };

