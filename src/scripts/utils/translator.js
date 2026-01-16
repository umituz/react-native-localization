import https from 'https';
import { shouldSkipWord } from './translation-config.js';

/**
 * Translator
 * Google Translate API integration and translation logic
 */

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    if (shouldSkipWord(text)) {
      resolve(text);
      return;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;

    https
      .get(url, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const translated = parsed[0]
              .map(item => item[0])
              .join('')
              .trim();
            resolve(translated || text);
          } catch (error) {
            resolve(text);
          }
        });
      })
      .on('error', () => {
        resolve(text);
      });
  });
}

function needsTranslation(value, enValue) {
  if (typeof enValue !== 'string') return false;
  if (shouldSkipWord(enValue)) return false;
  if (!value || typeof value !== 'string') return true;

  if (value === enValue) {
    const isSingleWord = !enValue.includes(' ') && enValue.length < 20;
    return !isSingleWord;
  }

  return false;
}

export async function translateObject(enObj, targetObj, targetLang, path = '', stats = { count: 0, newKeys: [] }) {
  for (const key in enObj) {
    const currentPath = path ? `${path}.${key}` : key;
    const enValue = enObj[key];
    const targetValue = targetObj[key];

    if (Array.isArray(enValue)) {
      if (!Array.isArray(targetValue)) targetObj[key] = [];
      for (let i = 0; i < enValue.length; i++) {
        if (typeof enValue[i] === 'string' && needsTranslation(targetObj[key][i], enValue[i])) {
          const translated = await translateText(enValue[i], targetLang);
          if (translated !== enValue[i]) {
            const isNewKey = targetObj[key][i] === enValue[i];
            console.log(`   ${isNewKey ? '🆕 NEW' : '🔄'} ${currentPath}[${i}]: "${enValue[i].substring(0, 40)}"`);
            targetObj[key][i] = translated;
            stats.count++;
            if (isNewKey) stats.newKeys.push(`${currentPath}[${i}]`);
          }
          await delay(200);
        }
      }
    } else if (typeof enValue === 'object' && enValue !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') targetObj[key] = {};
      await translateObject(enValue, targetObj[key], targetLang, currentPath, stats);
    } else if (typeof enValue === 'string' && needsTranslation(targetValue, enValue)) {
      const translated = await translateText(enValue, targetLang);
      const isNewKey = targetValue === undefined;
      if (translated !== enValue || isNewKey) {
        console.log(`   ${isNewKey ? '🆕 NEW' : '🔄'} ${currentPath}: "${enValue.substring(0, 40)}"`);
        targetObj[key] = translated;
        stats.count++;
        if (isNewKey) stats.newKeys.push(currentPath);
      }
      await delay(200);
    }
  }
}
