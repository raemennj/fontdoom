import type { FontDef } from '../types';

// Seeded Fisher-Yates makes each cycle reproducible for reverse scrolling.
export function shuffled<T>(items: T[], seed: number): T[] {
  const a = items.slice();
  let state = seed >>> 0;
  const random = () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffledFontDeck(fonts: FontDef[], seed: number): FontDef[] {
  return shuffled(fonts, seed);
}
