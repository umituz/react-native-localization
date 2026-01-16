import fs from 'fs';
import path from 'path';

/**
 * Key Extractor
 * Scans source code and dependencies for i18n keys and their default values
 */

function beautify(key) {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export function extractUsedKeys(srcDir) {
  const keyMap = new Map();
  if (!srcDir) return keyMap;

  const projectRoot = process.cwd();
  const absoluteSrcDir = path.resolve(projectRoot, srcDir);
  
  // 1. PROJECT SPECIFIC: Read Scenarios and Categories
  const enumFiles = [
    { name: 'domains/scenarios/domain/Scenario.ts', type: 'scenario' },
    { name: 'domains/scenarios/domain/CategoryHierarchy.ts', type: 'category' }
  ];

  enumFiles.forEach(cfg => {
    const fullPath = path.resolve(absoluteSrcDir, cfg.name);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (cfg.type === 'scenario') {
        const matches = content.matchAll(/([A-Z0-9_]+)\s*=\s*['"`]([a-z0-9_]+)['"`]/g);
        for (const m of matches) {
          const val = m[2];
          const label = beautify(val);
          keyMap.set(`scenario.${val}.title`, label);
          keyMap.set(`scenario.${val}.description`, label);
          keyMap.set(`scenario.${val}.details`, label);
          keyMap.set(`scenario.${val}.tip`, label);
        }
      }
      
      if (cfg.type === 'category') {
        const blockRegex = /\{[\s\S]*?id:\s*(?:MainCategory|SubCategory)\.([A-Z0-9_]+)[\s\S]*?title:\s*['"`](.*?)['"`][\s\S]*?description:\s*['"`](.*?)['"`]/g;
        let blockMatch;
        while ((blockMatch = blockRegex.exec(content)) !== null) {
          const enumName = blockMatch[1];
          const title = blockMatch[2];
          const desc = blockMatch[3];
          
          const valRegex = new RegExp(`${enumName}\\s*=\\s*['"\`]([a-z0-9_]+)['"\`]`, 'i');
          const valMatch = content.match(valRegex);
          const stringVal = valMatch ? valMatch[1] : enumName.toLowerCase();

          keyMap.set(`scenario.main_category.${stringVal}.title`, title);
          keyMap.set(`scenario.main_category.${stringVal}.description`, desc);
          keyMap.set(`scenario.sub_category.${stringVal}.title`, title);
          keyMap.set(`scenario.sub_category.${stringVal}.description`, desc);
        }
      }
    }
  });

  // 2. Scan directories
  const scanDirs = [
    absoluteSrcDir,
    path.resolve(projectRoot, 'node_modules/@umituz')
  ];

  const IGNORED_DOMAINS = ['.com', '.org', '.net', '.io', '.co', '.app', '.ai', '.gov', '.edu'];
  const IGNORED_EXTENSIONS = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.yaml', '.yml',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf',
    '.mp4', '.mov', '.avi', '.mp3', '.wav', '.css', '.scss', '.md'
  ];
  const IGNORED_LAYOUT_VALS = new Set([
     'center', 'row', 'column', 'flex', 'absolute', 'relative', 'hidden', 'visible', 
     'transparent', 'bold', 'normal', 'italic', 'contain', 'cover', 'stretch', 
     'top', 'bottom', 'left', 'right', 'middle', 'auto', 'none', 'underline', 
     'capitalize', 'uppercase', 'lowercase', 'solid', 'dotted', 'dashed', 'wrap',
     'nowrap', 'space-between', 'space-around', 'flex-start', 'flex-end', 'baseline',
     'react', 'index', 'default', 'string', 'number', 'boolean', 'key', 'id'
  ]);

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const skipDirs = ['node_modules', '.expo', '.git', 'build', 'ios', 'android', 'assets', 'locales', '__tests__'];
        if (!skipDirs.includes(file)) walk(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Pattern 1: t('key')
        const tRegex = /(?:^|\W)t\(['"`]([^'"`]+)['"`]\)/g;
        let match;
        while ((match = tRegex.exec(content)) !== null) {
          const key = match[1];
          if (!key.includes('${') && !keyMap.has(key)) {
            keyMap.set(key, beautify(key));
          }
        }

        // Pattern 2: Global Dot-Notation Strings (non-template)
        const dotRegex = /['"`]([a-z][a-z0-9_]*\.(?:[a-z0-9_]+\.)+[a-z0-9_]+)['"`]/gi;
        while ((match = dotRegex.exec(content)) !== null) {
          const key = match[1];
          const isIgnoredDomain = IGNORED_DOMAINS.some(ext => key.toLowerCase().endsWith(ext));
          const isIgnoredExt = IGNORED_EXTENSIONS.some(ext => key.toLowerCase().endsWith(ext));
          if (!isIgnoredDomain && !isIgnoredExt && !key.includes(' ') && !key.includes('${') && !keyMap.has(key)) {
            keyMap.set(key, beautify(key));
          }
        }

        // Pattern 3: Template Literals t(`prefix.${var}`)
        const templateRegex = /t\(\`([a-z0-9_.]*?)\.\$\{/g;
        while ((match = templateRegex.exec(content)) !== null) {
          const prefix = match[1];
          // Find potential option IDs in the same file
          // We look specifically for strings in arrays [...] to reduce false positives
          const arrayMatches = content.matchAll(/\[([\s\S]*?)\]/g);
          for (const arrayMatch of arrayMatches) {
            const inner = arrayMatch[1];
            const idMatches = inner.matchAll(/['"`]([a-z0-9_]{2,40})['"`]/g);
            for (const idMatch of idMatches) {
              const id = idMatch[1];
              if (IGNORED_LAYOUT_VALS.has(id.toLowerCase())) continue;
              if (/^[0-9]+$/.test(id)) continue; // Skip numeric-only strings
              
              const dynamicKey = `${prefix}.${id}`;
              if (!keyMap.has(dynamicKey)) {
                keyMap.set(dynamicKey, beautify(id));
              }
            }
          }
        }
      }
    }
  }

  scanDirs.forEach(dir => walk(dir));
  
  return keyMap;
}
