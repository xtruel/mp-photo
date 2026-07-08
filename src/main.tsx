import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installStaticBackend} from './staticBackend.ts';
import './index.css';

// GitHub Pages / static hosting: no Express backend available, so serve
// every /api/* call from a localStorage-backed copy of db.json.
// Enabled only in the static build (VITE_STATIC=true); local `npm run dev`
// keeps using the real Express server.
if (import.meta.env.VITE_STATIC === 'true') {
  installStaticBackend();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
