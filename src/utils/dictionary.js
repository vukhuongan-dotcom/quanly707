import { dictionary } from './raw_dict.js';

export { dictionary };

export const normalizeVi = (str) => {
  if (!str) return '';
  return str
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/[.。]+$/, '');
};

export const translate = (str) => {
  if (!str || !str.trim()) return '';
  const normalized = normalizeVi(str);
  if (dictionary[normalized]) return dictionary[normalized];

  const parts = str.split(/\s*[+;\n]\s*/);
  if (parts.length > 1) {
    const translatedParts = parts.map((p) => dictionary[normalizeVi(p)]);
    if (translatedParts.every(Boolean)) {
      return translatedParts.join(' + ');
    }
  }

  // Fallback: check substrings or partials
  return '';
};
