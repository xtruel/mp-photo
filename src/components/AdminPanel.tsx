import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Phone, Mail, MessageSquare, Trash2, Edit2, 
  Plus, Check, X, Sliders, Settings, Lock, Eye, CheckCircle, 
  ExternalLink, Calendar, RefreshCw, Layers, FileText, ChevronDown, 
  ChevronUp, EyeOff, Save, PlusCircle, Sparkles, LogOut, CheckSquare,
  Globe
} from 'lucide-react';
import { DatabaseState, QuoteRequest, PortfolioItem, ServiceItem, ReviewItem, CustomPage, AppSettings } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onRefreshAllData: () => Promise<void>;
  dbState: DatabaseState;
}

export default function AdminPanel({ onClose, onRefreshAllData, dbState }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('mp_admin_token'));
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'stats' | 'quotes' | 'portfolio' | 'services' | 'reviews' | 'pages' | 'settings'>('stats');

  // Entities states (for local editing / optimistic updates)
  const [quotes, setQuotes] = useState<QuoteRequest[]>(dbState.quotes || []);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(dbState.portfolio || []);
  const [services, setServices] = useState<ServiceItem[]>(dbState.services || []);
  const [reviews, setReviews] = useState<ReviewItem[]>(dbState.reviews || []);
  const [customPages, setCustomPages] = useState<CustomPage[]>(dbState.customPages || []);
  const [settings, setSettings] = useState<AppSettings>(dbState.settings);

  // Expanded items in quote list
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  
  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Forms states
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<Partial<PortfolioItem> | null>(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);

  const [editingReview, setEditingReview] = useState<Partial<ReviewItem> | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [notesSavingId, setNotesSavingId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  // Sync state whenever dbState updates
  useEffect(() => {
    setQuotes(dbState.quotes || []);
    setPortfolio(dbState.portfolio || []);
    setServices(dbState.services || []);
    setReviews(dbState.reviews || []);
    setCustomPages(dbState.customPages || []);
    setSettings(dbState.settings);
    
    // Initialize temporary notes
    const notesMap: Record<string, string> = {};
    (dbState.quotes || []).forEach(q => {
      notesMap[q.id] = q.internalNotes || '';
    });
    setTempNotes(notesMap);
  }, [dbState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('mp_admin_token', data.token);
        setToken(data.token);
        setPassword('');
        await onRefreshAllData();
      } else {
        setErrorMsg(data.error || 'Password non valida.');
      }
    } catch (err) {
      setErrorMsg('Errore di connessione col server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mp_admin_token');
    setToken(null);
  };

  // Quotes Operations
  const handleUpdateQuoteStatus = async (id: string, status: QuoteRequest['status']) => {
    try {
      const response = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
        // Soft refresh
        onRefreshAllData();
      }
    } catch (err) {
      alert('Errore nell\'aggiornamento dello stato.');
    }
  };

  const handleSaveNotes = async (id: string) => {
    setNotesSavingId(id);
    try {
      const response = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: tempNotes[id] || '' })
      });
      if (response.ok) {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, internalNotes: tempNotes[id] } : q));
        setTimeout(() => setNotesSavingId(null), 800);
      }
    } catch (err) {
      alert('Errore nel salvataggio delle note.');
      setNotesSavingId(null);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('Vuoi davvero eliminare questa richiesta di preventivo? Questa azione è irreversibile.')) return;
    try {
      const response = await fetch(`/api/admin/quotes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setQuotes(prev => prev.filter(q => q.id !== id));
        onRefreshAllData();
      }
    } catch (err) {
      alert('Impossibile eliminare il preventivo.');
    }
  };

  // Portfolio Operations
  const handleSavePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortfolioItem?.title || !editingPortfolioItem?.category) {
      alert('Titolo e Categoria sono obbligatori.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPortfolioItem)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowPortfolioForm(false);
        setEditingPortfolioItem(null);
        await onRefreshAllData();
      } else {
        alert(data.error || 'Impossibile salvare l\'elemento del portfolio.');
      }
    } catch (err) {
      alert('Errore di rete.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (!window.confirm('Eliminare questa foto dal portfolio?')) return;
    try {
      const response = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await onRefreshAllData();
      }
    } catch (err) {
      alert('Errore durante l\'eliminazione.');
    }
  };

  // Helper to trigger camera or image base64 conversion
  const handleFileToBase64 = (e: React.ChangeEvent<HTMLInputElement>, field: 'beforeImage' | 'afterImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditingPortfolioItem(prev => ({
          ...prev,
          [field]: event.target!.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Service Operations
  const handleUpdateService = async (item: ServiceItem) => {
    try {
      const response = await fetch(`/api/admin/services/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) {
        alert('Servizio aggiornato con successo!');
        onRefreshAllData();
      }
    } catch (err) {
      alert('Errore nel salvataggio.');
    }
  };

  const handleServiceChange = (id: string, field: keyof ServiceItem, value: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Review Operations
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview?.author || !editingReview?.text) {
      alert('Autore e Testo sono obbligatori.');
      return;
    }
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingReview)
      });
      if (response.ok) {
        setShowReviewForm(false);
        setEditingReview(null);
        await onRefreshAllData();
      }
    } catch (err) {
      alert('Errore di rete.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Eliminare questa recensione?')) return;
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await onRefreshAllData();
      }
    } catch (err) {
      alert('Errore durante l\'eliminazione.');
    }
  };

  // Custom Pages Operations
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title || !editingPage?.slug || !editingPage?.content) {
      alert('Tutti i campi principali sono obbligatori.');
      return;
    }
    try {
      const response = await fetch('/api/admin/custom-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage)
      });
      if (response.ok) {
        setShowPageForm(false);
        setEditingPage(null);
        await onRefreshAllData();
      }
    } catch (err) {
      alert('Errore nel salvataggio della pagina.');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm('Eliminare definitivamente questa pagina personalizzata?')) return;
    try {
      const response = await fetch(`/api/admin/custom-pages/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await onRefreshAllData();
      }
    } catch (err) {
      alert('Errore durante l\'eliminazione.');
    }
  };

  // Save General App Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        alert('Impostazioni salvate nel database!');
        onRefreshAllData();
      }
    } catch (err) {
      alert('Errore nel salvataggio.');
    }
  };

  // WhatsApp response pre-fill generator
  const handleWhatsAppReply = (quote: QuoteRequest) => {
    const text = encodeURIComponent(`Ciao ${quote.name}! Sono un fotoritoccatore di M.P. Photo. Ho esaminato la tua richiesta di preventivo del ${new Date(quote.date).toLocaleDateString()} per il fotoritocco di tipo ${quote.service.toUpperCase()}.\n\nEcco la nostra analisi tecnica: `);
    window.open(`https://wa.me/${quote.phone ? quote.phone.replace(/[^0-9]/g, '') : settings.whatsappNumber}?text=${text}`, '_blank');
  };

  // If not logged in, show an exquisite frosted-glass Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden" id="admin-login-view">
        {/* Glowing Background Accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-white/5 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="w-full max-w-md backdrop-blur-xl bg-white/[0.03] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] to-amber-500" />
          
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/10">
            <Lock className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-light tracking-[0.2em] uppercase">
              M.P.<span className="text-[#D4AF37] font-bold">ADMIN</span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono">Pannello di Controllo Sicuro</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-sans">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Codice o Password di Accesso</label>
              <input 
                type="password" 
                required
                placeholder="Inserisci password d'amministratore"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 placeholder-white/20 transition-all font-sans"
                id="admin-password-input"
              />
              <p className="text-[10px] text-white/30 font-mono mt-1">* Usa 'admin' per testare immediatamente.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#D4AF37] text-black font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-lg hover:bg-[#c4a132] transition-colors flex items-center justify-center gap-2 transform active:scale-98"
              id="admin-login-submit"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Accedi al Pannello</span>
                </>
              )}
            </button>
          </form>

          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs font-mono underline"
          >
            Annulla e Torna al Sito
          </button>
        </div>
      </div>
    );
  }

  // --- LOGGED IN: RENDER RICH ADMIN DASHBOARD (IPHONE FIRST & RESPONSIVE) ---
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans" id="admin-dashboard-view">
      {/* Background Accents */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-white/3 rounded-full blur-[90px] pointer-events-none"></div>

      {/* ADMIN TOP HEADER - Extremely clean and compact on phone */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/90 border-b border-white/10 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg text-[#D4AF37]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-widest uppercase text-white">M.P. PHOTO</span>
                <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded font-mono font-bold">LIVE-IPHONE</span>
              </div>
              <p className="text-[10px] text-white/50 font-mono">Pannello Amministratore</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshAllData}
              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:text-[#D4AF37] transition-all text-white/70"
              title="Aggiorna Dati"
              id="admin-refresh-data-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-900/10 transition-all text-xs font-mono font-medium"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-[#D4AF37] text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#c4a132] transition-colors"
              id="admin-close-panel-btn"
            >
              Chiudi
            </button>
          </div>
        </div>
      </header>

      {/* TABS SELECTOR - Designed specifically to be swipe-scrollable horizontally on iPhone without overflow */}
      <div className="bg-zinc-950 border-b border-white/5 overflow-x-auto scrollbar-none sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 py-3 whitespace-nowrap min-w-max">
          {[
            { id: 'stats', label: 'Dashboard', icon: TrendingUp },
            { id: 'quotes', label: `Preventivi (${quotes.length})`, icon: FileText },
            { id: 'portfolio', label: `Portfolio (${portfolio.length})`, icon: Layers },
            { id: 'services', label: 'Servizi', icon: Sliders },
            { id: 'reviews', label: `Recensioni (${reviews.length})`, icon: MessageSquare },
            { id: 'pages', label: `Pagine (${customPages.length})`, icon: Globe },
            { id: 'settings', label: 'Impostazioni', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/10'
                    : 'bg-white/5 border border-white/5 text-white/70 hover:text-white'
                }`}
                id={`admin-tab-${tab.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6 overflow-y-auto">
        
        {/* ==================== TAB 1: STATS & DASHBOARD OVERVIEW ==================== */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-stats-panel">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight">Panoramica Canali & Richieste</h2>
              <p className="text-zinc-500 text-xs">Statistiche reali registrate dal database di M.P. Photo.</p>
            </div>

            {/* Visual Bento Grid - Highly responsive and touchable */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Views */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Visualizzazioni Totali</p>
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{dbState.stats.views}</p>
                  <p className="text-3xs text-zinc-500 font-mono">Aggiornato in tempo reale</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Quotes */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Preventivi Richiesti</p>
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#D4AF37]">{dbState.stats.quotes}</p>
                  <p className="text-3xs text-zinc-500 font-mono">Conversione visite: {dbState.stats.views > 0 ? ((dbState.stats.quotes / dbState.stats.views) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: WhatsApp Clicks */}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="space-y-2">
                  <p className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Click Sincronizzati WhatsApp</p>
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-400">{dbState.stats.whatsappClicks}</p>
                  <p className="text-3xs text-zinc-500 font-mono">Richieste dirette istantanee</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Phone className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Quick Tips or conversion summary */}
            <div className="backdrop-blur-xl bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">🔥 Consigli per lo smartphone</h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Sei collegato da iPhone. Puoi gestire i clienti direttamente cliccando sui tasti rapidi dei preventivi: potrai avviare chat precompilate su WhatsApp o inviare e-mail formattate con un solo tocco senza trascrivere i dati.
              </p>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: QUOTES MANAGER (MOBILE CARDS FIRST) ==================== */}
        {activeTab === 'quotes' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-quotes-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Richieste di Preventivo Gratuito</h2>
                <p className="text-zinc-500 text-xs">Gestisci le richieste inviate, analizza le foto e rispondi rapidamente.</p>
              </div>
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-max text-white/60">
                Totale: {quotes.length} richieste
              </span>
            </div>

            {/* Main Quotes list in mobile-first cards */}
            <div className="space-y-4">
              {quotes.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 text-white/40 text-sm font-sans">
                  Nessuna richiesta di preventivo ricevuta.
                </div>
              ) : (
                quotes.map(quote => {
                  const isExpanded = expandedQuoteId === quote.id;
                  
                  // Status colors mapping
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                      case 'Reviewing': return 'bg-amber-500/10 text-[#D4AF37] border-[#D4AF37]/20';
                      case 'Quoted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                      default: return 'bg-white/5 text-white/50 border-white/5';
                    }
                  };

                  return (
                    <div 
                      key={quote.id}
                      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 transition-all space-y-4 hover:border-white/25"
                      id={`quote-card-${quote.id}`}
                    >
                      {/* Card Header (Row 1) */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-white">{quote.name}</h3>
                            <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded ${getStatusColor(quote.status)}`}>
                              {quote.status}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-xs font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.date).toLocaleString()}
                          </p>
                        </div>

                        {/* Category badge */}
                        <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-1 rounded-full uppercase">
                          {quote.service}
                        </span>
                      </div>

                      {/* Contact Buttons (Extremely useful on iPhone!) */}
                      <div className="grid grid-cols-3 gap-2">
                        {quote.phone && (
                          <a 
                            href={`tel:${quote.phone}`}
                            className="flex items-center justify-center gap-1.5 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                            <span>Chiama</span>
                          </a>
                        )}
                        {quote.phone && (
                          <button 
                            onClick={() => handleWhatsAppReply(quote)}
                            className="flex items-center justify-center gap-1.5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                        <a 
                          href={`mailto:${quote.email}?subject=M.P. Photo - Preventivo Fotoritocco ${quote.service.toUpperCase()}`}
                          className="flex items-center justify-center gap-1.5 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-500" />
                          <span>E-mail</span>
                        </a>
                      </div>

                      {/* Main Message details */}
                      <div className="space-y-1.5 p-3.5 bg-black/40 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">Modifiche Richieste:</p>
                        <p className="text-xs text-white/80 font-sans leading-relaxed whitespace-pre-wrap">{quote.description}</p>
                      </div>

                      {/* File previews */}
                      {quote.files && quote.files.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">Allegati ({quote.files.length}):</p>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {quote.files.map((file, idx) => (
                              <div 
                                key={idx}
                                onClick={() => setPreviewImage(file)}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 cursor-zoom-in"
                              >
                                <img src={file} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions Action Drawer / Expander */}
                      <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                            className="flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline"
                          >
                            <span>Opzioni & Note Interne</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="p-2 bg-red-950/20 text-red-400 rounded-lg hover:bg-red-900/20"
                            title="Elimina Richiesta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="space-y-4 animate-slideDown p-4 bg-white/[0.02] rounded-xl border border-white/5">
                            
                            {/* Update state selector */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Cambia Stato Pratica</label>
                              <div className="flex flex-wrap gap-1.5">
                                {['Pending', 'Reviewing', 'Quoted', 'Completed'].map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleUpdateQuoteStatus(quote.id, st as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      quote.status === st
                                        ? 'bg-[#D4AF37] text-black'
                                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Internal notes */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Note Amministratore (Invisibili al cliente)</label>
                              <textarea
                                value={tempNotes[quote.id] || ''}
                                onChange={(e) => setTempNotes({ ...tempNotes, [quote.id]: e.target.value })}
                                placeholder="Scrivi qui note tecniche (es. Preventivato 30€, pronto per invio, attesa bonifico...)"
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                                rows={2}
                              />
                              <button
                                onClick={() => handleSaveNotes(quote.id)}
                                disabled={notesSavingId === quote.id}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:border-[#D4AF37]/50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                              >
                                {notesSavingId === quote.id ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span className="text-[#D4AF37]">Salvato!</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Salva Note</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PORTFOLIO MANAGER ==================== */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-portfolio-panel">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Catalogo Portfolio</h2>
                <p className="text-zinc-500 text-xs font-sans">Aggiungi, modifica o elimina i confronti prima/dopo del sito.</p>
              </div>
              
              <button
                onClick={() => {
                  setEditingPortfolioItem({
                    title: '',
                    category: 'auto',
                    beforeImage: '',
                    afterImage: '',
                    description: '',
                    featured: true,
                    beforeFilter: 'saturate-[0.5] brightness-[0.8] contrast-[0.85]',
                    afterFilter: 'saturate-[1.3] brightness-[1.08] contrast-[1.12]'
                  });
                  setShowPortfolioForm(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] text-black text-xs font-bold uppercase rounded-full shadow-lg"
                id="admin-add-portfolio-btn"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Aggiungi Foto</span>
              </button>
            </div>

            {/* Portfolio Add/Edit Form Slideover Modal */}
            {showPortfolioForm && editingPortfolioItem && (
              <div className="backdrop-blur-xl bg-black/90 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
                    {editingPortfolioItem.id ? 'Modifica Elemento Portfolio' : 'Aggiungi Nuovo Elemento'}
                  </h3>
                  <button 
                    onClick={() => {
                      setShowPortfolioForm(false);
                      setEditingPortfolioItem(null);
                    }}
                    className="p-1.5 text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePortfolioItem} className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Titolo Progetto *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. Alfa Romeo Giulietta Rosso Competizione"
                      value={editingPortfolioItem.title || ''}
                      onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Categoria *</label>
                      <select
                        value={editingPortfolioItem.category || 'auto'}
                        onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, category: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="auto">🚗 Auto & Motocicli</option>
                        <option value="immobili">🏡 Immobili & Interni</option>
                        <option value="ritratti">👤 Ritratti & Beauty</option>
                        <option value="paesaggi">🌄 Paesaggi & Fine Art</option>
                        <option value="prodotti">🛍️ Prodotti & E-commerce</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input 
                        type="checkbox"
                        id="feat"
                        checked={editingPortfolioItem.featured || false}
                        onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, featured: e.target.checked })}
                        className="w-5 h-5 accent-[#D4AF37]"
                      />
                      <label htmlFor="feat" className="text-xs text-white/80 font-bold select-none cursor-pointer">In Evidenza (Mostra in Home)</label>
                    </div>
                  </div>

                  {/* Dual upload blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Before Image upload */}
                    <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Immagine PRIMA (Originale)</label>
                      {editingPortfolioItem.beforeImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={editingPortfolioItem.beforeImage} alt="Prima" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditingPortfolioItem({ ...editingPortfolioItem, beforeImage: '' })}
                            className="absolute top-1.5 right-1.5 bg-red-600 p-1 rounded-full text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-white/20">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileToBase64(e, 'beforeImage')}
                            className="hidden" 
                            id="file-before"
                          />
                          <label htmlFor="file-before" className="cursor-pointer space-y-1 text-xs">
                            <span className="text-[#D4AF37] underline block">Seleziona Immagine</span>
                            <span className="text-[10px] text-zinc-500 block">Fotocamera o galleria</span>
                          </label>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-mono">Oppure URL statico:</span>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          value={editingPortfolioItem.beforeImage || ''}
                          onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, beforeImage: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* After Image upload */}
                    <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Immagine DOPO (Ritoccata)</label>
                      {editingPortfolioItem.afterImage ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={editingPortfolioItem.afterImage} alt="Dopo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditingPortfolioItem({ ...editingPortfolioItem, afterImage: '' })}
                            className="absolute top-1.5 right-1.5 bg-red-600 p-1 rounded-full text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-white/20">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileToBase64(e, 'afterImage')}
                            className="hidden" 
                            id="file-after"
                          />
                          <label htmlFor="file-after" className="cursor-pointer space-y-1 text-xs">
                            <span className="text-[#D4AF37] underline block">Seleziona Immagine</span>
                            <span className="text-[10px] text-zinc-500 block">Fotocamera o galleria</span>
                          </label>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 font-mono">Oppure URL statico:</span>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          value={editingPortfolioItem.afterImage || ''}
                          onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, afterImage: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest">Descrizione Intervento Tecnico</label>
                    <textarea 
                      rows={2}
                      placeholder="Spiega gli interventi effettuati, es: rimozione di polvere, correzione riflessi..."
                      value={editingPortfolioItem.description || ''}
                      onChange={(e) => setEditingPortfolioItem({ ...editingPortfolioItem, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-[#D4AF37] text-black font-extrabold uppercase rounded-xl tracking-wider text-xs"
                    >
                      {loading ? 'Salvataggio...' : 'Salva Progetto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPortfolioForm(false);
                        setEditingPortfolioItem(null);
                      }}
                      className="px-6 py-3 bg-white/5 text-white/70 hover:text-white rounded-xl text-xs"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of current Projects with actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map(item => (
                <div 
                  key={item.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-black">
                    <img src={item.afterImage} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono font-bold uppercase bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#D4AF37]/10">
                        {item.category}
                      </span>
                      {item.featured && (
                        <span className="text-[8px] font-mono font-bold bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/10">
                          HOME
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm truncate text-white">{item.title}</h4>
                    <p className="text-zinc-500 text-3xs font-mono truncate">{item.description}</p>
                    
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          setEditingPortfolioItem(item);
                          setShowPortfolioForm(true);
                        }}
                        className="text-xs text-[#D4AF37] hover:underline font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Modifica
                      </button>
                      <button
                        onClick={() => handleDeletePortfolioItem(item.id)}
                        className="text-xs text-red-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: SERVICES MANAGER ==================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-services-panel">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Servizi di Fotoritocco</h2>
              <p className="text-zinc-500 text-xs">Modifica i testi dei 5 servizi principali, i prezzi e le descrizioni lunghe.</p>
            </div>

            <div className="space-y-6">
              {services.map(service => (
                <div 
                  key={service.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <span className="text-lg">
                      {service.key === 'auto' ? '🚗' : 
                       service.key === 'immobili' ? '🏡' : 
                       service.key === 'ritratti' ? '👤' : 
                       service.key === 'paesaggi' ? '🌄' : '🛍️'}
                    </span>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Servizio: {service.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Titolo Visibile</label>
                      <input 
                        type="text" 
                        value={service.title}
                        onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Prezzo di Partenza</label>
                      <input 
                        type="text" 
                        value={service.pricing}
                        onChange={(e) => handleServiceChange(service.id, 'pricing', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Sottotitolo Accattivante</label>
                      <input 
                        type="text" 
                        value={service.subtitle}
                        onChange={(e) => handleServiceChange(service.id, 'subtitle', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Descrizione Breve (Sotto la card)</label>
                      <textarea 
                        rows={2}
                        value={service.shortDesc}
                        onChange={(e) => handleServiceChange(service.id, 'shortDesc', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Descrizione Tecnica Estesa (Pagina dedicata)</label>
                      <textarea 
                        rows={4}
                        value={service.longDesc}
                        onChange={(e) => handleServiceChange(service.id, 'longDesc', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateService(service)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-black rounded-lg text-xs font-bold text-[#D4AF37] transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salva Servizio {service.title}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: REVIEWS MANAGER ==================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-reviews-panel">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Recensioni dei Clienti</h2>
                <p className="text-zinc-500 text-xs">Aggiungi testimonianze manuali o inserisci risposte di cortesia.</p>
              </div>

              <button
                onClick={() => {
                  setEditingReview({
                    author: '',
                    rating: 5,
                    text: '',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                    reply: '',
                    source: 'direct'
                  });
                  setShowReviewForm(true);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase rounded-full"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Aggiungi Recensione</span>
              </button>
            </div>

            {/* Testimonial Add Form */}
            {showReviewForm && editingReview && (
              <form onSubmit={handleSaveReview} className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-4 text-sm">
                <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Aggiungi Nuova Recensione</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Nome Autore *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. Elena Rossi"
                      value={editingReview.author || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                      className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Stelle (1-5)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="5"
                        value={editingReview.rating || 5}
                        onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Sorgente</label>
                      <select 
                        value={editingReview.source || 'direct'}
                        onChange={(e) => setEditingReview({ ...editingReview, source: e.target.value as any })}
                        className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                      >
                        <option value="direct">Sito Web (Diretto)</option>
                        <option value="google">Google Maps Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Testo Recensione *</label>
                  <textarea 
                    rows={2}
                    required
                    value={editingReview.text || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Risposta del Titolare (Opzionale)</label>
                  <textarea 
                    rows={2}
                    placeholder="E.g. Grazie mille per il feedback positivo!"
                    value={editingReview.reply || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, reply: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-3 bg-[#D4AF37] text-black font-extrabold text-xs uppercase rounded-xl">
                    Salva Recensione
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowReviewForm(false); setEditingReview(null); }}
                    className="px-5 py-3 bg-white/5 text-white/80 rounded-xl text-xs"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            )}

            {/* List of testimonies */}
            <div className="space-y-4">
              {reviews.map(rev => (
                <div 
                  key={rev.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                        <img src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{rev.author}</h4>
                        <div className="flex text-amber-400 text-xs">
                          {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">
                        {rev.source}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 bg-red-950/20 text-red-400 hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-sans">{rev.text}</p>

                  {rev.reply ? (
                    <div className="p-3 bg-black/40 border-l-2 border-[#D4AF37] rounded-r-xl space-y-1">
                      <p className="text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">Risposta di M.P. Photo:</p>
                      <p className="text-xs text-zinc-300 italic">"{rev.reply}"</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingReview(rev);
                        setShowReviewForm(true);
                      }}
                      className="text-3xs font-mono font-bold text-[#D4AF37] uppercase hover:underline"
                    >
                      + Scrivi risposta di cortesia
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 6: CUSTOM LANDING PAGES ==================== */}
        {activeTab === 'pages' && (
          <div className="space-y-6 animate-fadeIn" id="admin-tab-pages-panel">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Pagine Personalizzate (SEO)</h2>
                <p className="text-zinc-500 text-xs">Crea pagine di atterraggio tematiche per matrimoni, eventi e promozioni locali.</p>
              </div>

              <button
                onClick={() => {
                  setEditingPage({
                    title: '',
                    slug: '',
                    content: '<h1>Titolo della Pagina</h1><p>Scrivi il contenuto HTML o Markdown qui...</p>',
                    isPublished: true,
                    metaDescription: ''
                  });
                  setShowPageForm(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] text-black text-xs font-bold uppercase rounded-full shadow-lg"
                id="admin-add-page-btn"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuova Pagina</span>
              </button>
            </div>

            {/* Custom page form */}
            {showPageForm && editingPage && (
              <form onSubmit={handleSavePage} className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-4 text-sm">
                <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
                  {editingPage.id ? 'Modifica Pagina Personalizzata' : 'Crea Nuova Pagina'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Titolo Pagina *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.g. Fotoritocco Matrimoniale di Lusso"
                      value={editingPage.title || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Slug URL * (Senza spazi)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="fotoritocco-matrimoni-lusso"
                      value={editingPage.slug || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Meta Description SEO (Consigliata)</label>
                  <input 
                    type="text"
                    placeholder="Servizio premium di ottimizzazione foto matrimoniali con fotoritocco naturalistico d'élite..."
                    value={editingPage.metaDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Contenuto della Pagina (Supporta HTML/HTML standard)</label>
                    <span className="text-[9px] text-zinc-500">Puoi usare tag come h1, h2, p, ul, li</span>
                  </div>
                  <textarea 
                    rows={8}
                    required
                    value={editingPage.content || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-3 bg-[#D4AF37] text-black font-extrabold text-xs uppercase rounded-xl">
                    Salva e Pubblica Pagina
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowPageForm(false); setEditingPage(null); }}
                    className="px-5 py-3 bg-white/5 text-white/80 rounded-xl text-xs"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            )}

            {/* Pages list */}
            <div className="space-y-4">
              {customPages.map(page => (
                <div 
                  key={page.id}
                  className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white truncate">{page.title}</h4>
                      <span className="text-[9px] font-mono bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                        PUBBLICATA
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs font-mono">
                      URL: <span className="text-[#D4AF37]">/pagina/{page.slug}</span>
                    </p>
                    <p className="text-zinc-400 text-xs truncate max-w-lg font-sans">{page.metaDescription}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPage(page);
                        setShowPageForm(true);
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg hover:text-[#D4AF37]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 bg-red-950/20 text-red-400 hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 7: GENERAL APP SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="backdrop-blur-md bg-white/5 border border-white/10 p-5 md:p-8 rounded-2xl space-y-6 animate-fadeIn" id="admin-tab-settings-panel">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Impostazioni dell'Applicazione</h2>
              <p className="text-zinc-500 text-xs">Gestisci i numeri di contatto, i testi del sito e le offerte attive in tempo reale.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              
              {/* WhatsApp & Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Numero WhatsApp di Contatto (Solo cifre)</label>
                <input 
                  type="text" 
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                />
                <p className="text-[9px] text-zinc-500 font-mono">Es. 393471234567 (includi 39 dell'Italia)</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">E-mail di Contatto</label>
                <input 
                  type="email" 
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Hero Title (Intestazione Principale)</label>
                <input 
                  type="text" 
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono font-bold text-white/50 uppercase tracking-widest block">Hero Subtitle (Descrizione Breve)</label>
                <textarea 
                  rows={2}
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl text-white"
                />
              </div>

              {/* Toggles & Offers */}
              <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Offerta Speciale nel Banner Superiore</h4>
                    <p className="text-zinc-500 text-3xs font-mono">Mostra/nascondi il banner giallo dell'offerta in testa al sito</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.showSpecialOffer}
                    onChange={(e) => setSettings({ ...settings, showSpecialOffer: e.target.checked })}
                    className="w-6 h-6 accent-[#D4AF37]"
                  />
                </div>

                {settings.showSpecialOffer && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-mono font-bold text-white/50 uppercase block">Testo dell'Offerta</label>
                    <input 
                      type="text"
                      value={settings.specialOfferText}
                      onChange={(e) => setSettings({ ...settings, specialOfferText: e.target.value })}
                      className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Lab Sandbox Toggle */}
              <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Lab Interattivo di Fotoritocco</h4>
                    <p className="text-zinc-500 text-3xs font-mono">Abilita o disabilita i controlli interattivi dell'esposizione, contrasto e saturazione nella Home</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.showBeforeAfterSandbox}
                    onChange={(e) => setSettings({ ...settings, showBeforeAfterSandbox: e.target.checked })}
                    className="w-6 h-6 accent-[#D4AF37]"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-[#D4AF37] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-[#c4a132] transition-all shadow-lg"
              id="admin-save-settings-btn"
            >
              Salva Impostazioni Generali
            </button>
          </form>
        )}

      </main>

      {/* --- IMAGE OVERLAY PREVIEW MODAL (TOUCH DISMISS) --- */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          id="admin-image-modal"
        >
          <div className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <X className="w-8 h-8" />
          </div>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative">
            <img src={previewImage} alt="Ingrandimento allegato" className="max-w-full max-h-[80vh] object-contain mx-auto" />
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-white/50 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-mono">
              Tocca un punto qualsiasi per chiudere
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
