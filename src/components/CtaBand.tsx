import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { AppSettings } from '../types';

interface CtaBandProps {
  settings: AppSettings;
  onNavigate: (view: string) => void;
  title?: string;
  subtitle?: string;
}

/** Reusable mid-page call-to-action band. */
export default function CtaBand({
  settings,
  onNavigate,
  title = 'Pronto a dare nuova vita alle tue foto?',
  subtitle = 'Ricevi un preventivo gratuito in meno di un\'ora. Nessun impegno.',
}: CtaBandProps) {
  const handleWhatsApp = async () => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsappClicks' }),
      });
    } catch {
      /* best-effort */
    }
    const msg = encodeURIComponent('Ciao M.P. Photo! Vorrei un preventivo gratuito.');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <section className="bg-black px-5 sm:px-6 lg:px-8 py-10">
      <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#161310] to-[#0a0a0a] px-6 sm:px-12 py-12 md:py-16">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight max-w-2xl">
            {title}
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('quote')}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#e6c675] to-[#d4af37] hover:from-[#eecf85] hover:to-[#dcbb4a] text-black font-semibold rounded-2xl shadow-[0_10px_34px_-8px_rgba(212,175,55,0.5)] transition-all duration-300 text-[15px] hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5" />
              <span>Richiedi preventivo gratuito</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-white/[0.06] border border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 rounded-2xl transition-all duration-300 text-[15px] font-medium hover:-translate-y-0.5"
            >
              <span>Invia foto su WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
