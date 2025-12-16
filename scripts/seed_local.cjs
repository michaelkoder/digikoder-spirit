const db = require('../server/db_json.cjs');

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

const INITIAL_DATA = [
  { url: 'https://www.youtube.com/watch?v=Op_ZqRd9hYc', title: 'Fréquence 432 Hz - Guérison Profonde', category: 'musique', description: 'Musique pour aligner le cœur et l\'esprit. Solfeggio frequency.', type: 'video' },
  { url: 'https://www.youtube.com/watch?v=3M0hJ2qqqqI', title: 'Nettoyage Énergétique Guidé', category: 'meditation', description: 'Séance courte pour se libérer des énergies négatives de la journée.', type: 'video' },
  { url: '#', title: "La Loi de l'Attraction : Comprendre les bases", category: 'documentaire', description: "Notes sur le documentaire \"Le Secret\" et comment l'appliquer au quotidien.", type: 'article' },
  { url: 'https://www.facebook.com/share/v/15Lgk49KYX/?mibextid=KsPBc6', title: 'Facebook Video 1', category: 'meditation', description: 'FB video imported', type: 'video' }
];

function insert(item) {
  const keywords = extractKeywords((item.title || '') + ' ' + (item.description || ''));
  const platform = item.url.includes('youtube') || item.url.includes('youtu.be') ? 'youtube' : (item.url.includes('facebook') ? 'facebook' : 'other');
  const now = new Date().toISOString();
  const inserted = db.insertContent({ title: item.title, url: item.url, type: item.type || 'video', platform, category: item.category || 'outils', description: item.description || '', keywords, owner: null, created_at: now, updated_at: now });
  console.log('Inserted', inserted.id, item.title);
}

function run() {
  for (const it of INITIAL_DATA) insert(it);
  console.log('Seed complete');
  process.exit(0);
}

run();
