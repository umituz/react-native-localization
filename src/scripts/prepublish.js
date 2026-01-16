#!/usr/bin/env node

/**
 * Pre-Publish Script
 * Basic checks before publishing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

if (!fs.existsSync(SRC_DIR)) {
  console.error('❌ src directory not found');
  process.exit(1);
}

const mainFiles = [
  'src/index.ts',
  'src/infrastructure/config/i18n.ts',
];

for (const file of mainFiles) {
  const filePath = path.join(PACKAGE_ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing mandatory file: ${file}`);
    process.exit(1);
  }
}

console.log('✅ Pre-publish checks passed!');
