import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DB_FILE = path.join(process.cwd(), "db.json");

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Errore durante la lettura del database:", err);
  }
  return {
    stats: { views: 0, quotes: 0, whatsappClicks: 0 },
    quotes: [],
    portfolio: [],
    services: [],
    reviews: [],
    customPages: [],
    settings: {
      heroTitle: "Dai nuova vita alle tue fotografie.",
      heroSubtitle: "Fotoritocco professionale per auto, immobili, ritratti, paesaggi e prodotti.",
      whatsappNumber: "393471234567",
      contactEmail: "info@mpphoto.it",
      showSpecialOffer: true,
      specialOfferText: "🔥 SCONTO 15% sul tuo primo ordine con preventivo online!",
      showBeforeAfterSandbox: true
    }
  };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Errore durante la scrittura del database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing limits (expanded to allow uploading Base64 images directly)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API: Get entire current DB state (highly efficient)
  app.get("/api/db-state", (req, res) => {
    try {
      const db = readDb();
      res.json(db);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Track events (views, whatsapp clicks)
  app.post("/api/stats/increment", (req, res) => {
    try {
      const { type } = req.body;
      const db = readDb();
      if (type === "views") {
        db.stats.views = (db.stats.views || 0) + 1;
      } else if (type === "whatsappClicks") {
        db.stats.whatsappClicks = (db.stats.whatsappClicks || 0) + 1;
      } else if (type === "quotes") {
        db.stats.quotes = (db.stats.quotes || 0) + 1;
      }
      writeDb(db);
      res.json({ success: true, stats: db.stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API: Request quote
  app.post("/api/quotes", (req, res) => {
    try {
      const { name, email, phone, service, description, files } = req.body;
      if (!name || !email || !description) {
        return res.status(400).json({ error: "Nome, email e descrizione sono obbligatori." });
      }

      const db = readDb();
      const newQuote = {
        id: "q-" + Date.now(),
        name,
        email,
        phone: phone || "",
        service: service || "altro",
        description,
        files: files || [],
        date: new Date().toISOString(),
        status: "Pending"
      };

      db.quotes.unshift(newQuote);
      db.stats.quotes = (db.stats.quotes || 0) + 1;
      writeDb(db);

      res.status(201).json({ success: true, quote: newQuote });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin Check / Auth (Simple & reliable for client state)
  app.post("/api/admin/auth", (req, res) => {
    const { password } = req.body;
    if (password === "admin" || password === "mpphoto2026") {
      res.json({ success: true, token: "mp-photo-secure-token-2026" });
    } else {
      res.status(401).json({ error: "Password errata. Usa 'admin'." });
    }
  });

  // API Admin: Update Quotes (change status, add internal notes)
  app.put("/api/admin/quotes/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status, internalNotes } = req.body;
      const db = readDb();
      const idx = db.quotes.findIndex((q: any) => q.id === id);
      if (idx !== -1) {
        if (status) db.quotes[idx].status = status;
        if (internalNotes !== undefined) db.quotes[idx].internalNotes = internalNotes;
        writeDb(db);
        return res.json({ success: true, quote: db.quotes[idx] });
      }
      res.status(404).json({ error: "Preventivo non trovato" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Delete Quote
  app.delete("/api/admin/quotes/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      const initialLength = db.quotes.length;
      db.quotes = db.quotes.filter((q: any) => q.id !== id);
      if (db.quotes.length < initialLength) {
        writeDb(db);
        return res.json({ success: true });
      }
      res.status(404).json({ error: "Preventivo non trovato" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Save Portfolio Item (create or edit)
  app.post("/api/admin/portfolio", (req, res) => {
    try {
      const item = req.body;
      const db = readDb();
      if (item.id) {
        // Edit existing
        const idx = db.portfolio.findIndex((p: any) => p.id === item.id);
        if (idx !== -1) {
          db.portfolio[idx] = { ...db.portfolio[idx], ...item };
        } else {
          return res.status(404).json({ error: "Elemento portfolio non trovato" });
        }
      } else {
        // Add new
        const newItem = {
          ...item,
          id: "p-" + Date.now()
        };
        db.portfolio.unshift(newItem);
      }
      writeDb(db);
      res.json({ success: true, portfolio: db.portfolio });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Delete Portfolio Item
  app.delete("/api/admin/portfolio/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      db.portfolio = db.portfolio.filter((p: any) => p.id !== id);
      writeDb(db);
      res.json({ success: true, portfolio: db.portfolio });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Save Service Item
  app.put("/api/admin/services/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updatedService = req.body;
      const db = readDb();
      const idx = db.services.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        db.services[idx] = { ...db.services[idx], ...updatedService };
        writeDb(db);
        return res.json({ success: true, services: db.services });
      }
      res.status(404).json({ error: "Servizio non trovato" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Save Review
  app.post("/api/admin/reviews", (req, res) => {
    try {
      const review = req.body;
      const db = readDb();
      if (review.id) {
        const idx = db.reviews.findIndex((r: any) => r.id === review.id);
        if (idx !== -1) {
          db.reviews[idx] = { ...db.reviews[idx], ...review };
        }
      } else {
        const newReview = {
          ...review,
          id: "r-" + Date.now(),
          date: review.date || new Date().toISOString().split("T")[0],
          source: review.source || "direct"
        };
        db.reviews.unshift(newReview);
      }
      writeDb(db);
      res.json({ success: true, reviews: db.reviews });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Delete Review
  app.delete("/api/admin/reviews/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      db.reviews = db.reviews.filter((r: any) => r.id !== id);
      writeDb(db);
      res.json({ success: true, reviews: db.reviews });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Save Settings
  app.put("/api/admin/settings", (req, res) => {
    try {
      const newSettings = req.body;
      const db = readDb();
      db.settings = { ...db.settings, ...newSettings };
      writeDb(db);
      res.json({ success: true, settings: db.settings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Save Custom Page (create or edit)
  app.post("/api/admin/custom-pages", (req, res) => {
    try {
      const page = req.body;
      const db = readDb();
      if (page.id) {
        const idx = db.customPages.findIndex((cp: any) => cp.id === page.id);
        if (idx !== -1) {
          db.customPages[idx] = { ...db.customPages[idx], ...page };
        }
      } else {
        const newPage = {
          ...page,
          id: "cp-" + Date.now(),
          createdAt: new Date().toISOString()
        };
        db.customPages.push(newPage);
      }
      writeDb(db);
      res.json({ success: true, customPages: db.customPages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Admin: Delete Custom Page
  app.delete("/api/admin/custom-pages/:id", (req, res) => {
    try {
      const { id } = req.params;
      const db = readDb();
      db.customPages = db.customPages.filter((cp: any) => cp.id !== id);
      writeDb(db);
      res.json({ success: true, customPages: db.customPages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware setup or production static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M.P. Photo Server] Server running on http://localhost:${PORT}`);
  });
}

startServer();
