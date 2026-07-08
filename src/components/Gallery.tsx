import React from 'react';
import { Camera } from 'lucide-react';

const photos = [
  { src: 'gallery/tramonto-rosso.jpg', alt: 'Tramonto rosso con aereo e montagne', w: 1195, h: 896 },
  { src: 'gallery/citta-tramonto.jpg', alt: 'Città al tramonto', w: 1600, h: 900 },
  { src: 'gallery/milano-centrale.jpg', alt: 'Stazione di Milano Centrale in bianco e nero', w: 1600, h: 1200 },
  { src: 'gallery/festa-fuochi.jpg', alt: 'Festa con fuochi d’artificio', w: 1195, h: 896 },
  { src: 'gallery/rotonda-notturna.jpg', alt: 'Rotonda notturna con scie luminose', w: 1600, h: 900 },
  { src: 'gallery/cascata.jpg', alt: 'Cascata con colore selettivo', w: 896, h: 1058 },
  { src: 'gallery/architettura-bn.jpg', alt: 'Architettura in bianco e nero', w: 1600, h: 1200 },
  { src: 'gallery/interni-palestra.jpg', alt: 'Interni di una palestra', w: 896, h: 1195 },
];

export default function Gallery() {
  return (
    <section id="galleria" className="bg-zinc-950 py-20 md:py-28 relative overflow-hidden border-t border-white/[0.06]">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/[0.05] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[#e6c675] text-[13px] font-medium mb-5">
            <Camera className="w-3.5 h-3.5" />
            <span>Fotografia & visual content</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Oltre il ritocco
          </h2>
          <p className="text-zinc-400 text-base md:text-lg mt-4 leading-relaxed">
            Non solo fotoritocco: alcuni scatti che raccontano il nostro sguardo sulla luce, i colori e i dettagli.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="[column-fill:_balance] columns-2 lg:columns-3 gap-4 md:gap-5">
          {photos.map((p, i) => (
            <figure
              key={i}
              className="mb-4 md:mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 group relative"
            >
              <img
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-[#D4AF37]/50 rounded-2xl transition-all duration-300 pointer-events-none" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
