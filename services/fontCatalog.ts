import { GOOGLE_FONTS_LIST } from '../constants';
import type { FontDef } from '../types';

const URL = 'https://api.fontsource.org/v1/fonts';
const CACHE = 'fontdoom-catalog-v1';
const ONE_DAY = 86400000;
const tags = new Map(GOOGLE_FONTS_LIST.map(f => [f.family.toLowerCase(), f.tags]));

export function fallbackFonts(): FontDef[] {
  const byName = new Map<string, FontDef>();
  GOOGLE_FONTS_LIST.forEach(f => {
    if (!byName.has(f.family.toLowerCase())) byName.set(f.family.toLowerCase(), { ...f, provider: 'google' });
  });
  return [...byName.values()];
}

export function normalizeCatalog(raw: unknown): FontDef[] {
  if (!Array.isArray(raw)) throw new Error('Invalid catalog');
  const fonts = new Map<string, FontDef>();
  raw.forEach(item => {
    if (!item || typeof item.id !== 'string' || typeof item.family !== 'string' ||
        !/^[a-z0-9-]+$/.test(item.id) || !item.family.trim() || item.type === 'icons' ||
        !Array.isArray(item.subsets)) return;
    const latin = item.subsets.includes('latin') ? 'latin' :
      item.subsets.includes('latin-ext') ? 'latin-ext' : null;
    if (!latin) return; // Our default sample text uses Latin glyphs.
    const name = item.family.trim();
    const key = name.toLowerCase();
    if (!fonts.has(key)) fonts.set(key, {
      family: name, id: item.id, subset: latin, provider: 'fontsource',
      category: typeof item.category === 'string' ? item.category.toLowerCase() : 'display',
      tags: tags.get(key) || []
    });
  });
  fallbackFonts().forEach(font => {
    if (!fonts.has(font.family.toLowerCase())) fonts.set(font.family.toLowerCase(), font);
  });
  if (fonts.size < 100) throw new Error('Incomplete catalog');
  return [...fonts.values()];
}

export async function getFontCatalog(signal?: AbortSignal): Promise<FontDef[]> {
  try {
    const stored = JSON.parse(localStorage.getItem(CACHE) || 'null');
    if (stored && Array.isArray(stored.fonts) && stored.fonts.length >= 100 &&
        typeof stored.savedAt === 'number' && Date.now() - stored.savedAt < ONE_DAY) return stored.fonts;
  } catch { /* Storage is optional. */ }
  const response = await fetch(URL, { signal });
  if (!response.ok) throw new Error('Font catalog unavailable');
  const fonts = normalizeCatalog(await response.json());
  try { localStorage.setItem(CACHE, JSON.stringify({ savedAt: Date.now(), fonts })); }
  catch { /* Storage is optional. */ }
  return fonts;
}
