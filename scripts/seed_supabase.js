/*
  scripts/seed_supabase.js
  Usage:
    - copy `.env.example` -> `.env.seed` and fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    - run: `node scripts/seed_supabase.js`

  This script uses the Supabase service role key to insert initial content
  and compute simple keywords. Do NOT commit the service role key to git.
*/

require('dotenv').config({ path: process.env.ENV_FILE || '.env.seed' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. See .env.example');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const STOPWORDS = new Set([ 'le','la','les','de','des','du','et','en','un','une','pour','avec','sur','dans','au','aux','par','se','ce','ces','que','qui','quoi','is','the','of','and','to','in','for','on' ]);

const extractKeywords = (text, maxKeywords = 6) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëïîôöùûüç'-\s]/gi, ' ')
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

// Minimal initial data - trimmed from index.tsx INITIAL_DATA
const INITIAL_DATA = [
  { url: 'https://www.youtube.com/watch?v=Op_ZqRd9hYc', title: 'Fréquence 432 Hz - Guérison Profonde', category: 'musique', description: 'Musique pour aligner le cœur et l\'esprit. Solfeggio frequency.', type: 'video' },
  { url: 'https://www.youtube.com/watch?v=3M0hJ2qqqqI', title: 'Nettoyage Énergétique Guidé', category: 'meditation', description: 'Séance courte pour se libérer des énergies négatives de la journée.', type: 'video' },
  { url: '#', title: "La Loi de l'Attraction : Comprendre les bases", category: 'documentaire', description: "Notes sur le documentaire \"Le Secret\" et comment l'appliquer au quotidien.", type: 'article' },
  { url: 'https://www.facebook.com/share/v/15Lgk49KYX/?mibextid=KsPBc6', title: 'Facebook Video 1', category: 'meditation', description: 'FB video imported', type: 'video' }
];

async function run() {
  try {
    console.log('Seeding Supabase contents table...');
    for (const it of INITIAL_DATA) {
      const platform = getPlatform(it.url);
      const keywords = extractKeywords((it.title || '') + ' ' + (it.description || ''));
      const payload = {
        title: it.title,
        url: it.url,
        type: it.type || (it.category === 'article' ? 'article' : 'video'),
        platform,
        category: it.category || 'outils',
        description: it.description || '',
        keywords: keywords,
        owner: null
      };

      const { data, error } = await supabase.from('contents').insert(payload).select().single();
      if (error) {
        console.error('Insert error for', it.title, error.message || error);
      } else {
        console.log('Inserted', data.id, it.title);
      }
    }
    console.log('Seed finished.');
    process.exit(0);
  } catch (e) {
    console.error('Unexpected error', e);
    process.exit(1);
  }
}

run();
