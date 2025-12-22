const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helpers to map DB rows to API shape
const mapRow = (r) => ({
  id: String(r.id),
  title: r.title,
  url: r.url,
  type: r.type,
  platform: r.platform,
  category: r.category,
  description: r.description,
  keywords: r.keywords ? JSON.parse(r.keywords) : [],
  addedBy: r.owner || 'unknown',
  date: r.created_at ? new Date(r.created_at).toLocaleDateString() : ''
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
};

// GET /api/contents
app.get('/api/contents', (req, res) => {
  const rows = db.prepare('SELECT * FROM contents ORDER BY created_at DESC').all();
  res.json(rows.map(mapRow));
});

// POST /api/contents
app.post('/api/contents', (req, res) => {
  const { title, url, type, platform, category, description, keywords, owner } = req.body;
  const now = new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO contents (title,url,type,platform,category,description,keywords,owner,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const info = stmt.run(title, url, type, platform, category, description || '', JSON.stringify(keywords || []), owner || null, now, now);
  const row = db.prepare('SELECT * FROM contents WHERE id = ?').get(info.lastInsertRowid);
  res.json(mapRow(row));
});

// PUT /api/contents/:id
app.put('/api/contents/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, url, type, platform, category, description, keywords } = req.body;
  const now = new Date().toISOString();
  db.prepare(`UPDATE contents SET title=?,url=?,type=?,platform=?,category=?,description=?,keywords=?,updated_at=? WHERE id = ?`).run(title, url, type, platform, category, description || '', JSON.stringify(keywords || []), now, id);
  const row = db.prepare('SELECT * FROM contents WHERE id = ?').get(id);
  res.json(mapRow(row));
});

// DELETE /api/contents/:id
app.delete('/api/contents/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM contents WHERE id = ?').run(id);
  res.json({ ok: true });
});

// GET /api/profiles?email=...
app.get('/api/profiles', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email required' });
  const row = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ email: row.email, role: row.role });
});

// GET /api/me - verify current user's token and return profile
app.get('/api/me', (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ email: decoded.sub || 'admin', role: decoded.role || 'admin' });
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
});

// POST /api/validate-url - check if a video URL is valid
app.post('/api/validate-url', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'URL required' });

    // Check if it's a YouTube URL and extract video ID
    let videoId = null;
    
    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');
      if (host === 'youtu.be') {
        videoId = u.pathname.slice(1);
      } else if (host.endsWith('youtube.com')) {
        videoId = u.searchParams.get('v');
      }
    } catch (e) {
      // Try regex fallback
      const match = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : null;
    }

    if (!videoId) {
      // Not a YouTube URL, consider it alive (we can't validate)
      console.log(`[validate-url] Not a YouTube URL: ${url} - assuming alive`);
      return res.json({ alive: true });
    }

    // Try multiple methods to check if video exists
    // Method 1: Check if the video page returns 200 or 404
    const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(videoPageUrl, { 
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      clearTimeout(timeoutId);
      
      // If we get 200, the video exists
      // If we get other statuses like 404 or redirect, it's deleted
      const alive = response.status === 200 && response.url.includes('watch?v=');
      console.log(`[validate-url] Video ${videoId}: ${alive ? 'ALIVE' : 'DEAD'} (page status: ${response.status}, url: ${response.url})`);
      return res.json({ alive });
    } catch (e) {
      // Network error - try backup method
      console.log(`[validate-url] Video ${videoId}: Page fetch error, trying oEmbed fallback`);
      
      // Method 2: Try oEmbed as fallback
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedController = new AbortController();
        const oembedTimeout = setTimeout(() => oembedController.abort(), 5000);
        
        const oembedRes = await fetch(oembedUrl, { signal: oembedController.signal });
        clearTimeout(oembedTimeout);
        
        const alive = oembedRes.status === 200;
        console.log(`[validate-url] Video ${videoId}: ${alive ? 'ALIVE' : 'DEAD'} (oEmbed status: ${oembedRes.status})`);
        return res.json({ alive });
      } catch (oembedErr) {
        // Both methods failed - consider it dead if we get a clear error, alive if network error
        console.log(`[validate-url] Video ${videoId}: Both methods failed - ${oembedErr.message}`);
        return res.json({ alive: false });
      }
    }
  } catch (e) {
    console.error('[validate-url] error:', e);
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server listening on port', PORT));
