import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Send, Sparkles, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface QuoteFormProps {
  settings: AppSettings;
  onNavigate: (view: string) => void;
}

export default function QuoteForm({ settings, onNavigate }: QuoteFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('auto');
  const [description, setDescription] = useState('');
  
  // File state
  const [files, setFiles] = useState<{ name: string; size: string; dataUrl: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse file size for display
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Puoi caricare esclusivamente immagini.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFiles(prev => [
          ...prev,
          {
            name: file.name,
            size: formatBytes(file.size),
            dataUrl: e.target!.result as string
          }
        ]);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      for (let i = 0; i < e.target.files.length; i++) {
        processFile(e.target.files[i]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !description) {
      setErrorMsg('Inserisci nome, email e descrizione modifiche.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    // Simulate progress bar
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          service,
          description,
          files: files.map(f => f.dataUrl) // Send Base64 images directly
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setSubmitted(true);
          setUploading(false);
        }, 300);
      } else {
        setErrorMsg(result.error || 'Errore di connessione al server.');
        setUploading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Errore imprevisto durante l\'invio. Riprova più tardi.');
      setUploading(false);
    }
  };

  const handleWhatsAppInstant = () => {
    const text = encodeURIComponent(`Ciao M.P. Photo! Sono ${name}. Ho appena compilato il modulo preventivo per un fotoritocco ${service}. Ecco la descrizione: ${description}`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  if (submitted) {
    return (
      <div className="bg-black py-16 md:py-24 text-white min-h-screen flex items-center justify-center animate-fadeIn" id="quote-success-view">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-8 bg-zinc-950 p-8 md:p-12 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 animate-pulse" />
          
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
            <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans">Richiesta Ricevuta!</h1>
            <p className="text-zinc-400 font-sans text-sm md:text-base max-w-lg mx-auto">
              Grazie <span className="text-white font-semibold">{name}</span>, abbiamo registrato la tua richiesta di preventivo gratuito nel nostro database di lavorazione con ID temporaneo.
            </p>
          </div>

          {/* Value block explaining the response flow */}
          <div className="p-5 bg-zinc-900/60 rounded-2xl border border-zinc-900 text-left space-y-4 max-w-md mx-auto text-xs leading-relaxed">
            <p className="font-bold text-amber-500 uppercase tracking-widest font-mono text-[10px] text-center">Fasi della lavorazione:</p>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              <p className="text-zinc-300"><span className="font-bold text-white">Analisi Tecnica:</span> Un fotoritoccatore senior analizzerà lo stato cromatico delle foto inviate.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              <p className="text-zinc-300"><span className="font-bold text-white">Preventivo via Email:</span> Riceverai una mail con la nostra stima accurata del prezzo e dei tempi di consegna.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppInstant}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold rounded-full transition-all text-sm"
              id="success-whatsapp-cta"
            >
              <Phone className="w-4 h-4" />
              Sincronizza via WhatsApp
            </button>
            <button
              onClick={() => {
                setName('');
                setEmail('');
                setPhone('');
                setDescription('');
                setFiles([]);
                setSubmitted(false);
                onNavigate('home');
              }}
              className="px-8 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-full transition-all text-sm font-medium"
              id="success-back-home-btn"
            >
              Torna alla Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-black py-12 md:py-20 text-white min-h-screen" id="quote-view">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-2xs font-semibold uppercase font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Preventivo Gratuito in 1 Ora</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Richiedi un Preventivo</h1>
          <p className="text-zinc-400 text-sm font-sans leading-relaxed">
            Invia le tue foto e descrivi le modifiche desiderate. Riceverai un'analisi tecnica di fattibilità e un preventivo personalizzato senza alcun vincolo d'acquisto.
          </p>
        </div>

        {/* Error alerting */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-2 text-red-400 text-xs mb-6 max-w-2xl mx-auto font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form panel */}
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl max-w-3xl mx-auto relative overflow-hidden">
          {uploading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-bold text-sm">Caricamento delle tue foto in corso...</p>
                <p className="text-zinc-500 text-2xs font-mono">Progresso: {uploadProgress}%</p>
              </div>
              <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Personal Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Es. Mario Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  id="quote-name-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">E-mail di Contatto *</label>
                <input 
                  type="email" 
                  required
                  placeholder="mario.rossi@esempio.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  id="quote-email-input"
                />
              </div>
            </div>

            {/* Row 2: Phone & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Telefono o WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="+39 347 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  id="quote-phone-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Categoria Servizio *</label>
                <select 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none font-sans"
                  id="quote-service-select"
                >
                  <option value="auto">🚗 Auto & Motocicli</option>
                  <option value="immobili">🏡 Immobili & Interni</option>
                  <option value="ritratti">👤 Ritratti & Beauty</option>
                  <option value="paesaggi">🌄 Paesaggi & Fine Art</option>
                  <option value="prodotti">🛍️ Prodotti & E-commerce</option>
                  <option value="altro">✨ Altro (Restauro, Grafiche, ecc.)</option>
                </select>
              </div>
            </div>

            {/* File drag-and-drop uploader */}
            <div className="space-y-2">
              <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Carica le tue foto ({files.length} aggiunte)
              </label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${
                  dragActive 
                    ? 'border-amber-500 bg-amber-500/5 scale-[0.99]' 
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/10'
                }`}
                id="quote-drop-zone"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                  <Upload className="w-5 h-5" />
                </div>
                
                <div>
                  <p className="text-sm font-semibold">Trascina qui le tue foto o <span className="text-amber-500 underline">sfoglia i file</span></p>
                  <p className="text-3xs text-zinc-500 font-mono mt-1">Supporta JPEG, PNG, RAW, TIFF (Max 20MB per file)</p>
                </div>
              </div>
            </div>

            {/* Thumbnail Previews */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900">
                {files.map((file, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-square">
                    <img 
                      src={file.dataUrl} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Size overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] font-mono text-zinc-300 text-center truncate">
                      {file.name} ({file.size})
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 focus:outline-none"
                      title="Rimuovi"
                      id={`quote-file-remove-${idx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Description area */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-2xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">Descrizione Modifiche Richieste *</label>
                <span className="text-3xs text-zinc-600 font-mono">Consigliato inserire più dettagli</span>
              </div>
              <textarea 
                required
                rows={4}
                placeholder="Esempio: Vorrei rimuovere i riflessi sulla carrozzeria e ritoccare il cielo sullo sfondo rendendolo un tramonto caldo. Sulla targa dell'auto inserisci il logo 'MP Photo'..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                id="quote-description-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold text-sm tracking-widest uppercase rounded-xl shadow-lg hover:shadow-amber-500/15 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
              id="quote-submit-btn"
            >
              <Send className="w-4 h-4" />
              <span>Invia Richiesta di Preventivo</span>
            </button>
            
            <p className="text-3xs text-zinc-500 text-center font-sans">
              Cliccando su "Invia Richiesta", acconsenti al trattamento dei tuoi dati e all'archiviazione temporanea dei file ai fini di analisi tecnica in conformità con la Privacy Policy di M.P. Photo.
            </p>

          </form>
        </div>

      </div>
    </section>
  );
}
