import React from 'react';
import { Award, Gift, Zap, Globe, HeartHandshake } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Award,
      title: 'Qualità Professionale',
      desc: 'Pixel per pixel, utilizziamo le migliori tecniche di restauro digitale (dodge & burn, color grading di lusso) per garantire risultati impareggiabili.'
    },
    {
      icon: Gift,
      title: 'Preventivo Gratuito',
      desc: 'Invia le tue foto e ricevi una stima accurata del costo e una consulenza sulle modifiche consigliate in meno di 1 ora, senza alcun impegno.'
    },
    {
      icon: Zap,
      title: 'Consegna Rapida',
      desc: 'I tuoi file pronti e ottimizzati per la stampa o per il web in sole 24/48 ore. Disponibile anche servizio prioritario in 12 ore.'
    },
    {
      icon: Globe,
      title: 'Servizio Online',
      desc: 'Carica, scarica e paga comodamente da casa tua o da cellulare. Assistenza diretta e personalizzata tramite e-mail o WhatsApp.'
    },
    {
      icon: HeartHandshake,
      title: 'Soddisfatti o Rimborsati',
      desc: 'Lavoriamo finché non sei felice del risultato. Nel rarissimo caso in cui non fossi soddisfatto del lavoro finale, verrai rimborsato al 100%.'
    }
  ];

  return (
    <section id="why-choose-us" className="bg-zinc-950 py-20 border-t border-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">I nostri vantaggi</h2>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans block">
            Perché Scegliere M.P. Photo
          </span>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full" />
          <p className="text-zinc-400 font-sans text-sm md:text-base">
            Garantiamo l'eccellenza in ogni singolo scatto, combinando passione artistica e tecnologia avanzata.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feat, index) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={index}
                className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-900/80 hover:border-amber-500/30 transition-all duration-300 flex flex-col items-center text-center group hover:-translate-y-1"
                id={`feature-card-${index}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                  <IconComponent className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 font-sans tracking-wide">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
