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
  if (!fs.existsSync(absoluteSrcDir)) return keys;

  // Step 1: Find all ScenarioId possible values once
  const scenarioValues = new Set();
  const scenarioFile = path.resolve(absoluteSrcDir, 'domains/scenarios/domain/Scenario.ts');
  if (fs.existsSync(scenarioFile)) {
    const content = fs.readFileSync(scenarioFile, 'utf8');
    const matches = content.matchAll(/([A-Z0-9_]+)\s*=\s*['"`]([a-z0-9_]+)['"`]/g);
    for (const match of matches) {
      scenarioValues.add(match[2]);
    }
  }

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const skipDirs = ['node_modules', '.expo', '.git', 'build', 'ios', 'android', 'assets'];
        if (!skipDirs.includes(file)) walk(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Pattern 1: Standard t('key') calls
        const tRegex = /(?:^|\W)t\(['"`]([^'"`]+)['"`]\)/g;
        let match;
        while ((match = tRegex.exec(content)) !== null) {
          if (!match[1].includes('${')) keys.add(match[1]);
        }

        // Pattern 2: Scenario ID usage
        // If we see ScenarioId.XXXX or just the string value matching a scenario
        scenarioValues.forEach(val => {
          if (content.includes(val)) {
            keys.add(`scenario.${val}.title`);
            keys.add(`scenario.${val}.description`);
            keys.add(`scenario.${val}.details`);
            keys.add(`scenario.${val}.tip`);
          }
        });

        // Pattern 3: Dot-notation keys in configs/literals (e.g. "common.button.save")
        // We look for at least two segments (one dot)
        const dotRegex = /['"`]([a-z][a-z0-9_]*\.[a-z0-9_.]*[a-z0-9_])['"`]/gi;
        while ((match = dotRegex.exec(content)) !== null) {
          const key = match[1];
          const isFile = /\.(ts|tsx|js|jsx|png|jpg|jpeg|svg|json)$/i.test(key);
          if (!isFile && !key.includes(' ') && !key.includes('${')) {
            keys.add(key);
          }
        }
      }
    }
  }

  walk(absoluteSrcDir);
  return keys;
}
