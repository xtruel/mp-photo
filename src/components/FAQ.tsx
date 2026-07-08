import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      q: 'Come faccio ad inviare le mie foto per un preventivo?',
      a: 'È semplicissimo! Puoi usare il nostro modulo preventivi online per caricare direttamente i tuoi file, oppure inviarci le immagini tramite WhatsApp cliccando sul pulsante dedicato. Supportiamo tutti i formati (RAW, JPEG, PNG, TIFF, ecc.).'
    },
    {
      q: 'Quanto costa indicativamente il fotoritocco?',
      a: 'I prezzi partono da soli 8€ per foto (prodotti/e-commerce) fino a 20€ per foto di architettura/immobiliari di pregio. Il prezzo esatto dipende dalla complessità delle modifiche richieste e dal numero totale di foto. Riceverai un preventivo scritto dettagliato gratuito in meno di un\'ora.'
    },
    {
      q: 'Quali sono i tempi di consegna?',
      a: 'Il nostro tempo di consegna standard è di 24/48 ore. Per urgenze particolari, offriamo un servizio prioritario express che garantisce la consegna dei file completati in meno di 12 ore.'
    },
    {
      q: 'Garantite la privacy dei miei scatti personali?',
      a: 'Assolutamente sì. La riservatezza è un nostro valore cardine. Tutte le foto inviate per i preventivi o fotoritoccate vengono conservate sui nostri server protetti e non verranno MAI condivise, pubblicate o cedute a terzi senza il tuo esplicito consenso scritto.'
    },
    {
      q: 'Cosa succede se non sono soddisfatto del risultato?',
      a: 'La nostra politica è "Soddisfatti o Rimborsati". Effettuiamo revisioni illimitate finché lo scatto non rispecchia esattamente le tue aspettative. Nel caso limite in cui tu non sia comunque soddisfatto, sarai rimborsato integralmente.'
    },
    {
      q: 'Posso richiedere un fotoritocco di prova gratuito?',
      a: 'Sì! Per ordini voluminosi o collaborazioni continuative (con fotografi, agenzie o marchi di moda), offriamo un fotoritocco di prova completamente gratuito su un file campione a tua scelta, per farti toccare con mano la nostra qualità.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-zinc-950 py-20 relative overflow-hidden border-t border-zinc-900">
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">Domande frequenti</h2>
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans block">
            Dubbi? Risposte Immediate
          </span>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full" />
          <p className="text-zinc-400 font-sans text-sm max-w-xl mx-auto">
            Trova subito le risposte alle domande più comuni sul nostro servizio di fotoritocco professionale online.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-zinc-900/40 rounded-2xl border border-zinc-900 overflow-hidden transition-all duration-300 hover:border-zinc-800"
                id={`faq-item-${index}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between text-white focus:outline-none"
                  id={`faq-toggle-${index}`}
                >
                  <span className="font-bold font-sans text-sm md:text-base leading-snug pr-4">
                    {faq.q}
                  </span>
                  <span className="text-amber-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-zinc-400 font-sans text-xs md:text-sm border-t border-zinc-900 pt-4 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
