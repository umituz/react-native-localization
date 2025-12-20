#!/usr/bin/env node

/**
 * Pre-Publish Script
 * Basic checks before publishing
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

if (!fs.existsSync(SRC_DIR)) {
  process.exit(1);
}

const mainFiles = [
  'src/index.ts',
  'src/infrastructure/config/i18n.ts',
  'src/infrastructure/storage/LocalizationStore.ts',
];

let allFilesExist = true;
for (const file of mainFiles) {
  const filePath = path.join(PACKAGE_ROOT, file);
  if (!fs.existsSync(filePath)) {
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  process.exit(1);
}
