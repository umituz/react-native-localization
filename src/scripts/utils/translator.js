/**
 * Translation Utilities
 * Handles call to translation APIs
 */

import { getTargetLanguage, isSingleWord as checkSingleWord, shouldSkipWord } from './translation-config.js';

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
    if (__DEV__) console.error(`   ❌ Translation error for "${text}":`, error.message);
    return text;
  }
}

function needsTranslation(value, enValue) {
  if (typeof enValue !== 'string' || !enValue.trim()) return false;
  if (shouldSkipWord(enValue)) return false;

  // If value is missing or same as technical key
  if (!value || typeof value !== 'string') return true;

  // Heuristic: If English value looks like a technical key (e.g. "scenario.xxx.title")
  // and the target value is exactly the same, it definitely needs translation.
  const isTechnicalKey = enValue.includes('.') && !enValue.includes(' ');
  
  if (value === enValue) {
    if (isTechnicalKey) return true;
    const isSingleWord = !enValue.includes(' ') && enValue.length < 20;
    return !isSingleWord;
  }

  return false;
}

export async function translateObject(enObj, targetObj, targetLang, path = '', stats = { count: 0, newKeys: [] }) {
  const keys = Object.keys(enObj);
  
  for (const key of keys) {
    const enValue = enObj[key];
    const targetValue = targetObj[key];
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof enValue === 'object' && enValue !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') targetObj[key] = {};
      await translateObject(enValue, targetObj[key], targetLang, currentPath, stats);
    } else if (typeof enValue === 'string' && needsTranslation(targetValue, enValue)) {
      const translated = await translateText(enValue, targetLang);
      
      const isNewKey = targetValue === undefined;
      // Force increment if it looks like a technical key that we just "translated" 
      // even if the API returned the same string (placeholder)
      const isTechnicalKey = enValue.includes('.') && !enValue.includes(' ');
      
      if (translated !== enValue || isNewKey || (isTechnicalKey && translated === enValue)) {
        targetObj[key] = translated;
        stats.count++;
      }
    }
  }
}
