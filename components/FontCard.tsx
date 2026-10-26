import React, { useEffect, useRef, useState } from 'react';
import type { FontDef } from '../types';

type Props = {
  font: FontDef;
  sampleText: string;
  setSampleText: (value: string) => void;
  fontSize: number;
  favorite: boolean;
  onToggleFavorite: () => void;
};
type Entry = { node: HTMLLinkElement; refs: number; ready: boolean; listeners: Set<() => void> };
const loadedStyles = new Map<string, Entry>();

function cssUrl(font: FontDef): string {
  if (font.provider === 'fontsource' && font.id) {
    return 'https://cdn.jsdelivr.net/fontsource/css/' + encodeURIComponent(font.id) +
      '@latest/' + (font.subset || 'latin') + '.min.css';
  }
  return 'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(font.family).replace(/%20/g, '+') + '&display=swap';
}

function useFontStyle(font: FontDef, done: () => void): () => void {
  const href = cssUrl(font);
  let entry = loadedStyles.get(href);
  if (!entry) {
    const node = document.createElement('link');
    node.rel = 'stylesheet';
    node.href = href;
    entry = { node, refs: 0, ready: false, listeners: new Set() };
    const current = entry;
    const finish = () => {
      current.ready = true;
      current.listeners.forEach(fn => fn());
      current.listeners.clear();
    };
    node.onload = finish;
    node.onerror = finish;
    loadedStyles.set(href, entry);
    document.head.appendChild(node);
  }
  entry.refs++;
  if (entry.ready) done();
  else entry.listeners.add(done);
  return () => {
    const current = loadedStyles.get(href);
    if (!current) return;
    current.listeners.delete(done);
    if (--current.refs <= 0) {
      current.node.remove();
      loadedStyles.delete(href);
    }
  };
}

export default function FontCard({ font, sampleText, setSampleText, fontSize, favorite, onToggleFavorite }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    let release: (() => void) | undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        release = useFontStyle(font, () => setReady(true));
        observer.disconnect();
      }
    }, { rootMargin: '500px' });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); release?.(); };
  }, [font.id, font.family, font.provider, font.subset]);

  const fallback = font.category === 'serif' ? 'serif' :
    font.category === 'monospace' ? 'monospace' :
    font.category === 'handwriting' ? 'cursive' : 'sans-serif';
  const family = "'" + font.family.replace(/'/g, "\\'") + "', " + fallback;
  const href = cssUrl(font);
  const copy = () => {
    const css = "@import url('" + href + "');\nfont-family: " + family + ';';
    navigator.clipboard?.writeText(css).catch(() => {});
  };

  return (
    <article ref={ref}
      className="group flex flex-col gap-2 p-3 min-w-0 min-h-0 bg-black rounded border border-white/10 hover:border-doom-accent/60 hover:bg-zinc-900/30 transition-colors overflow-hidden">
      <header className="flex justify-between items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate font-mono text-[12px] font-bold text-zinc-300" title={font.family}>
            {font.family}
          </span>
          <span className="hidden sm:inline text-[9px] uppercase text-zinc-600 shrink-0">{font.category}</span>
        </div>
        <div className="flex gap-2 items-center shrink-0 font-mono text-[11px]">
          <button type="button" onClick={onToggleFavorite}
            title={favorite ? 'Remove from favorites' : 'Save favorite'}
            aria-label={(favorite ? 'Remove ' : 'Save ') + font.family + ' favorite'}
            aria-pressed={favorite}
            className={favorite ? 'text-doom-accent' : 'text-zinc-500 hover:text-doom-accent'}>
            {favorite ? '♥' : '♡'}
          </button>
          <button type="button" title="Copy CSS" onClick={copy} className="text-zinc-500 hover:text-white">CSS</button>
          <a href={font.provider === 'fontsource' && font.id ? 'https://fontsource.org/fonts/' + font.id :
            'https://fonts.google.com/specimen/' + encodeURIComponent(font.family)}
            target="_blank" rel="noreferrer" title="View source" className="text-zinc-500 hover:text-white">↗</a>
        </div>
      </header>
      <input type="text" value={sampleText} onChange={e => setSampleText(e.target.value)}
        aria-label={'Preview text using ' + font.family} spellCheck={false}
        style={{ fontFamily: ready ? family : 'monospace', fontSize: fontSize + 'px', lineHeight: 1.12 }}
        className={'w-full min-w-0 flex-1 bg-transparent border-none focus:ring-0 p-0 text-white outline-none transition-opacity duration-300 ' +
          (ready ? 'opacity-100' : 'opacity-30')} />
      <footer className="flex justify-end gap-1 overflow-hidden h-4">
        {font.tags?.slice(0, 2).map(tag => (
          <span key={tag} className="px-1 border border-zinc-800 rounded-sm text-[8px] uppercase text-zinc-600">{tag}</span>
        ))}
      </footer>
    </article>
  );
}
