const fs = require('fs');
const path = require('path');
const db = require('../server/db_json.cjs');

const FILE = path.join(__dirname, '..', 'OUTILS MEDITATION .pdf');
if (!fs.existsSync(FILE)) {
  console.error('PDF not found:', FILE);
  process.exit(1);
}

const buf = fs.readFileSync(FILE);
let s = '';
for (let i = 0; i < buf.length; i++) {
  const ch = buf[i];
  if (ch >= 32 && ch <= 126) s += String.fromCharCode(ch);
  else s += ' ';
}
const re = /https?:\/\/[^\s\)\"'<>]+/gi;
const matches = Array.from(new Set((s.match(re) || []).map(m => m.trim())));

const STOPWORDS = new Set([ 'le','la','les','de','des','du','et','en','un','une','pour','avec','sur','dans','au','aux','par','se','ce','ces','que','qui','quoi','is','the','of','and','to','in','for','on' ]);
const extractKeywords = (text, maxKeywords = 6) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëïîôöùûüç'\-\s]/gi, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w && w.length > 2 && !STOPWORDS.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const sorted = Object.keys(freq).sort((a,b) => freq[b] - freq[a]);
  return sorted.slice(0, maxKeywords);
};

const getPlatform = (url) => {
  if (!url) return 'other';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  return 'other';
};

const getYoutubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const p = u.pathname.split('/').pop();
      return p;
    }
  } catch (e) {}
  const m = url.match(/(?:v=|\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
};

let inserted = 0;
for (const url of matches) {
  // normalize url (remove trailing punctuation)
  const clean = url.replace(/[.,;:]+$/, '');
  // skip non-video links (like chrome webstore) unless youtube/facebook/instagram
  const platform = getPlatform(clean);
  if (!['youtube','facebook','instagram'].includes(platform)) continue;

  // skip if url already exists
  const exists = db.getContentByUrl(clean);
  if (exists) continue;

  const title = platform === 'youtube' ? (`Imported: ${getYoutubeId(clean) || clean}`) : clean;
  const keywords = extractKeywords(title);
  const now = new Date().toISOString();
  const ins = db.insertContent({ title, url: clean, type: 'video', platform, category: 'meditation', description: '', keywords, owner: null, created_at: now, updated_at: now });
  if (ins && ins.id) inserted++;
}

console.log('Imported', inserted, 'links into local DB');
