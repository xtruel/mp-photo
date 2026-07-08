import React, { useState } from 'react';
import { 
  Car, Home, User, Mountain, ShoppingBag, 
  ArrowLeft, Check, Phone, FileText, Sparkles, HelpCircle 
} from 'lucide-react';
import { ServiceItem, PortfolioItem, AppSettings } from '../types';

interface ServicesProps {
  services: ServiceItem[];
  portfolioItems: PortfolioItem[];
  activeServiceKey: string | null;
  onSelectService: (key: string | null) => void;
  onNavigate: (view: string) => void;
  settings: AppSettings;
}

export default function Services({
  services,
  portfolioItems,
  activeServiceKey,
  onSelectService,
  onNavigate,
  settings,
}: ServicesProps) {
  // Before-After state for active service page
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Map icon strings to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return Car;
      case 'Home': return Home;
      case 'User': return User;
      case 'Mountain': return Mountain;
      case 'ShoppingBag': return ShoppingBag;
      default: return Sparkles;
    }
  };

  const handleWhatsAppClick = async (serviceName: string) => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsappClicks' })
      });
    } catch (e) {
      console.error(e);
    }
    const message = encodeURIComponent(`Ciao M.P. Photo! Vorrei un preventivo gratuito per il servizio di fotoritocco professionale per: ${serviceName}.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  // Find currently active service details
  const activeService = services.find(s => s.key === activeServiceKey);

  // Find portfolio sample item for comparison slider on dedicated page
  const activeSampleItem = portfolioItems.find(p => p.category === activeServiceKey) || portfolioItems[0];

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  // Rendering DEDICATED PAGE for active service
  if (activeService) {
    const IconComponent = getIcon(activeService.icon);
    
    // Category specific details (Dettagli tecnici del servizio)
    const technicalTasks: Record<string, string[]> = {
      auto: [
        'Rimozione riflessi ambientali complessi sulla carrozzeria',
        'Cancellazione della targa o sostituzione con logo personalizzato',
        'Rimozione imperfezioni dell\'asfalto, polvere e sporco stradale',
        'Sostituzione dello sfondo (Sky replacement & Studio lighting)',
        'Ottimizzazione dei cerchioni, cromature e fari',
        'Color grading di lusso per esaltare la tonalità della vernice'
      ],
      immobili: [
        'Correzione delle aberrazioni grandangolari e linee prospettiche cadenti',
        'Fusione HDR avanzata di esposizioni multiple (finestre ed interni)',
        'Sostituzione del cielo grigio con tramonti mozzafiato o cielo azzurro',
        'Rimozione digitale di oggetti di disturbo (fili elettrici, auto, bidoni)',
        'Accensione luci interne e fari esterni (simulazione crepuscolare)',
        'Ottimizzazione nitidezza e bilanciamento del bianco per luce naturale'
      ],
      ritratti: [
        'Levigatura naturale della pelle tramite separazione delle frequenze',
        'Dodge and Burn micro e macro per ridisegnare luci e ombre',
        'Rimozione imperfezioni cutanee temporanee mantenendo intatti i pori',
        'Ottimizzazione ed esaltazione dell\'iride, ciglia e contrasto occhi',
        'Digital makeup (lucidalabbra, fard, correzione capelli ribelli)',
        'Sbiancamento dei denti delicato e modellamento dei volumi del viso'
      ],
      paesaggi: [
        'Recupero ombre profonde e controllo luci bruciate (Dynamic Range)',
        'Rimozione digitale di turisti, cartelli o elementi estranei',
        'Miglioramento della foschia atmosferica per rivelare dettagli distanti',
        'Color grading artistico (tonalità cinematografiche, bianco e nero Fine Art)',
        'Sostituzione del cielo o aggiunta di bagliori solari realistici',
        'Preparazione ottimale per stampe fotografiche di grande formato'
      ],
      prodotti: [
        'Scontornatura millimetrica con tracciati di ritaglio vettoriali',
        'Rimozione di polvere, pelucchi e micro-graffi sul prodotto',
        'Allineamento dei riflessi e uniformazione dei metalli lucidi',
        'Creazione di ombre o riflessi morbidi realistici su fondo bianco puro',
        'Massima precisione cromatica garantita rispetto all\'oggetto reale',
        'Formattazione e compressione ottimale per Amazon, Shopify e Cataloghi'
      ]
    };

    const tasks = technicalTasks[activeService.key] || [
      'Correzione esposizione e contrasto zonale',
      'Pulizia dello sfondo ed eliminazione distrazioni',
      'Color grading personalizzato',
      'Ottimizzazione dettagli e nitidezza'
    ];

    return (
      <div className="bg-black py-12 md:py-20 text-white min-h-screen" id="service-detail-view">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
          
          {/* Back Navigation */}
          <button
            onClick={() => {
              onSelectService(null);
              // scroll to services section on main page
              setTimeout(() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors py-2 text-sm font-medium tracking-wide uppercase font-mono group"
            id="service-back-btn"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Torna ai Servizi
          </button>

          {/* Dedicated Service Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-zinc-900 pb-10">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest">
                <IconComponent className="w-5 h-5 text-amber-500" />
                <span>M.P. Photo Specializzazione</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{activeService.title}</h1>
              <p className="text-lg text-amber-500 font-medium font-sans italic">{activeService.subtitle}</p>
              <p className="text-zinc-400 font-sans leading-relaxed text-sm md:text-base">{activeService.longDesc}</p>
            </div>
            
            {/* Price tag card */}
            <div className="md:col-span-4 bg-zinc-950 border border-amber-500/20 p-6 rounded-2xl text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-600" />
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Tariffa Professionale</p>
              <p className="text-2xl md:text-3xl font-extrabold text-white mt-2 mb-1">{activeService.pricing}</p>
              <p className="text-zinc-400 text-2xs leading-relaxed">Preventivo ad-hoc in base al numero di scatti e alla complessità.</p>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => onNavigate('quote')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-xs uppercase rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-colors flex items-center justify-center gap-1.5"
                  id="service-quote-cta"
                >
                  <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                  Richiedi preventivo
                </button>
                <button
                  onClick={() => handleWhatsAppClick(activeService.title)}
                  className="w-full py-3 border border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  id="service-whatsapp-cta"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Invia su WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Dual image Before After Slider for the active service */}
          {activeSampleItem && (
            <div className="space-y-4">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-lg font-bold">Guarda l'Efficacia del Ritocco</h3>
                <p className="text-xs text-zinc-500 font-sans">Sposta la barra centrale per scorrere tra il file RAW originale e il fotoritocco completato.</p>
              </div>

              <div className="relative bg-zinc-950 p-1 rounded-2xl border border-zinc-900 overflow-hidden max-w-3xl mx-auto shadow-2xl">
                <div 
                  onMouseMove={(e) => {
                    if (e.buttons === 1 || isDragging) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleMove(e.clientX, rect);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleMove(e.touches[0].clientX, rect);
                    }
                  }}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  className="relative aspect-[16/10] w-full rounded-xl overflow-hidden cursor-ew-resize select-none"
                  id="service-slider-inner"
                >
                  {/* AFTER */}
                  <img 
                    src={activeSampleItem.afterImage} 
                    alt="Dopo" 
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    style={{ filter: activeSampleItem.afterFilter || "none" }}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-2xs text-white uppercase font-bold border border-zinc-800">Dopo</div>

                  {/* BEFORE */}
                  <div 
                    className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100, 0 100)` }}
                  >
                    <img 
                      src={activeSampleItem.beforeImage} 
                      alt="Prima" 
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      style={{ filter: activeSampleItem.beforeFilter || "grayscale(30%) brightness(80%)" }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-4 left-4 z-10 bg-amber-500 px-3 py-1 rounded text-2xs text-black uppercase font-extrabold">Prima</div>
                  </div>

                  {/* Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-[2.5px] bg-amber-500 cursor-ew-resize z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md border border-black text-[10px]">
                      ↔
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical List Grid */}
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Interventi inclusi nella nostra lavorazione standard:</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-900/60 hover:border-amber-500/10 transition-colors">
                  <span className="p-1 rounded bg-amber-500/10 text-amber-500 mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span className="text-zinc-300 font-sans leading-relaxed">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to action card */}
          <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">Mettici alla Prova</h3>
            <p className="text-zinc-400 max-w-xl mx-auto font-sans text-sm md:text-base">
              Non sai se il tuo file può essere recuperato? Caricalo ora nel modulo preventivi. Eseguiamo un'analisi tecnica gratuita senza obbligo d'acquisto.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={() => onNavigate('quote')}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold rounded-full transition-all duration-300 text-sm shadow-xl"
                id="service-detail-quote-cta"
              >
                Invia foto per Preventivo Gratuito
              </button>
              <button
                onClick={() => handleWhatsAppClick(activeService.title)}
                className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2"
                id="service-detail-whatsapp-cta"
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                Richiedi via WhatsApp
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Rendering HOME SERVICE LIST
  return (
    <section id="services" className="bg-black py-20 relative overflow-hidden border-t border-zinc-900">
      <div className="absolute top-0 left-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">Specialisti del Fotoritocco</h2>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans block">
            Servizi di Editing d'Élite
          </span>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full" />
          <p className="text-zinc-400 font-sans text-sm md:text-base">
            Seleziona una categoria per visualizzare la sua pagina dedicata con dettagli tecnici, listino prezzi e gallery interattiva.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, index) => {
            const IconComponent = getIcon(service.icon);
            return (
              <div 
                key={service.id}
                onClick={() => {
                  onSelectService(service.key);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)] transform hover:-translate-y-1"
                id={`service-card-${service.key}`}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                    <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors font-sans leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-2xs text-amber-500/80 font-mono font-medium tracking-wide">
                      {service.pricing}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-900 flex items-center justify-between text-2xs font-bold text-zinc-400 group-hover:text-amber-500 transition-colors uppercase font-mono tracking-wider">
                  <span>Esplora servizio</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
