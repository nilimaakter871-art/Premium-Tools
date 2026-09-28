import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to read store
function readStoreData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading store.json:', err);
  }
  return null;
}

// Helper to save store
function writeStoreData(data: any) {
  try {
    data.lastUpdated = new Date().toISOString();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error writing store.json:', err);
    return false;
  }
}

// API Routes
app.get('/api/data', (_req, res) => {
  const data = readStoreData();
  if (data) {
    return res.json({ success: true, data });
  }
  return res.status(404).json({ success: false, message: 'No data file found' });
});

app.post('/api/save', (req, res) => {
  try {
    const { apps, adSettings, siteSettings } = req.body;
    if (!apps || !Array.isArray(apps)) {
      return res.status(400).json({ success: false, message: 'Invalid apps data' });
    }

    const currentData = readStoreData() || {};
    const updatedData = {
      apps,
      adSettings: adSettings || currentData.adSettings,
      siteSettings: siteSettings || currentData.siteSettings,
      lastUpdated: new Date().toISOString(),
    };

    const saved = writeStoreData(updatedData);
    if (saved) {
      return res.json({
        success: true,
        message: 'Successfully saved and synced to codebase file (data/store.json)!',
        lastUpdated: updatedData.lastUpdated,
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to write to file system' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

app.post('/api/apps', (req, res) => {
  try {
    const { apps } = req.body;
    if (!Array.isArray(apps)) {
      return res.status(400).json({ success: false, message: 'Expected apps array' });
    }
    const current = readStoreData() || {};
    current.apps = apps;
    writeStoreData(current);
    return res.json({ success: true, count: apps.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.post('/api/ads', (req, res) => {
  try {
    const { adSettings } = req.body;
    const current = readStoreData() || {};
    current.adSettings = { ...current.adSettings, ...adSettings };
    writeStoreData(current);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.post('/api/site', (req, res) => {
  try {
    const { siteSettings } = req.body;
    const current = readStoreData() || {};
    current.siteSettings = { ...current.siteSettings, ...siteSettings };
    writeStoreData(current);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message });
  }
});

app.get('/api/backup', (_req, res) => {
  const data = readStoreData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="premium_store_backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
