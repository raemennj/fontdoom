import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GOOGLE_FONTS_LIST, PRESET_TEXTS } from './constants';
import FontCard from './components/FontCard';
import Controls, { VIBE_CATEGORIES } from './components/Controls';
import { generateSampleText } from './services/geminiService';
import { LoadingState, FontDef } from './types';

function App() {
  const [allFonts] = useState(GOOGLE_FONTS_LIST);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sampleText, setSampleText] = useState(PRESET_TEXTS[0]);
  const [fontSize, setFontSize] = useState(48);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const [renderMultiplier, setRenderMultiplier] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filteredFonts = useMemo(() => {
    if (selectedCategory === 'all') return allFonts;
    
    return allFonts.filter(f => {
      const isCategoryMatch = f.category.toLowerCase() === selectedCategory.toLowerCase();
      const isTagMatch = f.tags?.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
      return isCategoryMatch || isTagMatch;
    });
  }, [allFonts, selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRenderMultiplier((prev) => prev + 1);
        }
      },
      { rootMargin: '1200px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setRenderMultiplier(1);
    
    try {
      setLoadingState(LoadingState.LOADING);
      const vibeMap: Record<string, string> = {
        'all': 'general typography',
        'sans-serif': 'modern tech',
        'serif': 'classic literature',
        'monospace': 'coding terminal hacker',
        'handwriting': 'personal handwriting note',
        'display': 'loud magazine headline',
        'cyber': 'neo-tokyo cyberpunk neon',
        'retro': '80s arcade vintage aesthetic',
        'minimal': 'clean swiss minimalism',
        'elegant': 'luxury fashion boutique',
        'playful': 'childhood toy brand',
        'brutal': 'concrete brutalist architecture',
        'weird': 'abstract glitchy experimental',
        'futuristic': 'interstellar space journey',
        'tech': 'blueprints and engineering',
        'gothic': 'dark medieval castle',
        'gaming': 'esports tournament UI',
        'modern': 'contemporary art gallery'
      };
      const customText = await generateSampleText(vibeMap[category] || category);
      setSampleText(customText);
      setLoadingState(LoadingState.SUCCESS);
    } catch (e) {
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleRandomVibe = () => {
    const randomVibe = VIBE_CATEGORIES[Math.floor(Math.random() * VIBE_CATEGORIES.length)];
    handleCategoryChange(randomVibe.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setSampleText(PRESET_TEXTS[0]);
    setRenderMultiplier(1);
    setLoadingState(LoadingState.IDLE);
    setIsHeaderVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const infiniteFonts = useMemo(() => {
    const pageSize = 50; 
    const items = [];
    
    if (filteredFonts.length === 0) return [];

    // For each "page" in the multiplier, we want to provide a variation of the font pool
    for (let m = 0; m < renderMultiplier; m++) {
      let currentPool = [...filteredFonts];
      
      // If it's not the first batch, we introduce entropy
      if (m > 0) {
        // Rotate the pool by a multiplier-dependent offset
        const rotation = (m * 17) % currentPool.length;
        currentPool = [...currentPool.slice(rotation), ...currentPool.slice(0, rotation)];
        
        // Every other batch is reversed to break patterns further
        if (m % 2 === 0) {
          currentPool.reverse();
        }

        // For even higher multipliers, we do a simple deterministic shuffle
        if (m > 2) {
          currentPool.sort((a, b) => {
             const hashA = (a.family.length + m) % 3;
             const hashB = (b.family.length + m) % 3;
             return hashA - hashB;
          });
        }
      }

      // Add a full pageSize of fonts from our modified currentPool
      for (let i = 0; i < pageSize; i++) {
        const font = currentPool[i % currentPool.length];
        items.push({ 
          ...font, 
          // Unique key includes the multiplier to allow the same font to appear multiple times correctly in React
          uniqueKey: `${font.family}-v${m}-i${i}` 
        });
      }
    }
    return items;
  }, [filteredFonts, renderMultiplier]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-doom-accent selection:text-white">
      <Controls 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onRandomVibe={handleRandomVibe}
        onReset={handleReset}
        sampleText={sampleText}
        setSampleText={setSampleText}
        fontSize={fontSize}
        setFontSize={setFontSize}
        loadingState={loadingState}
        isVisible={isHeaderVisible}
      />

      <main className="w-full px-2 pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {infiniteFonts.map((font) => (
            <FontCard 
              key={font.uniqueKey} 
              font={font} 
              sampleText={sampleText}
              setSampleText={setSampleText}
              fontSize={fontSize}
            />
          ))}
        </div>

        <div 
          ref={loaderRef}
          className="py-32 text-center text-zinc-900 font-mono text-[8px] tracking-[2em]"
        >
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-[1px] w-24 bg-zinc-900"></div>
            <div>STREAMING_NEW_VARIANTS</div>
            <div className="h-[1px] w-24 bg-zinc-900"></div>
          </div>
        </div>
      </main>
      
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
    </div>
  );
}

export default App;