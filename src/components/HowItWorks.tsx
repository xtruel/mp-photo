import React from 'react';
import { Upload, Sparkles, Download, FileText, ArrowRight } from 'lucide-react';
import { AppSettings } from '../types';

interface HowItWorksProps {
  settings: AppSettings;
  onNavigate: (view: string) => void;
}

const steps = [
  {
    icon: Upload,
    emoji: '📤',
    title: 'Carica la foto',
    desc: 'Inviaci i tuoi scatti dal modulo online o direttamente su WhatsApp. Tutti i formati, RAW inclusi.',
  },
  {
    icon: Sparkles,
    emoji: '✨',
    title: 'Ricevi il preventivo',
    desc: 'Analizziamo il lavoro e ti mandiamo un preventivo gratuito e senza impegno, in genere entro un\'ora.',
  },
  {
    icon: Download,
    emoji: '📥',
    title: 'Ricevi il file modificato',
    desc: 'Approvi, noi lavoriamo. Ricevi le foto ritoccate in 24–48h, con revisioni fino alla perfezione.',
  },
];

export default function HowItWorks({ settings, onNavigate }: HowItWorksProps) {
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
    const msg = encodeURIComponent('Ciao M.P. Photo! Vorrei un preventivo per il fotoritocco di alcune foto.');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <section id="come-funziona" className="bg-black py-20 md:py-28 relative overflow-hidden border-t border-white/[0.06]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/[0.06] rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[#e6c675] text-[13px] font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semplice e veloce</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Come funziona
          </h2>
          <p className="text-zinc-400 text-base md:text-lg mt-4 leading-relaxed">
            Dalla foto originale al risultato professionale in soli 3 passaggi.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative bg-white/[0.03] border border-white/10 rounded-[28px] p-7 md:p-8 hover:border-[#D4AF37]/30 hover:bg-white/[0.05] transition-all duration-300"
              >
                {/* Step number */}
                <span className="absolute top-6 right-7 text-5xl font-bold text-white/[0.06] select-none">
                  {i + 1}
                </span>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e6c675] to-[#d4af37] flex items-center justify-center text-black mb-6 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)]">
                  <Icon className="w-7 h-7" strokeWidth={2} />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <span aria-hidden="true">{step.emoji}</span>
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-[15px] leading-relaxed">{step.desc}</p>

                {/* Connector arrow (desktop) */}
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 text-[#D4AF37]/40 z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <button
            onClick={() => onNavigate('quote')}
            className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-[#e6c675] to-[#d4af37] hover:from-[#eecf85] hover:to-[#dcbb4a] text-black font-semibold rounded-2xl shadow-[0_10px_34px_-8px_rgba(212,175,55,0.5)] transition-all duration-300 text-[15px] hover:-translate-y-0.5"
          >
            <FileText className="w-5 h-5" />
            <span>Carica la tua foto ora</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-7 py-4 bg-white/[0.06] border border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 rounded-2xl transition-all duration-300 text-[15px] font-medium hover:-translate-y-0.5"
          >
            <span>Scrivici su WhatsApp</span>
          </button>
        </div>
      </div>
    </section>
  );
}
