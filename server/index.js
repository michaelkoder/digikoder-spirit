const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server listening on port', PORT));
