#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Pre-Publish Script - Minimal Version
 *
 * Basic checks before publishing
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const EN_US_DIR = path.join(PACKAGE_ROOT, 'src/infrastructure/locales/en-US');

console.log('🔍 Pre-publish checks...\n');

// Check if en-US directory exists
if (!fs.existsSync(EN_US_DIR)) {
  console.error('❌ en-US directory not found!');
  process.exit(1);
}

// Check if en-US has JSON files
const jsonFiles = fs.readdirSync(EN_US_DIR)
  .filter(file => file.endsWith('.json'));

if (jsonFiles.length === 0) {
  console.error('❌ No JSON translation files found!');
  process.exit(1);
}

console.log(`✅ Found ${jsonFiles.length} translation files`);
console.log('✅ Pre-publish checks passed!\n');