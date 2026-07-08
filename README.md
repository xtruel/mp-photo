# M.P. Photo

Sito premium per **M.P. Photo** — fotoritocco professionale online (auto, immobili, ritratti, paesaggi, prodotti).
React 19 + Vite + Tailwind CSS 4. Include un pannello di amministrazione responsive.

## 🌐 Anteprima live (GitHub Pages)

**https://xtruel.github.io/mp-photo/**

> In modalità GitHub Pages il sito gira **senza backend**: i dati provengono da `db.json`
> incluso nel bundle e le modifiche (preventivi, admin, statistiche) sono salvate nel
> browser (localStorage). È un'anteprima completamente navigabile.

### Pannello Admin
Icona ⚙️ in alto a destra → password: **`admin`** (oppure `mpphoto2026`).

---

## 🛠️ Sviluppo locale (con vero backend)

```bash
npm install
npm run dev        # http://localhost:3000  (server Express + db.json reale)
```

## 🚀 Ricostruire e ripubblicare su GitHub Pages

Build statica (Windows PowerShell):

```powershell
$env:VITE_STATIC='true'; $env:VITE_BASE='/mp-photo/'; npx vite build
```

Poi pubblica la cartella `dist/` sul branch `gh-pages` (vedi `deploy` più sotto o usa lo stesso metodo iniziale).

---

## Struttura
- `src/` — frontend React (Header, Hero, Services, Portfolio, Reviews, FAQ, QuoteForm, AdminPanel)
- `server.ts` — backend Express (solo sviluppo locale)
- `db.json` — dati del sito (seed anche per la modalità statica)
- `src/staticBackend.ts` — shim che replica le API su localStorage per GitHub Pages
