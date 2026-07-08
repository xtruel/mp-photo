import React, { useState, useRef } from 'react';
import { Camera, Sliders, Layers, RefreshCw } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioProps {
  portfolioItems: PortfolioItem[];
}

export default function Portfolio({ portfolioItems }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Track drag state specifically for each item ID
  const [activeSliderId, setActiveSliderId] = useState<string | null>(null);
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>(
    portfolioItems.reduce((acc, item) => ({ ...acc, [item.id]: 50 }), {})
  );

  const categories = [
    { key: 'all', label: 'Tutti i Lavori' },
    { key: 'auto', label: '🚗 Auto' },
    { key: 'immobili', label: '🏡 Immobili' },
    { key: 'ritratti', label: '👤 Ritratti' },
    { key: 'paesaggi', label: '🌄 Paesaggi' },
    { key: 'prodotti', label: '🛍️ Prodotti' }
  ];

  const filteredItems = activeCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  const handleSliderMove = (itemId: string, clientX: number, containerElement: HTMLDivElement) => {
    const rect = containerElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPositions(prev => ({ ...prev, [itemId]: position }));
  };

  return (
    <section id="portfolio" className="bg-zinc-950 py-20 relative overflow-hidden border-t border-zinc-900">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">I nostri capolavori</h2>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans block">
            Galleria Portfolio Interattiva
          </span>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full" />
          <p className="text-zinc-400 font-sans text-sm md:text-base">
            La qualità si vede nel dettaglio. Trascina i cursori su qualsiasi immagine per confrontare il file originale e il fotoritocco finale di M.P. Photo.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-zinc-900 pb-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 font-mono ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/10 scale-105'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
              id={`portfolio-filter-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Portfolio Masonry/Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-zinc-900/60 max-w-lg mx-auto space-y-3">
            <Camera className="w-8 h-8 text-zinc-600 mx-auto animate-pulse" />
            <p className="text-zinc-400 font-medium">Nessun elemento caricato in questa categoria.</p>
            <p className="text-zinc-600 text-xs">Accedi al pannello amministratore per aggiungere foto a questa sezione!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const currentPos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;
              const isItemDragging = activeSliderId === item.id;

              return (
                <div 
                  key={item.id}
                  className="bg-zinc-900/30 rounded-2xl border border-zinc-900 overflow-hidden flex flex-col hover:border-zinc-800 transition-all duration-300 shadow-xl group"
                  id={`portfolio-card-${item.id}`}
                >
                  {/* Slider Box */}
                  <div 
                    onMouseMove={(e) => {
                      if (e.buttons === 1 || isItemDragging) {
                        handleSliderMove(item.id, e.clientX, e.currentTarget);
                      }
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length > 0) {
                        handleSliderMove(item.id, e.touches[0].clientX, e.currentTarget);
                      }
                    }}
                    onMouseDown={() => setActiveSliderId(item.id)}
                    onMouseUp={() => setActiveSliderId(null)}
                    onMouseLeave={() => setActiveSliderId(null)}
                    className="relative aspect-[16/11] w-full cursor-ew-resize overflow-hidden select-none"
                    id={`slider-container-${item.id}`}
                  >
                    {/* AFTER image */}
                    <img 
                      src={item.afterImage} 
                      alt={`${item.title} dopo fotoritocco`}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      style={{ filter: item.afterFilter || "none" }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 right-3 z-10 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase tracking-widest border border-zinc-800">Dopo</div>

                    {/* BEFORE image (clipped overlay) */}
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                      style={{ clipPath: `polygon(0 0, ${currentPos}% 0, ${currentPos}% 100, 0 100)` }}
                    >
                      <img 
                        src={item.beforeImage} 
                        alt={`${item.title} prima del fotoritocco`}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                        style={{ filter: item.beforeFilter || "grayscale-[0.35] brightness-[0.8] contrast-[0.85]" }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 left-3 z-10 bg-amber-500 px-2 py-0.5 rounded text-[10px] text-black font-extrabold uppercase tracking-widest">Prima</div>
                    </div>

                    {/* Slider Indicator Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-amber-500 pointer-events-none z-20"
                      style={{ left: `${currentPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md border border-zinc-950 text-[8px] font-bold">
                        ↔
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                          {item.category}
                        </span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-500 transition-colors font-sans">{item.title}</h3>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between text-3xs font-mono text-zinc-500 uppercase tracking-widest">
                      <span>Intervento professionale</span>
                      <span>100% Online</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
