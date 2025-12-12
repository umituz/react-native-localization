#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Pre-Publish Script - Generic Package Version
 *
 * Basic checks before publishing for generic localization package
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

console.log('🔍 Pre-publish checks...\n');

// Check if src directory exists
if (!fs.existsSync(SRC_DIR)) {
  console.error('❌ src directory not found!');
  process.exit(1);
}

// Check if main files exist
const mainFiles = [
  'src/index.ts',
  'src/infrastructure/config/i18n.ts',
  'src/infrastructure/storage/LocalizationStore.ts',
];

let allFilesExist = true;
for (const file of mainFiles) {
  const filePath = path.join(PACKAGE_ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file not found: ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  process.exit(1);
}

console.log('✅ All required files found');
console.log('✅ Pre-publish checks passed!\n');