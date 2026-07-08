import React, { useState } from 'react';
import { Camera, Menu, X, Phone, FileText, Settings, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  settings: AppSettings;
  isAdminLoggedIn: boolean;
  onAdminToggle: () => void;
}

export default function Header({
  currentView,
  onNavigate,
  settings,
  isAdminLoggedIn,
  onAdminToggle,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Servizi' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: 'Recensioni' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    
    // Smooth scroll for anchors
    if (viewId !== 'quote' && viewId !== 'admin') {
      const element = document.getElementById(viewId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWhatsAppClick = async () => {
    // Record WhatsApp Click
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsappClicks' })
      });
    } catch (e) {
      console.error(e);
    }
    
    const message = encodeURIComponent("Ciao M.P. Photo! Vorrei ricevere informazioni su un fotoritocco professionale.");
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/[0.06]">
      {settings.showSpecialOffer && (
        <div className="bg-gradient-to-r from-[#e6c675] via-[#d4af37] to-[#c8a24b] text-black text-[13px] font-semibold text-center py-2.5 px-4 select-none flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="tracking-tight">{settings.specialOfferText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
            id="header-logo"
          >
            <div className="p-2.5 bg-white/[0.06] border border-white/10 text-[#D4AF37] rounded-2xl group-hover:scale-105 transition-transform duration-300">
              <Camera className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="leading-none">
              <span className="text-lg md:text-xl font-semibold tracking-tight text-white">
                M.P.<span className="text-[#D4AF37]">Photo</span>
              </span>
              <p className="text-[10px] text-white/35 tracking-wide mt-1">Professional Retouching</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-9">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-[15px] font-medium transition-colors relative py-2 ${
                  currentView === item.id
                    ? 'text-white'
                    : 'text-white/55 hover:text-white'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
                {currentView === item.id && (
                  <span className="absolute -bottom-0.5 left-0 w-full h-[2px] rounded-full bg-[#D4AF37]" />
                )}
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/10 bg-white/[0.06] text-white hover:bg-white/10 transition-all duration-300 text-sm font-medium rounded-full"
              id="header-whatsapp-btn"
            >
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => handleNavClick('quote')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black hover:bg-[#e6c675] font-semibold rounded-full transition-all duration-300 text-sm shadow-[0_6px_20px_-6px_rgba(212,175,55,0.6)]"
              id="header-quote-btn"
            >
              <FileText className="w-4 h-4 stroke-[2]" />
              <span>Preventivo gratuito</span>
            </button>

            <button
              onClick={onAdminToggle}
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                isAdminLoggedIn
                  ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
              title="Pannello Admin"
              id="header-admin-btn"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button & Admin Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onAdminToggle}
              className={`p-2 rounded-full border ${
                isAdminLoggedIn 
                  ? 'border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5' 
                  : 'border-white/10 text-white/40'
              }`}
              id="header-mobile-admin-btn"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white focus:outline-none"
              id="header-mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden backdrop-blur-xl bg-black/90 border-b border-white/10 animate-fadeIn">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-medium tracking-[0.2em] uppercase ${
                  currentView === item.id
                    ? 'bg-white/5 text-[#D4AF37] border-l border-[#D4AF37] pl-3'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
                id={`mobile-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-4 border-t border-white/5 space-y-3 px-2">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 backdrop-blur-md bg-white/5 text-white rounded-xl text-xs font-mono uppercase tracking-wider"
                id="mobile-whatsapp-btn"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleNavClick('quote')}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl text-xs uppercase tracking-widest"
                id="mobile-quote-btn"
              >
                <FileText className="w-4 h-4" />
                <span>Preventivo Gratuito</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
