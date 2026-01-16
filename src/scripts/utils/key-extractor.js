import fs from 'fs';
import path from 'path';

/**
 * Key Extractor
 * Scans source code for i18n keys
 */

export function extractUsedKeys(srcDir) {
  const keys = new Set();
  if (!srcDir) return keys;

  const absoluteSrcDir = path.resolve(process.cwd(), srcDir);
  if (!fs.existsSync(absoluteSrcDir)) {
    return keys;
  }

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const skipDirs = ['node_modules', '.expo', '.git', 'build', 'ios', 'android', 'assets'];
        if (!skipDirs.includes(file)) {
          walk(fullPath);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Regex for t('key') or t("key") or i18n.t('key')
        const regex = /(?:^|\W)t\(['"]([^'"]+)['"]\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          keys.add(match[1]);
        }
      }
    }
  }

  walk(absoluteSrcDir);
  return keys;
}
