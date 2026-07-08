import React, { useState, useRef, useEffect } from 'react';
import { FileText, Phone, Sparkles, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface HeroProps {
  settings: AppSettings;
  onNavigate: (view: string) => void;
}

export default function Hero({ settings, onNavigate }: HeroProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWhatsAppClick = async () => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsappClicks' })
      });
    } catch (e) {
      console.error(e);
    }
    const message = encodeURIComponent("Ciao! Vorrei inviarvi una foto da fotoritoccare per ricevere un preventivo gratuito.");
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isDragging) {
      handleSliderMove(e.clientX);
    }
  };

  return (
    <section id="home" className="relative bg-black pt-10 pb-20 md:py-28 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Col 1: Hero Texts */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[#e6c675] text-[13px] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fotoritocco professionale online</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight">
              {settings.heroTitle}
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {settings.heroSubtitle}
            </p>

            {/* Crucial: Explaining 5-seconds value */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-5 border-y border-white/10 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[13px] font-semibold text-white">Cosa facciamo</h4>
                  <p className="text-[13px] text-zinc-400 mt-0.5">Editing di lusso</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[13px] font-semibold text-white">Perché noi</h4>
                  <p className="text-[13px] text-zinc-400 mt-0.5">Qualità premium</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[13px] font-semibold text-white">Come agire</h4>
                  <p className="text-[13px] text-zinc-400 mt-0.5">Preventivo istantaneo</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onNavigate('quote')}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#e6c675] to-[#d4af37] hover:from-[#eecf85] hover:to-[#dcbb4a] text-black font-semibold rounded-2xl shadow-[0_10px_34px_-8px_rgba(212,175,55,0.5)] transition-all duration-300 text-[15px] hover:-translate-y-0.5"
                id="hero-quote-btn"
              >
                <FileText className="w-5 h-5 stroke-[2.2]" />
                <span>Richiedi un preventivo gratuito</span>
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 px-7 py-4 bg-white/[0.06] border border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 rounded-2xl transition-all duration-300 text-[15px] font-medium hover:-translate-y-0.5"
                id="hero-whatsapp-btn"
              >
                <Phone className="w-5 h-5" />
                <span>Invia la tua foto su WhatsApp</span>
              </button>
            </div>
            
            <p className="text-2xs text-zinc-500 text-center lg:text-left">
              * Risposta media entro 15 minuti via WhatsApp. Massima riservatezza dei tuoi file garantita.
            </p>
          </div>

          {/* Col 2: Interactive Before/After slider & sandbox */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interactive Before/After Container */}
            <div className="relative bg-white/[0.04] p-2 rounded-[28px] border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="absolute top-5 right-5 z-20 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white/90 flex items-center gap-1.5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                Trascina lo slider
              </div>

              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                className="relative aspect-[16/10] w-full rounded-[22px] overflow-hidden cursor-ew-resize select-none"
                id="hero-slider-container"
              >
                {/* AFTER image (Full view under) */}
                <img 
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" 
                  alt="Porsche 911 GT3 RS Retouched" 
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  style={{
                    filter: "saturate(1.3) brightness(1.08) contrast(1.12)"
                  }}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 text-2xs text-white font-bold uppercase tracking-wider rounded border border-zinc-800">Dopo</span>

                {/* BEFORE image overlay */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100, 0 100)` }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80" 
                    alt="Porsche 911 GT3 RS Original" 
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    style={{
                      filter: "saturate(0.6) brightness(0.8) contrast(0.85) blur(0.5px)"
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-4 left-4 z-10 bg-amber-500 px-2.5 py-1 text-2xs text-black font-extrabold uppercase tracking-wider rounded">Prima</span>
                </div>

                {/* Handle slider bar */}
                <div 
                  className="absolute top-0 bottom-0 w-[3px] bg-amber-500 cursor-ew-resize z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg border-2 border-black font-bold text-xs">
                    ↔
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
