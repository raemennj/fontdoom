import React from 'react';
import { LoadingState } from '../types';

interface ControlsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onRandomVibe: () => void;
  onReset: () => void;
  sampleText: string;
  setSampleText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  loadingState: LoadingState;
  isVisible: boolean;
}

export const VIBE_CATEGORIES = [
  { id: 'cyber', label: 'Cyberpunk' },
  { id: 'retro', label: 'Retro' },
  { id: 'minimal', label: 'Minimalist' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'playful', label: 'Playful' },
  { id: 'brutal', label: 'Brutalist' },
  { id: 'weird', label: 'Weird' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'tech', label: 'Technical' },
  { id: 'gothic', label: 'Gothic' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'modern', label: 'Modern' },
];

const categories = [
  { group: 'Standard', items: [
    { id: 'all', label: 'All Types' },
    { id: 'sans-serif', label: 'Sans Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'monospace', label: 'Monospace' },
    { id: 'handwriting', label: 'Handwriting' },
    { id: 'display', label: 'Display' },
  ]},
  { group: 'Vibe', items: VIBE_CATEGORIES }
];

const Controls: React.FC<ControlsProps> = ({ 
  selectedCategory,
  onCategoryChange, 
  onRandomVibe,
  sampleText, 
  setSampleText, 
  fontSize, 
  setFontSize,
  isVisible
}) => {
  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="bg-[#050505]/95 backdrop-blur-2xl border-b border-white/10 px-4 h-14 flex items-center justify-between gap-4 shadow-2xl">
        
        {/* Reimagined branding */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onRandomVibe();
          }}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0 outline-none"
          title="Random Vibe"
        >
          <div className="relative w-8 h-8 logo-glitch transition-transform duration-300 active:scale-90">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]">
              <rect width="100" height="100" rx="15" className="fill-doom-accent group-hover:fill-white transition-colors duration-500" />
              <text 
                x="50" y="65" 
                textAnchor="middle" 
                className="font-black text-[55px] fill-white group-hover:fill-doom-accent transition-colors duration-500 select-none" 
                style={{ fontFamily: 'monospace' }}
              >
                FD
              </text>
              <path d="M15 15l15 0M85 85l-15 0" stroke="currentColor" strokeWidth="6" className="text-white group-hover:text-doom-accent" />
            </svg>
            <div className="absolute -inset-1 bg-doom-accent opacity-0 group-hover:opacity-20 blur-md rounded-lg transition-opacity"></div>
          </div>
          <div className="flex flex-col -gap-1">
            <span className="hidden sm:block text-[12px] font-black tracking-[0.2em] text-white transition-colors">FONTDOOM</span>
            <span className="hidden sm:block text-[7px] font-mono text-zinc-500 tracking-[0.4em] uppercase">Infinite_Scroller</span>
          </div>
        </button>

        {/* Category Dropdown */}
        <div className="relative flex-1 max-w-[180px]">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-zinc-100 text-[10px] font-bold tracking-widest px-3 py-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-doom-accent focus:ring-1 focus:ring-doom-accent/30 transition-all uppercase"
          >
            {categories.map((group) => (
              <optgroup key={group.group} label={group.group.toUpperCase()} className="bg-zinc-900 text-zinc-500 font-mono text-[9px]">
                {group.items.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-zinc-200">
                    {cat.label.toUpperCase()}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-doom-accent text-[8px] animate-pulse">
            ▼
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative hidden xl:block">
            <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-56 bg-white/5 border-b border-white/10 text-zinc-300 text-[10px] focus:text-white focus:border-doom-accent focus:ring-0 placeholder-zinc-800 font-mono transition-all px-2 py-1.5 rounded-t-sm"
                placeholder="EDIT PREVIEW..."
            />
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
             <span className="text-[9px] text-zinc-500 font-mono font-bold">PX</span>
             <input 
               type="range" 
               min="12" 
               max="120" 
               value={fontSize} 
               onChange={(e) => setFontSize(Number(e.target.value))}
               className="w-16 sm:w-28 accent-doom-accent cursor-pointer appearance-none bg-zinc-800 h-[2px] rounded-full"
             />
             <span className="text-[10px] text-zinc-200 font-mono w-6 text-right font-bold">{fontSize}</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Controls;