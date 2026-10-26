import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PRESET_TEXTS } from './constants';
import type { FontDef } from './types';
import { fallbackFonts, getFontCatalog } from './services/fontCatalog';
import { shuffledFontDeck } from './services/shuffle';
import Controls from './components/Controls';
import FontCard from './components/FontCard';

type Viewport = { top: number; width: number; height: number };
function view(): Viewport {
  return { top: window.scrollY, width: window.innerWidth, height: window.innerHeight };
}
function columns(width: number): number {
  return width >= 1536 ? 5 : width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1;
}
function getFavorites(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem('fontdoom-favorites-v1') || '[]');
    return Array.isArray(stored) ? stored.filter((s): s is string => typeof s === 'string') : [];
  } catch { return []; }
}
const GAP = 12;
const TOP = 64;
const BUFFER_ROWS = 5;

export default function App() {
  const [catalog, setCatalog] = useState<FontDef[]>(fallbackFonts);
  const [catalogStatus, setCatalogStatus] = useState('Loading font catalog');
  const [category, setCategory] = useState('all');
  const [sampleText, setSampleText] = useState(PRESET_TEXTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [favorites, setFavorites] = useState<string[]>(getFavorites);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 0xffffffff));
  const [cycles, setCycles] = useState(1);
  const [viewport, setViewport] = useState<Viewport>(view);
  const [headerVisible, setHeaderVisible] = useState(true);
  const prevScroll = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getFontCatalog(controller.signal).then(fonts => {
      if (!controller.signal.aborted) {
        setCatalog(fonts);
        setCatalogStatus('Fontsource + Google Fonts');
      }
    }).catch(() => {
      if (!controller.signal.aborted) setCatalogStatus('Offline fallback catalog');
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('fontdoom-favorites-v1', JSON.stringify(favorites)); }
    catch { /* Private browsing still works. */ }
  }, [favorites]);

  const pool = useMemo(() => {
    if (category === 'favorites') {
      const saved = new Set(favorites);
      return catalog.filter(f => saved.has(f.family.toLowerCase()));
    }
    if (category === 'all') return catalog;
    return catalog.filter(f => f.category.toLowerCase() === category ||
      f.tags?.some(tag => tag.toLowerCase() === category));
  }, [catalog, favorites, category]);

  // No repeats within a complete deck. Use a deterministic seed per cycle,
  // so a virtualized card reappears correctly when scrolling backwards.
  const decks = useMemo(() => new Map<number, FontDef[]>(), [pool, seed]);
  const cycleDeck = useCallback((cycle: number): FontDef[] => {
    const existing = decks.get(cycle);
    if (existing) return existing;
    const order = shuffledFontDeck(pool, (seed ^ Math.imul(cycle + 1, 0x9e3779b9)) >>> 0);
    if (cycle > 0 && order.length > 1) {
      const previous = cycleDeck(cycle - 1);
      if (order[0].family === previous[previous.length - 1].family) {
        [order[0], order[1]] = [order[1], order[0]];
      }
    }
    decks.set(cycle, order);
    if (decks.size > 8) {
      const oldest = decks.keys().next().value;
      if (oldest !== undefined) decks.delete(oldest);
    }
    return order;
  }, [decks, pool, seed]);

  const cols = columns(viewport.width);
  const cardHeight = Math.max(142, Math.ceil(fontSize * 1.26) + 70);
  const stride = cardHeight + GAP;
  const count = pool.length;
  const rowCount = count ? Math.ceil(cycles * count / cols) : 0;
  const start = Math.max(0, Math.floor((viewport.top - TOP) / stride) - BUFFER_ROWS);
  const end = Math.min(rowCount,
    Math.ceil((viewport.top + viewport.height - TOP) / stride) + BUFFER_ROWS);
  const firstIndex = start * cols;
  const endIndex = Math.min(cycles * count, end * cols);

  const visible = useMemo(() => {
    if (!count) return [];
    const items: { font: FontDef; index: number }[] = [];
    for (let i = firstIndex; i < endIndex; i++) {
      items.push({ index: i, font: cycleDeck(Math.floor(i / count))[i % count] });
    }
    return items;
  }, [count, firstIndex, endIndex, cycleDeck]);

  useEffect(() => {
    function sync() {
      frame.current = null;
      const next = view();
      setViewport(next);
      if (next.top < prevScroll.current || next.top <= 0) setHeaderVisible(true);
      else if (next.top > prevScroll.current && next.top > 100) setHeaderVisible(false);
      prevScroll.current = next.top;
    }
    function schedule() {
      if (frame.current === null) frame.current = requestAnimationFrame(sync);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    sync();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    if (count && TOP + rowCount * stride - (viewport.top + viewport.height) < 1800) {
      setCycles(n => n + 1);
    }
  }, [count, rowCount, stride, viewport]);

  const restart = () => {
    setCycles(1);
    setSeed(Math.floor(Math.random() * 0xffffffff));
    window.scrollTo(0, 0);
    setHeaderVisible(true);
  };
  const changeCategory = (next: string) => { setCategory(next); restart(); };
  const randomVibe = () => {
    const types = ['all', 'display', 'serif', 'sans-serif', 'handwriting', 'monospace',
      'retro', 'cyber', 'minimal', 'elegant', 'weird'];
    setCategory(types[Math.floor(Math.random() * types.length)]);
    restart();
  };
  const toggleFavorite = (name: string) => {
    const key = name.toLowerCase();
    setFavorites(before => before.includes(key) ? before.filter(x => x !== key) : [...before, key]);
  };
  const saved = useMemo(() => new Set(favorites), [favorites]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-doom-accent selection:text-white">
      <Controls
        selectedCategory={category}
        onCategoryChange={changeCategory}
        onRandomVibe={randomVibe}
        sampleText={sampleText}
        setSampleText={setSampleText}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isVisible={headerVisible}
        fontCount={catalog.length}
        favoriteCount={favorites.length}
        catalogStatus={catalogStatus}
      />
      <main className="w-full px-2 pt-16" aria-label="Endless font feed">
        {count === 0 ? (
          <div className="pt-32 text-center text-zinc-500 font-mono">
            No fonts here. Choose another filter or save some favorites.
          </div>
        ) : (
          <>
            <div style={{ height: start * stride }} aria-hidden="true" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
              style={{ gridAutoRows: cardHeight + 'px' }}>
              {visible.map(({ font, index }) => (
                <FontCard key={index} font={font} sampleText={sampleText}
                  setSampleText={setSampleText} fontSize={fontSize}
                  favorite={saved.has(font.family.toLowerCase())}
                  onToggleFavorite={() => toggleFavorite(font.family)} />
              ))}
            </div>
            <div style={{ height: Math.max(0, (rowCount - end) * stride) }} aria-hidden="true" />
          </>
        )}
      </main>
    </div>
  );
}
