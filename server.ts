import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CONTACTS, STANDORTE_INITIAL, ABTEILUNGEN_INITIAL } from './src/data/initialContacts.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const MASTER_FILE = path.join(DATA_DIR, 'master.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(INITIAL_CONTACTS, null, 2), 'utf-8');
    console.log('[Server DB] Initialized contacts.json with PDF default contacts.');
  }

  if (!fs.existsSync(MASTER_FILE)) {
    const initialMaster = {
      standorte: STANDORTE_INITIAL,
      abteilungen: ABTEILUNGEN_INITIAL
    };
    fs.writeFileSync(MASTER_FILE, JSON.stringify(initialMaster, null, 2), 'utf-8');
    console.log('[Server DB] Initialized master.json with default locations and departments.');
  }
}

ensureDataFiles();

// Self-cleaning routine on startup to remove duplicates from live storage
function cleanDuplicateContacts() {
  if (fs.existsSync(CONTACTS_FILE)) {
    try {
      const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
      const contacts = JSON.parse(raw);
      if (Array.isArray(contacts)) {
        const seen = new Set<string>();
        const uniqueContacts: any[] = [];
        let duplicatesCount = 0;
        
        for (const c of contacts) {
          const key = `${(c.vorname || '').toLowerCase().trim()}|${(c.nachname || '').toLowerCase().trim()}|${(c.standort || '').toLowerCase().trim()}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueContacts.push(c);
          } else {
            duplicatesCount++;
          }
        }
        
        if (duplicatesCount > 0) {
          fs.writeFileSync(CONTACTS_FILE, JSON.stringify(uniqueContacts, null, 2), 'utf-8');
          console.log(`[Server DB Cleanup] Removed ${duplicatesCount} duplicate contacts.`);
        }
      }
    } catch (err) {
      console.error('[Server DB Cleanup] Error during deduplication:', err);
    }
  }
}

cleanDuplicateContacts();

// Helper read/write
function readContacts() {
  try {
    ensureDataFiles();
    const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading contacts.json:', err);
    return INITIAL_CONTACTS;
  }
}

function writeContacts(data: any) {
  try {
    ensureDataFiles();
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing contacts.json:', err);
  }
}

function readMaster() {
  try {
    ensureDataFiles();
    const raw = fs.readFileSync(MASTER_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading master.json:', err);
    return { standorte: STANDORTE_INITIAL, abteilungen: ABTEILUNGEN_INITIAL };
  }
}

function writeMaster(data: any) {
  try {
    ensureDataFiles();
    fs.writeFileSync(MASTER_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing master.json:', err);
  }
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET all contacts
app.get('/api/contacts', (req, res) => {
  const contacts = readContacts();
  res.json(contacts);
});

function getGermanTimestamp(): string {
  const d = new Date();
  const dateStr = d.toLocaleDateString('de-DE');
  const timeStr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}

// POST save single contact (Create or Update)
app.post('/api/contacts', (req, res) => {
  const contactData = req.body;
  if (!contactData || !contactData.nachname || !contactData.vorname) {
    return res.status(400).json({ error: 'Nachname und Vorname sind erforderlich.' });
  }

  const contacts = readContacts();
  const timestamp = getGermanTimestamp();
  if (contactData.id) {
    // Update existing
    const index = contacts.findIndex((c: any) => c.id === contactData.id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...contactData, geandertAm: timestamp, updatedAt: new Date().toISOString() };
    } else {
      contacts.unshift({ ...contactData, geandertAm: timestamp, updatedAt: new Date().toISOString() });
    }
  } else {
    // Create new
    const newContact = {
      ...contactData,
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      geandertAm: timestamp,
      updatedAt: new Date().toISOString()
    };
    contacts.unshift(newContact);
  }

  writeContacts(contacts);
  res.json({ success: true, contacts });
});

// PUT full contacts array replace (Batch update)
app.put('/api/contacts', (req, res) => {
  const contactsList = req.body;
  if (!Array.isArray(contactsList)) {
    return res.status(400).json({ error: 'Array of contacts expected.' });
  }
  writeContacts(contactsList);
  res.json({ success: true, count: contactsList.length });
});

// DELETE single contact by ID
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  let contacts = readContacts();
  contacts = contacts.filter((c: any) => c.id !== id);
  writeContacts(contacts);
  res.json({ success: true, id });
});

// POST reset contacts to initial PDF contacts
app.post('/api/contacts/reset', (req, res) => {
  writeContacts(INITIAL_CONTACTS);
  res.json({ success: true, contacts: INITIAL_CONTACTS });
});

// GET master data
app.get('/api/master', (req, res) => {
  const master = readMaster();
  res.json(master);
});

// POST update master standorte
app.post('/api/master/standorte', (req, res) => {
  const { standorte } = req.body;
  if (!Array.isArray(standorte)) {
    return res.status(400).json({ error: 'Standorte Array erforderlich.' });
  }
  const master = readMaster();
  master.standorte = standorte.sort();
  writeMaster(master);
  res.json({ success: true, standorte: master.standorte });
});

// POST update master abteilungen
app.post('/api/master/abteilungen', (req, res) => {
  const { abteilungen } = req.body;
  if (!Array.isArray(abteilungen)) {
    return res.status(400).json({ error: 'Abteilungen Array erforderlich.' });
  }
  const master = readMaster();
  master.abteilungen = abteilungen.sort();
  writeMaster(master);
  res.json({ success: true, abteilungen: master.abteilungen });
});

// POST import contacts (replace or merge)
app.post('/api/import', (req, res) => {
  const { contacts: imported, mode } = req.body;
  if (!Array.isArray(imported)) {
    return res.status(400).json({ error: 'Ungültiges Import-Format.' });
  }

  let current = readContacts();
  if (mode === 'replace') {
    current = imported;
  } else {
    // merge without duplicating (match by ID or Name+Vorname+Standort)
    const existingIds = new Set(current.map((c: any) => c.id));
    const existingKeys = new Set(
      current.map((c: any) => `${(c.vorname || '').toLowerCase().trim()}|${(c.nachname || '').toLowerCase().trim()}|${(c.standort || '').toLowerCase().trim()}`)
    );
    const newItems = imported.filter((c: any) => {
      const key = `${(c.vorname || '').toLowerCase().trim()}|${(c.nachname || '').toLowerCase().trim()}|${(c.standort || '').toLowerCase().trim()}`;
      return !existingIds.has(c.id) && !existingKeys.has(key);
    });
    current = [...newItems, ...current];
  }

  writeContacts(current);
  res.json({ success: true, contacts: current });
});

// Vite Middleware for development vs Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite dev middleware attached.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Server] Serving production static files from dist/');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Telefonverzeichnis App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
