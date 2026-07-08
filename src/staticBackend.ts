/* =========================================================
   Static backend shim (GitHub Pages mode)
   ---------------------------------------------------------
   GitHub Pages can only serve static files, so the Express
   server in server.ts is not available there. When the app
   is built with VITE_STATIC=true, this module patches
   window.fetch to answer every /api/* request from a
   localStorage-backed copy of db.json — mirroring server.ts.

   The real dev backend (npm run dev) is untouched.
   ========================================================= */

import seedDb from '../db.json';

const STORAGE_KEY = 'mp_static_db_v1';

type AnyObj = Record<string, any>;

function readDb(): AnyObj {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  // First run (or reset): seed from the bundled db.json
  const fresh = JSON.parse(JSON.stringify(seedDb));
  writeDb(fresh);
  return fresh;
}

function writeDb(db: AnyObj): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / unavailable — keep going in-memory */
  }
}

function json(data: AnyObj, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): AnyObj {
  if (!init || !init.body) return {};
  try {
    return typeof init.body === 'string' ? JSON.parse(init.body) : {};
  } catch {
    return {};
  }
}

/** Route an /api/* request. Returns a Response, or null if unhandled. */
function handle(method: string, path: string, body: AnyObj): Response | null {
  const db = readDb();

  // GET /api/db-state
  if (method === 'GET' && path === '/api/db-state') {
    return json(db);
  }

  // POST /api/stats/increment
  if (method === 'POST' && path === '/api/stats/increment') {
    const { type, source } = body;
    if (type === 'views') db.stats.views = (db.stats.views || 0) + 1;
    else if (type === 'whatsappClicks') db.stats.whatsappClicks = (db.stats.whatsappClicks || 0) + 1;
    else if (type === 'quotes') db.stats.quotes = (db.stats.quotes || 0) + 1;
    else if (type === 'source') {
      if (!db.stats.sources) db.stats.sources = { google: 0, instagram: 0, facebook: 0, direct: 0, altro: 0 };
      const key = ['google', 'instagram', 'facebook', 'direct'].includes(source) ? source : 'altro';
      db.stats.sources[key] = (db.stats.sources[key] || 0) + 1;
    }
    writeDb(db);
    return json({ success: true, stats: db.stats });
  }

  // POST /api/quotes
  if (method === 'POST' && path === '/api/quotes') {
    const { name, email, phone, service, description, files } = body;
    if (!name || !email || !description) {
      return json({ error: 'Nome, email e descrizione sono obbligatori.' }, 400);
    }
    const newQuote = {
      id: 'q-' + Date.now(),
      name, email,
      phone: phone || '',
      service: service || 'altro',
      description,
      files: files || [],
      date: new Date().toISOString(),
      status: 'Pending',
    };
    db.quotes.unshift(newQuote);
    db.stats.quotes = (db.stats.quotes || 0) + 1;
    writeDb(db);
    return json({ success: true, quote: newQuote }, 201);
  }

  // POST /api/admin/auth
  if (method === 'POST' && path === '/api/admin/auth') {
    if (body.password === 'admin' || body.password === 'mpphoto2026') {
      return json({ success: true, token: 'mp-photo-secure-token-2026' });
    }
    return json({ error: "Password errata. Usa 'admin'." }, 401);
  }

  // PUT /api/admin/quotes/:id
  let m = path.match(/^\/api\/admin\/quotes\/(.+)$/);
  if (m && method === 'PUT') {
    const idx = db.quotes.findIndex((q: AnyObj) => q.id === m![1]);
    if (idx !== -1) {
      if (body.status) db.quotes[idx].status = body.status;
      if (body.internalNotes !== undefined) db.quotes[idx].internalNotes = body.internalNotes;
      writeDb(db);
      return json({ success: true, quote: db.quotes[idx] });
    }
    return json({ error: 'Preventivo non trovato' }, 404);
  }
  // DELETE /api/admin/quotes/:id
  if (m && method === 'DELETE') {
    db.quotes = db.quotes.filter((q: AnyObj) => q.id !== m![1]);
    writeDb(db);
    return json({ success: true });
  }

  // POST /api/admin/portfolio (create or edit)
  if (method === 'POST' && path === '/api/admin/portfolio') {
    if (body.id) {
      const idx = db.portfolio.findIndex((p: AnyObj) => p.id === body.id);
      if (idx !== -1) db.portfolio[idx] = { ...db.portfolio[idx], ...body };
    } else {
      db.portfolio.unshift({ ...body, id: 'p-' + Date.now() });
    }
    writeDb(db);
    return json({ success: true, portfolio: db.portfolio });
  }
  // DELETE /api/admin/portfolio/:id
  m = path.match(/^\/api\/admin\/portfolio\/(.+)$/);
  if (m && method === 'DELETE') {
    db.portfolio = db.portfolio.filter((p: AnyObj) => p.id !== m![1]);
    writeDb(db);
    return json({ success: true, portfolio: db.portfolio });
  }

  // PUT /api/admin/services/:id
  m = path.match(/^\/api\/admin\/services\/(.+)$/);
  if (m && method === 'PUT') {
    const idx = db.services.findIndex((s: AnyObj) => s.id === m![1]);
    if (idx !== -1) {
      db.services[idx] = { ...db.services[idx], ...body };
      writeDb(db);
      return json({ success: true, services: db.services });
    }
    return json({ error: 'Servizio non trovato' }, 404);
  }

  // POST /api/admin/reviews (create or edit)
  if (method === 'POST' && path === '/api/admin/reviews') {
    if (body.id) {
      const idx = db.reviews.findIndex((r: AnyObj) => r.id === body.id);
      if (idx !== -1) db.reviews[idx] = { ...db.reviews[idx], ...body };
    } else {
      db.reviews.unshift({
        ...body,
        id: 'r-' + Date.now(),
        date: body.date || new Date().toISOString().split('T')[0],
        source: body.source || 'direct',
      });
    }
    writeDb(db);
    return json({ success: true, reviews: db.reviews });
  }
  // DELETE /api/admin/reviews/:id
  m = path.match(/^\/api\/admin\/reviews\/(.+)$/);
  if (m && method === 'DELETE') {
    db.reviews = db.reviews.filter((r: AnyObj) => r.id !== m![1]);
    writeDb(db);
    return json({ success: true, reviews: db.reviews });
  }

  // PUT /api/admin/settings
  if (method === 'PUT' && path === '/api/admin/settings') {
    db.settings = { ...db.settings, ...body };
    writeDb(db);
    return json({ success: true, settings: db.settings });
  }

  // POST /api/admin/custom-pages (create or edit)
  if (method === 'POST' && path === '/api/admin/custom-pages') {
    if (body.id) {
      const idx = db.customPages.findIndex((cp: AnyObj) => cp.id === body.id);
      if (idx !== -1) db.customPages[idx] = { ...db.customPages[idx], ...body };
    } else {
      db.customPages.push({ ...body, id: 'cp-' + Date.now(), createdAt: new Date().toISOString() });
    }
    writeDb(db);
    return json({ success: true, customPages: db.customPages });
  }
  // DELETE /api/admin/custom-pages/:id
  m = path.match(/^\/api\/admin\/custom-pages\/(.+)$/);
  if (m && method === 'DELETE') {
    db.customPages = db.customPages.filter((cp: AnyObj) => cp.id !== m![1]);
    writeDb(db);
    return json({ success: true, customPages: db.customPages });
  }

  return null;
}

export function installStaticBackend(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = '';
    let method = (init?.method || 'GET').toUpperCase();

    if (typeof input === 'string') url = input;
    else if (input instanceof URL) url = input.pathname;
    else if (input instanceof Request) { url = input.url; method = (init?.method || input.method || 'GET').toUpperCase(); }

    // Normalise to a path (strip origin if present)
    let path = url;
    try {
      if (url.startsWith('http')) path = new URL(url).pathname;
    } catch { /* keep as-is */ }

    if (path.startsWith('/api/')) {
      const body =
        input instanceof Request && !init?.body
          ? await input.clone().json().catch(() => ({}))
          : parseBody(init);
      const res = handle(method, path, body);
      if (res) return res;
      return json({ error: 'Not found (static mode)' }, 404);
    }

    return originalFetch(input, init);
  };

  // Seed on install so the first render has data immediately.
  readDb();
}
