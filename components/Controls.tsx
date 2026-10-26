import React from 'react';
type Props = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onRandomVibe: () => void;
  sampleText: string;
  setSampleText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isVisible: boolean;
  fontCount: number;
  favoriteCount: number;
  catalogStatus: string;
};
const groups = [
  { title: 'Browse', items: [
    ['all', 'All Fonts'], ['favorites', '♥ Favorites'], ['sans-serif', 'Sans Serif'],
    ['serif', 'Serif'], ['monospace', 'Monospace'], ['handwriting', 'Handwriting'], ['display', 'Display']
  ] },
  { title: 'Curated Vibes', items: [
    ['cyber', 'Cyberpunk'], ['retro', 'Retro'], ['minimal', 'Minimalist'],
    ['elegant', 'Elegant'], ['playful', 'Playful'], ['brutal', 'Brutalist'],
    ['weird', 'Weird'], ['futuristic', 'Futuristic'], ['tech', 'Technical'],
    ['gothic', 'Gothic'], ['gaming', 'Gaming'], ['modern', 'Modern']
  ] }
];
export default function Controls({
  selectedCategory, onCategoryChange, onRandomVibe, sampleText,
  setSampleText, fontSize, setFontSize, isVisible, fontCount, favoriteCount, catalogStatus
}: Props) {
  return (
    <div className={'fixed top-0 left-0 w-full z-50 transition-transform duration-300 ' +
      (isVisible ? 'translate-y-0' : '-translate-y-full')}>
      <div className="bg-[#050505]/95 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-4 h-14 flex items-center justify-between gap-3 shadow-2xl">
        <button onClick={onRandomVibe} type="button"
          title="Randomize vibe and reshuffle"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0">
          <svg viewBox="0 0 100 100" className="w-8 h-8 logo-glitch">
            <rect width="100" height="100" rx="15" className="fill-doom-accent" />
            <text x="50" y="65" textAnchor="middle" fontSize="55" fontWeight="900"
              fill="white" style={{ fontFamily: 'monospace' }}>FD</text>
          </svg>
          <div className="hidden sm:flex flex-col">
            <span className="text-[12px] font-black tracking-[0.2em] text-white">FONTDOOM</span>
            <span className="text-[7px] font-mono text-zinc-500 tracking-[0.3em]">INFINITE_SCROLLER</span>
          </div>
        </button>
        <select aria-label="Filter fonts" value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="flex-1 max-w-[165px] min-w-0 bg-zinc-900 border border-white/10 text-zinc-100 text-[10px] font-bold px-2 py-2 rounded-lg cursor-pointer">
          {groups.map(group => (
            <optgroup key={group.title} label={group.title} className="bg-zinc-900">
              {group.items.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </optgroup>
          ))}
        </select>
        <div title={catalogStatus} className="hidden lg:block text-[9px] font-mono text-zinc-500 whitespace-nowrap">
          {fontCount.toLocaleString()} FONTS · {favoriteCount} SAVED
        </div>
        <input type="text" value={sampleText} onChange={e => setSampleText(e.target.value)}
          className="hidden xl:block w-52 bg-white/5 border-b border-white/10 text-zinc-300 text-[11px] font-mono px-2 py-1.5"
          aria-label="Edit all preview text" placeholder="EDIT PREVIEW TEXT" />
        <div className="flex items-center gap-1 sm:gap-3 bg-white/5 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
          <span className="hidden sm:inline text-[9px] text-zinc-500 font-mono">PX</span>
          <input type="range" min="12" max="120" value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            aria-label="Font preview size" className="w-12 sm:w-28 accent-doom-accent cursor-pointer" />
          <span className="text-[10px] text-zinc-200 font-mono w-6 text-right">{fontSize}</span>
        </div>
      </div>
    </div>
  );
}
