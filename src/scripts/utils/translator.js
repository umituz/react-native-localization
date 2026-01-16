/**
 * Translation Utilities
 * Handles call to translation APIs
 */

import { getTargetLanguage, shouldSkipWord } from './translation-config.js';

let lastCallTime = 0;
const MIN_DELAY = 100; // ms

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  if (shouldSkipWord(text)) return text;

  // Rate limiting
  const now = Date.now();
  const waitTime = Math.max(0, MIN_DELAY - (now - lastCallTime));
  if (waitTime > 0) await new Promise(resolve => setTimeout(resolve, waitTime));
  lastCallTime = Date.now();

  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;
    
    const response = await fetch(url);
    if (!response.ok) return text;
    
    const data = await response.json();
    return data && data[0] && data[0][0] && data[0][0][0] ? data[0][0][0] : text;
  } catch (error) {
    return text;
  }
}

function needsTranslation(value, enValue) {
  if (typeof enValue !== 'string' || !enValue.trim()) return false;
  if (shouldSkipWord(enValue)) return false;

  // CRITICAL OPTIMIZATION: If enValue is a technical key (e.g. "scenario.xxx.title"),
  // skip translating it to other languages. We only translate REAL English content.
  const isTechnicalKey = enValue.includes('.') && !enValue.includes(' ');
  if (isTechnicalKey) return false;

  // If value is missing or same as English, it needs translation
  if (!value || typeof value !== 'string') return true;

  if (value === enValue) {
    const isSingleWord = !enValue.includes(' ') && enValue.length < 20;
    return !isSingleWord;
  }

  return false;
}

export async function translateObject(enObj, targetObj, targetLang, path = '', stats = { count: 0, checked: 0, translatedKeys: [] }) {
  const keys = Object.keys(enObj);
  
  if (!stats.translatedKeys) stats.translatedKeys = [];

  for (const key of keys) {
    const enValue = enObj[key];
    const targetValue = targetObj[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof enValue === 'object' && enValue !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') targetObj[key] = {};
      await translateObject(enValue, targetObj[key], targetLang, currentPath, stats);
    } else if (typeof enValue === 'string') {
      stats.checked++;
      if (needsTranslation(targetValue, enValue)) {
        // Show progress for translations
        process.stdout.write(`   \r      Progress: ${stats.checked} keys checked, ${stats.count} translated...`);
        
        const translated = await translateText(enValue, targetLang);
        if (translated !== enValue) {
          targetObj[key] = translated;
          stats.count++;
          stats.translatedKeys.push({ key: currentPath, from: enValue, to: translated });
        }
      }
    }
  }
}
