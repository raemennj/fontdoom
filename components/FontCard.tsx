import React, { useEffect, useState, useRef } from 'react';
import { FontDef } from '../types';

interface FontCardProps {
  font: FontDef;
  sampleText: string;
  setSampleText: (text: string) => void;
  fontSize: number;
}

const FontCard: React.FC<FontCardProps> = ({ font, sampleText, setSampleText, fontSize }) => {
  const [loaded, setLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cssString, setCssString] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loaded) {
            loadFont();
          }
        });
      },
      { rootMargin: '400px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [font.family, loaded]);

  const loadFont = () => {
    const linkId = `font-${font.family.replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}&display=swap`;
      document.head.appendChild(link);
    }
    
    setCssString(`font-family: '${font.family}', ${font.category};`);
    setLoaded(true);
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullCss = `@import url('https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}&display=swap');\n${cssString}`;
    navigator.clipboard.writeText(fullCss);
  };

  return (
    <div 
      ref={cardRef}
      className="group relative flex flex-col gap-1 p-2 bg-black rounded border border-white/5 hover:border-doom-accent/50 transition-all duration-200 hover:bg-zinc-900/20 overflow-hidden"
    >
      {/* Header Meta - Font size increased for better readability */}
      <div className="flex justify-between items-center text-[13px] font-mono tracking-tight uppercase px-1 pt-1">
        <div className="flex items-center gap-2 truncate">
          <span className="font-black text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
            {font.family}
          </span>
          <span className="text-zinc-600 shrink-0 text-[10px]">{font.category}</span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
          <button onClick={copyToClipboard} className="text-zinc-600 hover:text-white transition-colors text-[10px]">CSS</button>
          <a href={`https://fonts.google.com/specimen/${font.family.replace(/\s+/g, '+')}`} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-colors text-[10px]">↗</a>
        </div>
      </div>

      {/* Preview Area - Tightened */}
      <div className="min-h-[50px] flex items-start py-1">
        <textarea 
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          spellCheck={false}
          rows={1}
          style={{ 
            fontFamily: loaded ? `'${font.family}', ${font.category}` : 'monospace',
            fontSize: `${fontSize}px`,
            lineHeight: 1,
          }}
          className={`w-full bg-transparent border-none focus:ring-0 p-0 resize-none transition-all duration-500 overflow-hidden outline-none ${loaded ? 'opacity-100 text-white' : 'opacity-10 blur-[4px]'}`}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </div>

      {/* Footer Tags */}
      <div className="flex justify-end h-3">
        <div className="flex gap-1 overflow-hidden opacity-30 group-hover:opacity-100 transition-opacity">
          {font.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[6px] font-mono px-1 border border-zinc-800 text-zinc-600 rounded-sm uppercase tracking-tighter">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FontCard;