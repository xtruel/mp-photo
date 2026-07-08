import React, { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewsProps {
  reviews: ReviewItem[];
  onAddReview: (review: Omit<ReviewItem, 'id' | 'date'>) => Promise<void>;
}

export default function Reviews({ reviews, onAddReview }: ReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Statistics
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = reviews.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text) return;

    setSubmitting(true);
    try {
      await onAddReview({
        author,
        rating,
        text,
        source: 'direct'
      });
      setSubmitted(true);
      setTimeout(() => {
        setAuthor('');
        setRating(5);
        setText('');
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="bg-black py-20 relative overflow-hidden border-t border-zinc-900">
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">Dicono di noi</h2>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans block">
            Cosa Dicono i Nostri Clienti
          </span>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full" />
          <p className="text-zinc-400 font-sans text-sm md:text-base">
            La soddisfazione dei clienti è il nostro miglior portfolio. Recensioni certificate ed esperienze reali di fotografi e privati.
          </p>
        </div>

        {/* Google Business Overview Panel */}
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl mb-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Col 1: Google Score Card */}
            <div className="md:col-span-5 text-center md:text-left space-y-3 md:border-r md:border-zinc-900 md:pr-8">
              <div className="flex items-center justify-center md:justify-start gap-3">
                {/* Simulated Google Logo */}
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide font-sans">Google Business</h4>
                  <p className="text-2xs text-zinc-500 font-mono">Profilo Aziendale Verificato</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                <span className="text-5xl font-extrabold text-white tracking-tight">{averageRating}</span>
                <div className="text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Sulla base di <span className="font-bold text-white">{totalReviews} recensioni</span></p>
                </div>
              </div>
            </div>

            {/* Col 2: Star Distribution */}
            <div className="md:col-span-7 flex flex-col justify-center space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500 font-mono w-10">5 stelle</span>
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-zinc-400 font-mono w-6 text-right">92%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500 font-mono w-10">4 stelle</span>
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full" style={{ width: '8%' }}></div>
                </div>
                <span className="text-zinc-400 font-mono w-6 text-right">8%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <span className="w-10 font-mono">3 stelle</span>
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-800 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="w-6 text-right font-mono">0%</span>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-2xs text-zinc-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>100% delle recensioni provengono da clienti reali paganti.</span>
                </p>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-black hover:bg-amber-500 rounded-xl text-xs font-bold transition-all uppercase tracking-wider font-mono shrink-0"
                  id="reviews-write-toggle-btn"
                >
                  {showForm ? 'Annulla' : 'Lascia una Recensione'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Create Review Form Modal/Drawer */}
        {showForm && (
          <div className="bg-zinc-950 border border-amber-500/30 p-6 rounded-3xl max-w-2xl mx-auto mb-12 animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              La tua opinione conta
            </h3>
            
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-emerald-400 font-bold">Recensione Inviata con Successo!</h4>
                <p className="text-xs text-zinc-400">Grazie per aver condiviso la tua esperienza. Verrà visualizzata a breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs text-zinc-400 font-mono uppercase font-bold block">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Es. Marco Bianchi"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                      id="review-author-input"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-2xs text-zinc-400 font-mono uppercase font-bold block">Punteggio (Stelle)</label>
                    <div className="flex items-center gap-1.5 h-[46px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 focus:outline-none"
                          id={`review-star-select-${star}`}
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= rating 
                                ? 'fill-amber-500 text-amber-500' 
                                : 'text-zinc-600 hover:text-amber-500/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs text-zinc-400 font-mono uppercase font-bold block">Il tuo commento</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Racconta la tua esperienza con il nostro servizio di fotoritocco professionale..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                    id="review-text-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold rounded-xl text-sm hover:from-amber-400 hover:to-yellow-500 transition-colors disabled:opacity-50"
                  id="review-submit-btn"
                >
                  {submitting ? 'Invia in corso...' : 'Pubblica Recensione'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all duration-300"
              id={`review-card-${rev.id}`}
            >
              <div className="space-y-4">
                {/* Header author and star */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={rev.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.author)}&backgroundColor=f59e0b&textColor=000`} 
                      alt={rev.author} 
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide font-sans">{rev.author}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">{rev.date}</p>
                    </div>
                  </div>
                  
                  {rev.source === 'google' && (
                    <span className="p-1.5 bg-zinc-900 rounded-full" title="Recensione Google">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Owner Reply */}
              {rev.reply && (
                <div className="mt-4 p-3 bg-zinc-900/60 rounded-xl border border-zinc-900 text-2xs space-y-1">
                  <p className="font-bold text-amber-500 font-sans">Risposta del proprietario</p>
                  <p className="text-zinc-400 font-sans leading-relaxed italic">"{rev.reply}"</p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
