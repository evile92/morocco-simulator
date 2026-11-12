import en from './en.json';
import ar from './ar.json';
import { Language } from '../types/game';

const dictionaries: Record<Language, any> = { en, ar };

export function translate(lang: Language, key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: any = dictionaries[lang] || dictionaries.en;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallback: any = dictionaries.en;
      for (const fPart of parts) {
        if (fallback && typeof fallback === 'object' && fPart in fallback) {
          fallback = fallback[fPart];
        } else {
          return key;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((str, [pKey, pVal]) => {
      return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }, current);
  }

  return current;
}

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
];

export function formatGameDate(month: number, year: number, lang: Language): string {
  const mIndex = Math.max(0, Math.min(11, month - 1));
  if (lang === 'ar') {
    return `${MONTH_NAMES_AR[mIndex]} ${year}`;
  }
  return `${MONTH_NAMES_EN[mIndex]} ${year}`;
}

export function formatNumber(val: number, decimals: number = 1): string {
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCurrencyMAD(valBillion: number, lang: Language): string {
  const formatted = formatNumber(valBillion, 2);
  return lang === 'ar' ? `${formatted} مليار درهم` : `${formatted}B MAD`;
}
