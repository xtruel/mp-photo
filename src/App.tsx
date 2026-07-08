import React, { useState, useEffect } from 'react';
import { 
  Camera, Phone, FileText, Settings, Star, Heart, ArrowLeft, 
  MapPin, Clock, Mail, ShieldCheck, Sparkles, AlertCircle 
} from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import WhyChooseUs from './components/WhyChooseUs';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import QuoteForm from './components/QuoteForm';
import AdminPanel from './components/AdminPanel';

import { DatabaseState, ReviewItem, AppSettings } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home'); // 'home' | 'quote' | 'admin' | 'page'
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [activeServiceKey, setActiveServiceKey] = useState<string | null>(null);

  // General Database State
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Admin login trigger
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(
    !!localStorage.getItem('mp_admin_token')
  );

  // Fetch all db state (Quotes, Portfolio, Services, Reviews, CustomPages, Settings, Stats)
  const fetchDbState = async () => {
    try {
      const response = await fetch('/api/db-state');
      if (response.ok) {
        const data = await response.json();
        setDbState(data);
        setErrorMsg('');
      } else {
        setErrorMsg('Errore nel caricamento dei dati del sito.');
      }
    } catch (err) {
      setErrorMsg('Impossibile connettersi al server locale.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState();
    
    // Increment views stat once on load
    const incrementViews = async () => {
      try {
        await fetch('/api/stats/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'views' })
        });
      } catch (e) {
        console.error('Failed to increment views:', e);
      }
    };
    incrementViews();
  }, []);

  // Handle adding direct reviews
  const handleAddReview = async (newReview: Omit<ReviewItem, 'id' | 'date'>) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (response.ok) {
        await fetchDbState();
      } else {
        throw new Error('Errore durante il salvataggio.');
      }
    } catch (err) {
      console.error(err);
      alert('Non è stato possibile salvare la tua recensione. Riprova più tardi.');
    }
  };

  // Safe navigation wrapper
  const handleNavigate = (view: string) => {
    if (view.startsWith('page:')) {
      const slug = view.split(':')[1];
      setSelectedPageSlug(slug);
      setCurrentView('page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView(view);
      setSelectedPageSlug(null);
      if (view === 'home') {
        setActiveServiceKey(null);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleAdminToggle = () => {
    if (currentView === 'admin') {
      setCurrentView('home');
    } else {
      setCurrentView('admin');
    }
  };

  // Sync token presence state from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdminLoggedIn(!!localStorage.getItem('mp_admin_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Periodic check since some browser tabs might modify the token
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Loading Screen
  if (loading || !dbState) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6 relative overflow-hidden" id="app-loading-screen">
        {/* Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin mx-auto flex items-center justify-center">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-light tracking-[0.3em] uppercase">
              M.P.<span className="text-[#D4AF37] font-bold">PHOTO</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono">Caricamento fotoritocco professionale...</p>
          </div>
        </div>
      </div>
    );
  }

  const settings = dbState.settings;

  // Custom landing page finder
  const currentPage = dbState.customPages.find(p => p.slug === selectedPageSlug);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black font-sans relative overflow-x-hidden" id="app-root">
      
      {/* BACKGROUND GLOWING ACCENTS (The signature theme style) */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/8 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[110px] pointer-events-none z-0" />

      {/* RENDER VIEW: ADMIN PANEL */}
      {currentView === 'admin' ? (
        <AdminPanel 
          onClose={() => setCurrentView('home')} 
          onRefreshAllData={fetchDbState}
          dbState={dbState}
        />
      ) : (
        /* RENDER VIEW: CLIENT PORTAL */
        <div className="relative z-10 flex flex-col min-h-screen">
          
          <Header 
            currentView={currentView}
            onNavigate={handleNavigate}
            settings={settings}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminToggle={handleAdminToggle}
          />

          {/* Alert if Server Connection fails */}
          {errorMsg && (
            <div className="max-w-7xl mx-auto px-4 mt-4 w-full" id="global-error-alert">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* VIEW: QUOTE FORM */}
          {currentView === 'quote' && (
            <main className="flex-1">
              <QuoteForm 
                settings={settings} 
                onNavigate={handleNavigate} 
              />
            </main>
          )}

          {/* VIEW: CUSTOM SEO PAGE */}
          {currentView === 'page' && currentPage && (
            <main className="flex-1 py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6">
              <button
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#D4AF37] transition-colors py-2 text-xs font-bold uppercase font-mono tracking-widest mb-8"
                id="back-home-seo-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Torna alla Home</span>
              </button>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4AF37]" />
                
                {/* Custom Page HTML renderer with frosted-glass classes */}
                <article 
                  className="prose prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 space-y-4"
                  dangerouslySetInnerHTML={{ __html: currentPage.content }}
                />

                <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Ti piace quello che vedi?</h4>
                    <p className="text-zinc-400 text-xs font-sans">Inviaci subito i tuoi scatti per un'analisi tecnica gratuita.</p>
                  </div>
                  <button
                    onClick={() => handleNavigate('quote')}
                    className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-widest rounded-full shadow-lg"
                    id="seo-cta-btn"
                  >
                    Richiedi Preventivo Gratuito
                  </button>
                </div>
              </div>
            </main>
          )}

          {/* VIEW: HOME PORTAL (Sequential scrolling landing) */}
          {currentView === 'home' && (
            <main className="flex-1">
              
              <Hero 
                settings={settings} 
                onNavigate={handleNavigate} 
              />
              
              <Services 
                services={dbState.services} 
                portfolioItems={dbState.portfolio}
                activeServiceKey={activeServiceKey}
                onSelectService={setActiveServiceKey}
                onNavigate={handleNavigate}
                settings={settings}
              />
              
              <Portfolio 
                portfolioItems={dbState.portfolio} 
              />
              
              <WhyChooseUs />
              
              <Reviews 
                reviews={dbState.reviews} 
                onAddReview={handleAddReview}
              />
              
              <FAQ />

            </main>
          )}

          {/* ELEGANT FROSTED-GLASS FOOTER */}
          <footer className="backdrop-blur-xl bg-white/[0.01] border-t border-white/5 py-12 md:py-16 text-zinc-400 text-sm mt-auto" id="app-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/5">
                
                {/* Brand Block */}
                <div className="md:col-span-4 space-y-4 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg text-[#D4AF37]">
                      <Camera className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-lg font-light tracking-[0.2em] uppercase text-white">
                      M.P.<span className="text-[#D4AF37] font-bold">PHOTO</span>
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed font-sans max-w-xs mx-auto md:mx-0">
                    Sviluppo digitale e fotoritocco professionale d'élite per auto, immobili, ritratti moda e prodotti e-commerce. Qualità senza compromessi.
                  </p>
                  
                  {/* Google badge proof in footer */}
                  <div className="inline-flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-amber-500 text-sm">★★★★★</span>
                    <span className="text-3xs font-mono font-bold text-white uppercase tracking-wider">Eccellente su Google</span>
                  </div>
                </div>

                {/* Services Links */}
                <div className="md:col-span-3 space-y-4 text-center md:text-left">
                  <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Servizi Dedicati</h3>
                  <ul className="space-y-2 text-xs">
                    {dbState.services.map(s => (
                      <li key={s.id}>
                        <button 
                          onClick={() => {
                            setActiveServiceKey(s.key);
                            handleNavigate('home');
                            setTimeout(() => {
                              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                            }, 150);
                          }}
                          className="hover:text-white transition-colors text-zinc-400"
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SEO Custom Pages Links */}
                <div className="md:col-span-2 space-y-4 text-center md:text-left">
                  <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Altre Lavorazioni</h3>
                  {dbState.customPages.length === 0 ? (
                    <p className="text-3xs text-zinc-600 font-mono">Nessuna pagina aggiuntiva.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {dbState.customPages.map(page => (
                        <li key={page.id}>
                          <button 
                            onClick={() => handleNavigate(`page:${page.slug}`)}
                            className="hover:text-[#D4AF37] transition-colors text-zinc-400 text-left"
                          >
                            {page.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Contact & Hours */}
                <div className="md:col-span-3 space-y-4 text-center md:text-left">
                  <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Contatti & Supporto</h3>
                  <div className="space-y-2 text-xs font-sans">
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Sempre aperti 24/7 per preventivi</span>
                    </p>
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <a href={`mailto:${settings.contactEmail}`} className="hover:underline text-zinc-300">{settings.contactEmail}</a>
                    </p>
                    <p className="flex items-center justify-center md:justify-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Lazio, Italia (Servizio 100% Online)</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright and compliance links */}
              <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-3xs font-mono text-zinc-600">
                <p>© 2026 M.P. Photo. Tutti i diritti riservati. P.IVA IT01234567890. Privacy & Cookie Policy.</p>
                <p className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" />
                  <span>Sito protetto da crittografia SSL 256-bit</span>
                </p>
              </div>

            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
