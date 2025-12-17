import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Play,
  BookOpen,
  Music,
  Video,
  Plus,
  Search,
  LogOut,
  Lock,
  Youtube,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Filter,
  ShieldCheck,
  Sparkles,
  Film,
  TrendingUp,
  Heart,
  Star,
  Headphones,
  Mic,
  Radio,
  Disc,
  Target,
  Zap,
  Award,
  Compass,
  Globe,
  Sun
} from 'lucide-react';
// Using local Express+SQLite API instead of Supabase

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Déclaration pour le Facebook SDK et Instagram
declare global {
  interface Window {
    FB: any;
    instgrm: any;
  }
}

// --- TYPES ---

type Category = 'musique' | 'meditation' | 'documentaire' | 'outils' | 'article';

interface ContentItem {
  id: string;
  type: 'video' | 'article';
  platform?: 'youtube' | 'facebook' | 'instagram' | 'other';
  title: string;
  url: string;
  category: Category;
  description?: string;
  addedBy: string;
  date: string;
  keywords?: string[];
}

interface User {
  email: string;
  isAuthenticated: boolean;
  role?: 'superadmin' | 'admin' | 'user';
  id?: string;
}

// --- MOCK DATA (Initial content based on the user's PDF) ---

const INITIAL_DATA: ContentItem[] = [
  {
    id: '1',
    type: 'video',
    platform: 'youtube',
    title: 'Fréquence 432 Hz - Guérison Profonde',
    url: 'https://www.youtube.com/watch?v=Op_ZqRd9hYc',
    category: 'musique',
    description: 'Musique pour aligner le cœur et l\'esprit. Solfeggio frequency.',
    addedBy: 'Admin',
    date: '2023-10-25'
  },
  {
    id: '2',
    type: 'video',
    platform: 'youtube',
    title: 'Nettoyage Énergétique Guidé',
    url: 'https://www.youtube.com/watch?v=3M0hJ2qqqqI', // Mock ID
    category: 'meditation',
    description: 'Séance courte pour se libérer des énergies négatives de la journée.',
    addedBy: 'Admin',
    date: '2023-10-26'
  },
  {
    id: '3',
    type: 'article',
    title: 'La Loi de l\'Attraction : Comprendre les bases',
    url: '#',
    category: 'documentaire',
    description: 'Notes sur le documentaire "Le Secret" et comment l\'appliquer au quotidien.',
    addedBy: 'Admin',
    date: '2023-10-27'
  },
  {
    id: '4',
    type: 'video',
    platform: 'youtube',
    title: 'Nikola Tesla - L\'énergie libre',
    url: 'https://www.youtube.com/watch?v=XYZ123',
    category: 'documentaire',
    description: 'Comprendre la vision de Tesla sur l\'univers et l\'énergie.',
    addedBy: 'Admin',
    date: '2023-10-28'
  },
  {
    id: '5',
    type: 'article',
    title: 'Liste des outils anti-pub',
    url: '#',
    category: 'outils',
    description: 'AdBlock, uBlock Origin... Les indispensables pour naviguer sereinement.',
    addedBy: 'Admin',
    date: '2023-10-28'
  },
  {
    id: '6',
    type: 'video',
    platform: 'youtube',
    title: 'Fréquences Schumann',
    url: 'https://www.youtube.com/watch?v=SchumannResonance',
    category: 'musique',
    description: 'Résonance de la Terre pour l\'ancrage.',
    addedBy: 'Admin',
    date: '2023-10-29'
  }
  ,
  // Vidéos Facebook ajoutées depuis le PDF fourni
  {
    id: 'fb1',
    type: 'video',
    platform: 'facebook',
    title: 'Facebook Video 1',
    url: 'https://www.facebook.com/share/v/15Lgk49KYX/?mibextid=KsPBc6',
    category: 'meditation',
    description: 'FB video imported from PDF',
    addedBy: 'Admin',
    date: '2025-12-15'
  },
  {
    id: 'fb2',
    type: 'video',
    platform: 'facebook',
    title: 'Facebook Video 2',
    url: 'https://www.facebook.com/share/v/wrxBFfFkCgt9Gkfw/',
    category: 'meditation',
    description: 'FB video imported from PDF',
    addedBy: 'Admin',
    date: '2025-12-15'
  },
  {
    id: 'fb3',
    type: 'video',
    platform: 'facebook',
    title: 'Facebook Reel 1',
    url: 'https://www.facebook.com/reel/403626525522785?fs=e&s=TIeQ9V',
    category: 'meditation',
    description: 'FB reel imported from PDF',
    addedBy: 'Admin',
    date: '2025-12-15'
  }
  ,
  // YouTube videos importés depuis le PDF (IDs valides)
  {
    id: 'yt-nO3QrOifFOQ',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: nO3QrOifFOQ',
    url: 'https://youtube.com/watch?v=nO3QrOifFOQ',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-MlB4lsE_h20',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: MlB4lsE_h20',
    url: 'https://www.youtube.com/watch?v=MlB4lsE_h20&t=6s',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-sYoqCJNPxv4',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: sYoqCJNPxv4',
    url: 'https://www.youtube.com/watch?v=sYoqCJNPxv4',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-MRJl40u1jTA',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: MRJl40u1jTA',
    url: 'https://www.youtube.com/watch?v=MRJl40u1jTA',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-ny6pCzZRnqs',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: ny6pCzZRnqs',
    url: 'https://www.youtube.com/watch?v=ny6pCzZRnqs',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-GhNbnKZcCBM',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: GhNbnKZcCBM',
    url: 'https://www.youtube.com/watch?v=GhNbnKZcCBM',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-2j0gSVXhzFY',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: 2j0gSVXhzFY',
    url: 'https://www.youtube.com/watch?v=2j0gSVXhzFY',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-wXmxxMe37FU',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: wXmxxMe37FU',
    url: 'https://www.youtube.com/watch?v=wXmxxMe37FU',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-TxkyFCeWAxs',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: TxkyFCeWAxs',
    url: 'https://www.youtube.com/watch?v=TxkyFCeWAxs',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-oicH3NnfIr8',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: oicH3NnfIr8',
    url: 'https://www.youtube.com/watch?v=oicH3NnfIr8',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-frH2DX6FZ2o',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: frH2DX6FZ2o',
    url: 'https://www.youtube.com/watch?v=frH2DX6FZ2o',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-wxZjss7OSg0',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: wxZjss7OSg0',
    url: 'https://www.youtube.com/watch?v=wxZjss7OSg0',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-Luf-gm6qilc',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: Luf-gm6qilc',
    url: 'https://www.youtube.com/watch?v=Luf-gm6qilc',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-D62IEBPjUrk',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: D62IEBPjUrk',
    url: 'https://www.youtube.com/watch?v=D62IEBPjUrk',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-ZgHGShn21QU',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: ZgHGShn21QU',
    url: 'https://www.youtube.com/watch?v=ZgHGShn21QU',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-d0c0JRmbWX8',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: d0c0JRmbWX8',
    url: 'https://www.youtube.com/watch?v=d0c0JRmbWX8',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-dM-LxU_mMfE',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: dM-LxU_mMfE',
    url: 'https://www.youtube.com/watch?v=dM-LxU_mMfE',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-sDpaevCDf04',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: sDpaevCDf04',
    url: 'https://www.youtube.com/watch?v=sDpaevCDf04',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-Xaf_wrbB1lQ',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: Xaf_wrbB1lQ',
    url: 'https://youtube.com/watch?v=Xaf_wrbB1lQ',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  },
  {
    id: 'yt-AV24S7vo_TQ',
    type: 'video',
    platform: 'youtube',
    title: 'Imported: AV24S7vo_TQ',
    url: 'https://www.youtube.com/watch?v=AV24S7vo_TQ',
    category: 'meditation',
    description: 'Importé depuis le PDF',
    addedBy: 'Import',
    date: '2025-12-15'
  }
];

// --- HELPER FUNCTIONS ---

const getYoutubeId = (url: string) => {
  try {
    // Use URL parsing where possible
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split(/[?&]/)[0];
      return id || null;
    }

    if (host.endsWith('youtube.com')) {
      // prefer v= query param
      const v = u.searchParams.get('v');
      if (v && v.length === 11) return v;
      // fallback to /embed/ID or other path-based IDs
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1] && parts[embedIndex + 1].length === 11) return parts[embedIndex + 1];
      // sometimes URLs contain the id as last segment
      const last = parts[parts.length - 1];
      if (last && last.length === 11) return last;
    }

    // Last resort: regex to capture common patterns
    const regExp = /(?:v=|\/v\/|embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    const m = url.match(regExp);
    return m && m[1].length === 11 ? m[1] : null;
  } catch (e) {
    // Not a valid URL string — try regex only
    const regExp = /(?:v=|\/v\/|embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    const m = url.match(regExp);
    return m && m[1].length === 11 ? m[1] : null;
  }
};

const getPlatform = (url: string): 'youtube' | 'facebook' | 'instagram' | 'other' => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  if (url.includes('instagram.com')) return 'instagram';
  return 'other';
};

const getFacebookVideoId = (url: string): string | null => {
  try {
    // Pour les reels: facebook.com/reel/403626525522785
    const reelMatch = url.match(/\/reel\/([0-9]+)/);
    if (reelMatch) return reelMatch[1];
    
    // Pour les vidéos partagées: facebook.com/share/v/15Lgk49KYX ou /share/v/wrxBFfFkCgt9Gkfw
    const shareMatch = url.match(/\/share\/v\/([a-zA-Z0-9]+)/);
    if (shareMatch) return shareMatch[1];
    
    // Pour les vidéos classiques: facebook.com/watch?v=123456
    const watchMatch = url.match(/[?&]v=([0-9]+)/);
    if (watchMatch) return watchMatch[1];
    
    return null;
  } catch (e) {
    return null;
  }
};

// Simple keyword extractor: remove stopwords, count frequency, return top N
const STOPWORDS = new Set([
  'le','la','les','de','des','du','et','en','un','une','pour','avec','sur','dans','au','aux','par','se','ce','ces','que','qui','quoi','dans','du','au','a','is','the','of','and','to','in','for','on'
]);

const extractKeywords = (text: string, maxKeywords = 6) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëïîôöùûüç'-\s]/gi, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w && w.length > 2 && !STOPWORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  return sorted.slice(0, maxKeywords);
};

// Best-effort URL alive check. Uses YouTube oEmbed for YouTube, backend validation for others.
const checkUrlAlive = async (url: string, timeoutMs = 5000): Promise<boolean> => {
  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  // For YouTube, use the official oEmbed API (very reliable)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const json = await res.json().catch(() => null);
        // If oEmbed returns data, video exists and is accessible
        if (json && json.title) return true;
      }
      // If oEmbed fails (404), video is deleted/private/unavailable
      if (res.status === 404 || res.status === 401 || res.status === 403) {
        return false;
      }
    } catch (e) {
      clearTimeout(id);
      // Network error - assume alive to prevent false negatives
      return true;
    }
  }

  // For other platforms, try noembed first
  const noembed = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(noembed, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json && (json.title || json.html)) return true;
    }
  } catch (e) {
    // fall through to backend validation
  } finally {
    clearTimeout(id);
  }

  // Fallback: use backend validation endpoint (avoids CORS and better error handling)
  const controller2 = new AbortController();
  const id2 = setTimeout(() => controller2.abort(), timeoutMs);
  try {
    const res2 = await fetch(`${API_BASE}/api/validate-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller2.signal
    });
    clearTimeout(id2);
    if (res2 && res2.ok) {
      const data = await res2.json();
      // alive can be: true (alive), false (dead), null (unknown/timeout)
      // If null or undefined, assume alive to avoid false negatives
      return data.alive !== false;
    }
  } catch (e) {
    // Network error - assume alive to prevent false negatives
  } finally {
    clearTimeout(id2);
  }

  // Default to true (assume alive) to minimize false negatives
  return true;
};

// --- COMPONENTS ---

const Header = ({ user, onLogout, activeFilter, onFilterChange, onOpenAdd, onOpenAdmin, onOpenUsers, onOpenSettings, onOpenCategories, searchQuery, onSearchChange }: any) => {
  const [categories, setCategories] = useState<{id: Category | 'all', label: string, icon: any}[]>([
    { id: 'all', label: 'Tout', icon: Filter }
  ]);

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  // Icon mapping
  const iconMap: Record<string, any> = {
    Music, Play, Sparkles, Film, TrendingUp, Heart, Star, BookOpen,
    Headphones, Mic, Radio, Disc, Target, Zap, Award, Compass, Globe, Sun, Video, ShieldCheck, Filter
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          const mappedCategories = data.map((cat: any) => ({
            id: cat.id,
            label: cat.label,
            icon: iconMap[cat.icon] || Filter
          }));
          setCategories([
            { id: 'all', label: 'Tout', icon: Filter },
            ...mappedCategories
          ]);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    };
    loadCategories();
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-amber-300 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 font-serif">
              DIGIKODER <span className="text-amber-300">SPIRIT</span>
            </h1>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {user.isAuthenticated ? (
              <>
                {user.role === 'superadmin' && (
                  <>
                    <button
                      onClick={onOpenUsers}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      👥 Utilisateurs
                    </button>
                    <button
                      onClick={onOpenCategories}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      📂 Catégories
                    </button>
                    <button
                      onClick={onOpenSettings}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      ⚙️ Paramètres
                    </button>
                    <button
                      onClick={onOpenAdd}
                      className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-2 text-sm"
                    >
                      <Plus size={18} /> Partager
                    </button>
                    <span className="text-xs text-purple-200 px-2 py-1 rounded border border-purple-300">👑 SUPER ADMIN</span>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={onOpenAdd}
                      className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-2 text-sm"
                    >
                      <Plus size={18} /> Partager
                    </button>
                    <span className="text-xs text-amber-200 px-2 py-1 rounded border border-amber-300">ADMIN</span>
                  </>
                )}
                {user.role === 'user' && (
                  <button onClick={onOpenAdmin} className="text-xs bg-white/5 text-gray-200 px-3 py-1 rounded">Se connecter</button>
                )}
                <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400">Mode invité</span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input value={searchQuery || ''} onChange={(e) => onSearchChange(e.target.value)} placeholder="Rechercher par titre, description ou mot-clé..." className="w-full max-w-xl bg-black/10 border border-white/10 rounded px-3 py-2 text-sm text-white" />
        </div>

        {/* Filters Scrollable Area */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${
                activeFilter === cat.id 
                  ? 'bg-purple-600/50 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

const VideoEmbed = ({ url, platform, title, thumbnail }: { url: string, platform: string, title: string, thumbnail?: string }) => {
  // Always render a visual thumbnail/card in the mosaic. Playback happens in modal only.
  const videoId = platform === 'youtube' ? getYoutubeId(url) : null;
  const defaultThumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  // Use provided thumbnail (for Instagram/Facebook) or default YouTube thumbnail
  const finalThumbnail = thumbnail || defaultThumbnail;

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="relative rounded-lg overflow-hidden group bg-black/20">
      {finalThumbnail && !imageError ? (
        <div className="relative">
          <img
            src={finalThumbnail}
            alt={title}
            className="w-full h-auto block object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border border-white/10">
              <Play className="text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-black text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            {platform === 'facebook' ? <Facebook className="text-blue-400" /> : platform === 'instagram' ? <Instagram className="text-pink-400" /> : <LinkIcon className="text-blue-400" />}
          </div>
          <div className="text-sm text-gray-300 mb-2">{platform === 'facebook' ? 'Lire sur Facebook' : platform === 'instagram' ? 'Lire sur Instagram' : 'Ouvrir'}</div>
          <div className="text-xs text-gray-400">{title}</div>
        </div>
      )}
    </div>
  );
};

const ContentCard: React.FC<{ item: ContentItem, user?: User, onOpenVideo?: (u: string, p: string, t?: string) => void, onOpenNote?: (item: ContentItem) => void, onEdit?: (item: ContentItem) => void, onDelete?: (id: string) => void, thumbnail?: string, getCategoryLabel?: (id: string) => string }> = ({ item, user, onOpenVideo, onOpenNote, onEdit, onDelete, thumbnail, getCategoryLabel }) => {
  // Color palette for categories
  const colorPalette = [
    { border: 'border-red-500/50', text: 'text-red-300', bg: 'bg-red-500/10' },
    { border: 'border-orange-500/50', text: 'text-orange-300', bg: 'bg-orange-500/10' },
    { border: 'border-yellow-500/50', text: 'text-yellow-300', bg: 'bg-yellow-500/10' },
    { border: 'border-green-500/50', text: 'text-green-300', bg: 'bg-green-500/10' },
    { border: 'border-cyan-500/50', text: 'text-cyan-300', bg: 'bg-cyan-500/10' },
    { border: 'border-blue-500/50', text: 'text-blue-300', bg: 'bg-blue-500/10' },
    { border: 'border-purple-500/50', text: 'text-purple-300', bg: 'bg-purple-500/10' },
    { border: 'border-pink-500/50', text: 'text-pink-300', bg: 'bg-pink-500/10' },
    { border: 'border-teal-500/50', text: 'text-teal-300', bg: 'bg-teal-500/10' },
    { border: 'border-indigo-500/50', text: 'text-indigo-300', bg: 'bg-indigo-500/10' },
    { border: 'border-rose-500/50', text: 'text-rose-300', bg: 'bg-rose-500/10' },
    { border: 'border-amber-500/50', text: 'text-amber-300', bg: 'bg-amber-500/10' },
  ];

  // Generate stable hash for category ID to determine color
  const getCategoryColor = (categoryId: string) => {
    let hash = 0;
    for (let i = 0; i < categoryId.length; i++) {
      const char = categoryId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
  };

  const categoryColor = getCategoryColor(item.category);
  const isVideo = item.type === 'video';

  // Permissions: superadmin peut tout éditer, admin peut éditer seulement son propre contenu
  const canEdit = user?.role === 'superadmin' || (user?.role === 'admin' && item.addedBy === user.email);

  // Pour Instagram, ouvrir directement dans un nouvel onglet (pas de modal)
  const handleCardClick = () => {
    if (item.platform === 'instagram' && isVideo) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (isVideo) {
      onOpenVideo?.(item.url, item.platform || 'other', item.title);
    } else {
      onOpenNote?.(item);
    }
  };

  return (
    <div onClick={handleCardClick} className="break-inside-avoid mb-6 glass-panel rounded-xl overflow-hidden hover:translate-y-[-2px] transition-transform duration-300 group cursor-pointer">
      {/* Media Area */}
      {isVideo ? (
        <div className="p-2 pb-0">
            <VideoEmbed url={item.url} platform={item.platform || 'other'} title={item.title} thumbnail={thumbnail} onOpen={onOpenVideo} />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-amber-400/20 rounded-full blur-xl"></div>
             <BookOpen className="text-amber-200 mb-2 relative z-10" />
             <div className="text-xs text-amber-200/80 uppercase tracking-widest relative z-10">Lecture</div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
           <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColor.border} ${categoryColor.text} ${categoryColor.bg}`}>
             {getCategoryLabel ? getCategoryLabel(item.category) : item.category}
           </span>
           <div className="flex gap-2">
                  {item.platform === 'youtube' && <Youtube size={14} className="text-red-400" />}
                  {item.platform === 'facebook' && <Facebook size={14} className="text-blue-400" />}
                  {item.platform === 'instagram' && <Instagram size={14} className="text-pink-400" />}
                  {canEdit && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-200">Modifier</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white">Suppr</button>
                    </>
                  )}
           </div>
        </div>
        
        <h3 className="font-serif font-bold text-lg leading-tight mb-2 text-gray-100 group-hover:text-amber-200 transition-colors">
          {item.title}
        </h3>
        
        {item.description && (
          <p className="text-sm text-gray-400 line-clamp-3 mb-3 font-light">
            {item.description}
          </p>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-white/5">
           <span className="text-xs text-gray-500">Ajouté par {item.addedBy}</span>
           <span className="text-xs text-gray-600">{item.date}</span>
        </div>
      </div>
    </div>
  );
};

const MasonryGrid = ({ items, user, onOpenVideo, onOpenNote, onEdit, onDelete, thumbnailMap, categories }: { items: ContentItem[], user?: User, onOpenVideo?: (u: string, p: string, t?: string) => void, onOpenNote?: (item: ContentItem) => void, onEdit?: (item: ContentItem) => void, onDelete?: (id: string) => void, thumbnailMap?: Record<string, string>, categories?: Array<{id: string, label: string, icon: string}> }) => {
  // Simple CSS Column masonry implementation
  // We use columns-1 for mobile, columns-2 for tablet, columns-3/4 for desktop

  // Helper function to get category label by ID
  const getCategoryLabel = (categoryId: string): string => {
    const cat = categories?.find(c => c.id === categoryId);
    return cat?.label || categoryId; // Fallback to ID if not found
  };

  if (items.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search size={24} />
              </div>
              <p>Aucun contenu trouvé dans cette catégorie.</p>
          </div>
      )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {items.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          user={user}
          onOpenVideo={onOpenVideo}
          onOpenNote={onOpenNote}
          onEdit={onEdit}
          onDelete={onDelete}
          thumbnail={thumbnailMap?.[item.id]}
          getCategoryLabel={getCategoryLabel}
        />
      ))}
    </div>
  );
};

const AuthScreen = ({ onLogin }: { onLogin: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Merci d\'entrer un email valide');
            return;
        }
        onLogin(email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2994&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            
            <div className="glass-panel p-8 rounded-2xl max-w-md w-full relative z-10 border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-amber-300 flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto mb-4">
                        <span className="text-white text-3xl font-bold font-serif">D</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Digikoder Spirit</h1>
                    <p className="text-gray-400 font-light">Partage de sagesse & vibrations</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400 transition-colors"
                            placeholder="votre@email.com"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        Entrer dans le cercle
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        Accès libre sur inscription simple. <br/>Vos données restent locales.
                    </p>
                </form>
            </div>
        </div>
    );
};

const AddContentModal = ({ isOpen, onClose, onAdd, contentType }: any) => {
  const [formData, setFormData] = useState({
      url: '',
      title: '',
      category: 'musique',
      description: '',
      captcha: ''
  });

  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, label: string, icon: string}>>([]);

  // Simple captcha
  const [captchaNum] = useState({ a: Math.floor(Math.random()*10), b: Math.floor(Math.random()*10) });

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  // Load categories when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/api/categories`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setCategories(data);
          if (data.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: data[0].id }));
          }
        })
        .catch(() => setCategories([]));
    }
  }, [isOpen]);

  const isVideo = contentType === 'video';
  const isNote = contentType === 'note';

  // Reset hasAutoFetched when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasAutoFetched(false);
      setFormData({
        url: '',
        title: '',
        category: 'musique',
        description: '',
        captcha: ''
      });
    }
  }, [isOpen]);

  // Debounced URL change handler - only fetch once per URL
  React.useEffect(() => {
    if (!isOpen || !isVideo || !formData.url || hasAutoFetched) return;

    const timer = setTimeout(() => {
      // Only fetch for video URLs (YouTube, Facebook, Instagram)
      const isVideoUrl = formData.url.includes('youtube.com') || formData.url.includes('youtu.be') ||
                         formData.url.includes('facebook.com') || formData.url.includes('fb.watch') ||
                         formData.url.includes('instagram.com');

      if (!isVideoUrl || formData.url.length < 10) return;

      setIsFetchingMetadata(true);
      setMetadataError(null);

      fetch(`${API_BASE}/api/fetch-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url })
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Impossible de récupérer les infos');
          }
        })
        .then(data => {
          if (data.title) {
            setFormData(prev => ({ ...prev, title: data.title }));
            setHasAutoFetched(true);
          } else {
            setMetadataError('Titre non trouvé - veuillez le saisir manuellement');
            setHasAutoFetched(true);
          }
        })
        .catch(e => {
          console.error('Fetch metadata error:', e);
          setMetadataError('Erreur réseau - veuillez saisir le titre manuellement');
          setHasAutoFetched(true);
        })
        .finally(() => {
          setIsFetchingMetadata(false);
        });
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.url, isVideo, isOpen, hasAutoFetched, API_BASE]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (parseInt(formData.captcha) !== captchaNum.a + captchaNum.b) {
          alert('Calcul incorrect (sécurité anti-robot)');
          return;
      }
      onAdd({
          url: isNote ? '#' : formData.url,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          type: isNote ? 'article' : 'video'
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="glass-panel w-full max-w-lg rounded-xl p-6 relative z-10 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white font-serif">
                    {isVideo && '🎬 Ajouter une vidéo'}
                    {isNote && '📝 Ajouter une note'}
                    {!isVideo && !isNote && 'Partager une pépite'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {isVideo && (
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Lien vidéo (YouTube, Facebook, Instagram...)</label>
                        <input 
                            required
                            type="url"
                            value={formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-red-400 focus:outline-none"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                )}
                
                {isNote && (
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Lien (optionnel)</label>
                        <input 
                            type="url"
                            value={formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-blue-400 focus:outline-none"
                            placeholder="https://... (facultatif)"
                        />
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                         <label className="block text-xs text-gray-400 mb-1">
                           Titre
                           {isFetchingMetadata && (
                             <span className="ml-2 text-amber-400 animate-pulse">⏳ Récupération...</span>
                           )}
                         </label>
                         <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none"
                            placeholder={isFetchingMetadata ? "Chargement du titre..." : "Titre de la vidéo"}
                            disabled={isFetchingMetadata}
                        />
                        {metadataError && (
                          <p className="text-xs text-orange-400 mt-1">💡 {metadataError}</p>
                        )}
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">Catégorie</label>
                         <select 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none appearance-none"
                        >
                            {categories.length > 0 ? (
                              categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))
                            ) : (
                              <option value="musique">Musique / Fréquences</option>
                            )}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">Description / Note personnelle</label>
                    <textarea 
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none"
                        placeholder="Pourquoi ce contenu est intéressant..."
                    />
                </div>

                <div className="bg-amber-400/10 border border-amber-400/30 rounded p-3 flex items-center justify-between">
                    <span className="text-amber-200 text-sm flex items-center gap-2">
                        <ShieldCheck size={16} /> Anti-Robot: {captchaNum.a} + {captchaNum.b} = ?
                    </span>
                    <input 
                        required
                        type="number"
                        className="w-16 bg-black/40 border border-white/10 rounded p-1 text-center text-white"
                        value={formData.captcha}
                        onChange={e => setFormData({...formData, captcha: e.target.value})}
                    />
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                    Ajouter à la Vidéo
                </button>
            </form>
        </div>
    </div>
  );
};

const VideoModal = ({ isOpen, onClose, url, platform, title }: { isOpen: boolean, onClose: () => void, url?: string, platform?: string, title?: string }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  const [fbEmbed, setFbEmbed] = useState<{ href?: string, endpoint?: 'post'|'video' } | null>(null);
  const [fbEndpointOverride, setFbEndpointOverride] = useState<'post'|'video'|null>(null);
  const [fbRetryDone, setFbRetryDone] = useState(false);
  const [fbHostAlt, setFbHostAlt] = useState(false); // essai avec m.facebook.com

  const buildSrc = (): string => {
    try {
      if (platform === 'facebook') {
        const host = fbHostAlt ? 'https://m.facebook.com' : 'https://www.facebook.com';
        if (fbEmbed?.href) {
          const ep = fbEndpointOverride || fbEmbed.endpoint || 'video';
          const built = `${host}/plugins/${ep}.php?href=${encodeURIComponent(fbEmbed.href)}&show_text=false&width=1200&height=600&adapt_container_width=true&allowfullscreen=true`;
          return built;
        }
        // en attendant la résolution, tenter un premier essai simple
        const u = new URL(url);
        const clean = `${u.origin}${u.pathname}`;
        const isPostLike = /\/(reel|posts)\//.test(u.pathname);
        const endpoint = isPostLike ? 'post' : 'video';
        const built = `${host}/plugins/${endpoint}.php?href=${encodeURIComponent(clean)}&show_text=false&width=1200&height=600&adapt_container_width=true&allowfullscreen=true`;
        return built;
      } else if (platform === 'instagram') {
        // Instagram embed: clean URL (strip query), ensure trailing slash, then /embed/
        const u = new URL(url);
        const cleanPath = u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`;
        return `https://www.instagram.com${cleanPath}embed/`;
      } else if (platform === 'youtube') {
        const id = getYoutubeId(url || '');
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
    } catch (e) {
      // fallback
    }
    return url || '';
  };

  const src = buildSrc();

  // Résoudre l'URL Facebook côté serveur pour obtenir un href canonique
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (platform === 'facebook' && url) {
          const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';
          const r = await fetch(`${API_BASE}/api/fb/embed?url=${encodeURIComponent(url)}`);
          if (r.ok) {
            const j = await r.json();
            if (!cancelled && j && j.embedHref) {
              setFbEmbed({ href: j.embedHref, endpoint: j.endpoint === 'post' ? 'post' : 'video' });
              setFbEndpointOverride(null);
              setFbRetryDone(false);
              setFbHostAlt(false); // reset host fallback on new resolve
              setReloadKey(k => k + 1);
            }
          }
        }
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [platform, url]);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeFailed(false);
    const timeout = platform === 'facebook' ? 8000 : 5000; // Plus de temps pour Facebook
    const t = setTimeout(() => {
      if (!iframeLoaded) {
        if (platform === 'facebook' && !fbRetryDone) {
          setFbRetryDone(true);
          setFbEndpointOverride(prev => (prev === 'post' ? 'video' : prev === 'video' ? 'post' : (fbEmbed?.endpoint === 'post' ? 'video' : 'post')));
          setReloadKey(k => k + 1);
          return;
        } else if (platform === 'facebook' && fbRetryDone && !fbHostAlt) {
          // deuxième tentative: changer d'hôte vers m.facebook.com
          setFbHostAlt(true);
          setFbEndpointOverride(null); // revenir à l'endpoint suggéré
          setReloadKey(k => k + 1);
          return;
        }
        setIframeFailed(true);
      }
    }, timeout);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reloadKey, platform, fbEmbed, fbRetryDone]);

  useEffect(() => {
    let cancelled = false;
    const loadThumb = async () => {
      if (!url) return;
      if (platform === 'youtube') {
        const id = getYoutubeId(url);
        if (id) setThumbnail(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        return;
      }
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (json && json.thumbnail_url) setThumbnail(json.thumbnail_url);
      } catch (e) {
        // ignore
      }
    };
    loadThumb();
    return () => { cancelled = true; };
  }, [url, platform]);

  // Load better thumbnails when modal opens (YouTube and Facebook only)
  useEffect(() => {
    let cancelled = false;

    const loadBetterThumbnail = async () => {
      if (!url || !isOpen) return;

      // YouTube - use high quality thumbnail directly
      if (platform === 'youtube') {
        const id = getYoutubeId(url);
        if (id) {
          // Try maxresdefault first (best quality)
          const maxresUrl = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
          const img = new Image();
          img.onload = () => {
            if (!cancelled && img.naturalWidth > 120) {
              setThumbnail(maxresUrl);
            } else {
              setThumbnail(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
            }
          };
          img.onerror = () => {
            if (!cancelled) setThumbnail(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
          };
          img.src = maxresUrl;
        }
        return;
      }

      // For Facebook, fetch from backend
      if (platform === 'facebook') {
        try {
          const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';
          const res = await fetch(`${API_BASE}/api/fetch-title`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });

          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              if (data.thumbnail) setThumbnail(data.thumbnail);
            }
          }
        } catch (e) {
          console.error('Error loading thumbnail:', e);
        }
      }
    };

    loadBetterThumbnail();

    return () => { cancelled = true; };
  }, [platform, url, isOpen]);



  // Retirer le second timeout générique pour éviter les conflits avec la logique de retry Facebook

  const handleRetry = () => {
    setIframeFailed(false);
    setReloadKey(k => k + 1);
  };

  if (!isOpen || !url) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div 
        className="relative bg-black/90 rounded-xl overflow-hidden border border-white/20 shadow-2xl z-10 w-full max-w-6xl"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-center p-3 border-b border-white/10 bg-black/60">
          <div className="text-sm text-gray-200 truncate flex-1">{title || 'Lecture'}</div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {platform === 'facebook' && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white whitespace-nowrap">
                Ouvrir sur Facebook
              </a>
            )}
            <button onClick={onClose} className="text-gray-300 hover:text-white px-3 flex-shrink-0">✕</button>
          </div>
        </div>

        <div className="relative bg-black w-full" style={{ paddingTop: '56.25%' }}>
          {!iframeFailed ? (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black overflow-auto">
              <iframe
                  key={reloadKey}
                  onLoad={() => { setIframeLoaded(true); }}
                  className="w-full h-full"
                  src={src}
                  title={title}
                  allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; fullscreen; web-share"
                  sandbox={platform === 'facebook' ? 'allow-scripts allow-same-origin allow-popups allow-forms allow-storage-access-by-user-activation' : undefined}
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="max-w-full text-center">
                {thumbnail ? (
                  <img src={thumbnail} alt={title} className="mx-auto mb-4 max-h-[60vh] object-contain" />
                ) : (
                  <div className="w-40 h-40 mx-auto mb-4 bg-white/5 flex items-center justify-center">
                    <Play className="text-white" />
                  </div>
                )}
                <div className="mb-3 text-gray-300">Le lecteur n'a pas pu se charger. Vous pouvez ouvrir la vidéo sur la plateforme d'origine.</div>
                <div className="flex items-center justify-center gap-3">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-white">Ouvrir la vidéo</a>
                  <button onClick={handleRetry} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-white">Réessayer</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {platform === 'facebook' && (
          <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-white/5">
            Astuce: si Facebook affiche « publication non disponible », activez les cookies tiers pour facebook.com (ou essayez un autre navigateur). Vous pouvez aussi cliquer « Ouvrir sur Facebook ».
          </div>
        )}
      </div>
    </div>
  );
};

const NoteModal = ({ isOpen, onClose, note }: { isOpen: boolean, onClose: () => void, note?: ContentItem | null }) => {
  if (!isOpen || !note) return null;
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-black/80 rounded-lg overflow-hidden border border-white/10 z-10 p-6 text-gray-100">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">{note.title}</h2>
            <div className="text-xs text-gray-400">Ajouté par {note.addedBy} • {note.date}</div>
          </div>
          <div>
            <button onClick={onClose} className="text-gray-300 hover:text-white">Fermer</button>
          </div>
        </div>
        <div className="prose max-w-full text-gray-200">
          {note.description ? <p>{note.description}</p> : <p>Aucune description.</p>}
        </div>
        {note.url && note.url !== '#' && (
          <div className="mt-6">
            <a href={note.url} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white">Ouvrir la ressource</a>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.includes('@')) {
      setError('Email invalide');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError('Mot de passe requis');
      setLoading(false);
      return;
    }
    
    try {
      const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Identifiants invalides');
        setLoading(false);
        return;
      }
      
      const user = await res.json();
      onLogin(user);
      onClose();
    } catch (e) {
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-md rounded-xl p-6 relative z-10 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Connexion Admin</h3>
          <button onClick={onClose} className="text-gray-400">Fermer</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@digikoder.local"
              className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Mot de passe</label>
            <input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white py-2 rounded">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
       </div>
    </div>
  );
};

const EditContentModal = ({ isOpen, item, onClose, onSave }: { isOpen: boolean, item?: ContentItem | null, onClose: () => void, onSave: (updated: ContentItem) => void }) => {
  const [form, setForm] = useState<any>({});
  const [categories, setCategories] = useState<Array<{id: string, label: string, icon: string}>>([]);
  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  useEffect(() => {
    if (item) setForm({ ...item });
  }, [item]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/api/categories`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setCategories(data))
        .catch(() => setCategories([]));
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: item.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-lg rounded-xl p-6 relative z-10 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Modifier le contenu</h3>
          <button onClick={onClose} className="text-gray-400">Fermer</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Titre</label>
            <input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">URL</label>
            <input value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Catégorie</label>
            <select value={form.category || (categories[0]?.id || 'musique')} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))
              ) : (
                <option value="musique">Musique / Fréquences</option>
              )}
            </select>
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">Enregistrer</button>
        </form>
      </div>
    </div>
  );
};

// Users Management Modal (superadmin only)
interface UserItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const UsersModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'admin' });
  const [error, setError] = useState('');

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newUser.email || !newUser.password) {
      setError('Email et mot de passe requis');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Erreur lors de la création');
        return;
      }
      
      setNewUser({ email: '', password: '', role: 'admin' });
      setShowAddForm(false);
      loadUsers();
    } catch (e) {
      setError('Erreur réseau');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) loadUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-3xl rounded-xl p-6 relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Gestion des Utilisateurs</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
        </div>

        <div className="mb-6">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={18} /> Ajouter un utilisateur
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
            <h4 className="text-sm font-bold mb-3">Nouvel utilisateur</h4>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Email</label>
                  <input 
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                    placeholder="utilisateur@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Mot de passe</label>
                  <input 
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Rôle</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                >
                  <option value="admin">Admin (peut ajouter/modifier son contenu)</option>
                  <option value="superadmin">Super Admin (accès complet)</option>
                </select>
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex gap-2">
                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm">
                  Créer
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setError(''); }} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-8">Chargement...</div>
        ) : (
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Aucun utilisateur</div>
            ) : (
              users.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-black/20 rounded border border-white/5">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      {user.role === 'superadmin' ? '👑 Super Admin' : '👤 Admin'} • Créé le {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Modal (admin/superadmin only)
const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [selectedFont, setSelectedFont] = useState('inter');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  const fonts = [
    { id: 'inter', name: 'Inter (par défaut)', family: 'Inter, sans-serif' },
    { id: 'indie-flower', name: 'Indie Flower', family: "'Indie Flower', cursive" },
    { id: 'cherry-swash', name: 'Cherry Swash', family: "'Cherry Swash', cursive" },
    { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', sans-serif" },
    { id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif" },
    { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif" },
    { id: 'lato', name: 'Lato', family: "'Lato', sans-serif" },
    { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif" },
    { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif" },
    { id: 'roboto-slab', name: 'Roboto Slab', family: "'Roboto Slab', serif" },
    { id: 'dancing', name: 'Dancing Script', family: "'Dancing Script', cursive" }
  ];

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFont(data.selectedFont || 'inter');
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ selectedFont })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setMessage('Paramètres sauvegardés avec succès !');

      // Apply font globally
      document.body.style.fontFamily = fonts.find(f => f.id === selectedFont)?.family || 'Inter, sans-serif';

      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (e) {
      setMessage('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-2xl rounded-xl p-6 relative z-10 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">⚙️ Paramètres de l'application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Chargement...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Police de caractères</h4>
              <p className="text-sm text-gray-400 mb-4">Choisissez la police utilisée pour toute l'application</p>

              <div className="space-y-2">
                {fonts.map(font => (
                  <label
                    key={font.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedFont === font.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-black/20 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="font"
                      value={font.id}
                      checked={selectedFont === font.id}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{font.name}</div>
                      <div className="text-sm text-gray-400" style={{ fontFamily: font.family }}>
                        Aperçu de la police : The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-center ${
                message.includes('succès') ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Categories Management Modal (admin/superadmin only)
const CategoriesModal = ({ isOpen, onClose, onCategoriesUpdated }: { isOpen: boolean, onClose: () => void, onCategoriesUpdated?: () => void }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ label: '', icon: 'Music' });

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  const availableIcons = [
    'Music', 'Play', 'Sparkles', 'Film', 'TrendingUp', 'Heart',
    'Star', 'Book', 'Headphones', 'Mic', 'Radio', 'Disc',
    'Target', 'Zap', 'Award', 'Compass', 'Globe', 'Sun'
  ];

  // Generate ID from label
  const generateId = (label: string) => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '') // Remove non-alphanumeric
      .substring(0, 30); // Limit length
  };

  useEffect(() => {
    if (isOpen) loadCategories();
  }, [isOpen]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Error loading categories:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.label || !formData.icon) {
      setMessage('Tous les champs sont requis');
      return;
    }

    const generatedId = generateId(formData.label);
    if (!generatedId) {
      setMessage('Le nom de la catégorie doit contenir au moins un caractère alphanumérique');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: generatedId,
          label: formData.label,
          icon: formData.icon
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Erreur lors de l\'ajout');
        return;
      }

      setMessage('Catégorie ajoutée avec succès !');
      setFormData({ label: '', icon: 'Music' });
      setAdding(false);
      loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Erreur réseau');
    }
  };

  const handleUpdate = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label: category.label, icon: category.icon })
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Erreur lors de la modification');
        return;
      }

      setMessage('Catégorie modifiée avec succès !');
      setEditing(null);
      loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Erreur réseau');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || 'Erreur lors de la suppression');
        return;
      }

      setMessage('Catégorie supprimée avec succès !');
      loadCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Erreur réseau');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-3xl rounded-xl p-6 relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">📂 Gestion des Catégories</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-center ${
            message.includes('succès') ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={() => setAdding(!adding)}
          className="mb-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="inline w-4 h-4 mr-2" />
          {adding ? 'Annuler' : 'Ajouter une catégorie'}
        </button>

        {adding && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-3">Nouvelle catégorie</h4>
            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">Nom de la catégorie</label>
              <input
                type="text"
                value={formData.label}
                onChange={e => setFormData({ ...formData, label: e.target.value })}
                placeholder="ex: Yoga & Bien-être"
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
              />
              {formData.label && (
                <p className="text-xs text-gray-500 mt-1">
                  ID généré automatiquement: <span className="text-purple-400">{generateId(formData.label)}</span>
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">Icône</label>
              <select
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm"
              >
                {availableIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ajouter
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-8">Chargement...</div>
        ) : (
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Aucune catégorie</div>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                  {editing === cat.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Label</label>
                          <input
                            type="text"
                            value={cat.label}
                            onChange={e => setCategories(categories.map(c => c.id === cat.id ? { ...c, label: e.target.value } : c))}
                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Icône</label>
                          <select
                            value={cat.icon}
                            onChange={e => setCategories(categories.map(c => c.id === cat.id ? { ...c, icon: e.target.value } : c))}
                            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm"
                          >
                            {availableIcons.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-400">ID: {cat.id} • Icône: {cat.icon}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(cat.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  // Démarrer en mode invité authentifié pour éviter l'écran d'inscription
  const [user, setUser] = useState<User>({ email: 'guest@local', isAuthenticated: true, role: 'user' });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addContentType, setAddContentType] = useState<'video' | 'note' | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<{url?: string, platform?: string, title?: string}>({});
  const [aliveMap, setAliveMap] = useState<Record<string, boolean>>({});
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState<ContentItem | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, label: string, icon: string}>>([]);
  

  // Filter Logic
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter(item => item.category === activeFilter);
  }, [items, activeFilter]);

  // View mode: show videos mosaic or notes (articles)
  const [viewMode, setViewMode] = useState<'videos' | 'notes'>('videos');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedItems = useMemo(() => {
    if (viewMode === 'notes') {
      return filteredItems.filter(i => i.type === 'article');
    }
    // videos mode: only video items and alive (not explicitly false)
    const base = filteredItems.filter(i => i.type === 'video' && aliveMap[i.id] !== false);
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(it => {
      if (it.title.toLowerCase().includes(q)) return true;
      if ((it.description || '').toLowerCase().includes(q)) return true;
      if ((it.keywords || []).some(k => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [filteredItems, viewMode, aliveMap, searchQuery]);

  // API base (use Vite env `VITE_API_BASE` if provided)
  // Default to 3005 (server/index.cjs) to avoid port conflicts
  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:3005';

  // Handlers
  const handleLogin = (email: string) => {
    setUser({ email, isAuthenticated: true });
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {}); // Ignore errors
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      // Clear token and return to guest view
      localStorage.removeItem('authToken');
      setUser({ email: 'guest@local', isAuthenticated: true, role: 'user' });
      setViewMode('videos');
      setActiveFilter('all');
    }
  };

  const handleAddContent = async (data: any) => {
     const platform = getPlatform(data.url);
     const type = data.category === 'article' ? 'article' : 'video';

     try {
       const keywords = extractKeywords((data.title || '') + ' ' + (data.description || ''));

       // Get auth token from user state (we'll need to store it)
       const token = localStorage.getItem('authToken');
       if (!token) {
         alert('Vous devez être connecté pour ajouter du contenu');
         return;
       }

       const payload: any = {
         title: data.title,
         url: data.url,
         type,
         platform,
         category: data.category,
         description: data.description,
         keywords
       };

       const res = await fetch(`${API_BASE}/api/contents`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify(payload)
       });

       if (!res.ok) {
         const errorData = await res.json().catch(() => ({}));
         throw new Error(errorData.error || `Erreur ${res.status}: ${res.statusText}`);
       }

       const inserted = await res.json();
       const newItem: ContentItem = {
         id: String(inserted.id),
         type: inserted.type,
         platform: inserted.platform || getPlatform(inserted.url),
         title: inserted.title,
         url: inserted.url,
         category: inserted.category || 'outils',
         description: inserted.description || '',
         addedBy: inserted.addedBy || user.email,
         date: inserted.date || ''
       };
       setItems(prev => [newItem, ...prev]);
     } catch (e) {
       console.error('Erreur ajout contenu:', e);
       alert(e instanceof Error ? e.message : 'Erreur lors de l\'ajout du contenu');
     }
  };

  const handleAdminLogin = (userData: any) => {
    // Store auth token in localStorage
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    }

    // Update user state
    setUser({
      id: String(userData.id),
      email: userData.email,
      isAuthenticated: true,
      role: userData.role || 'user'
    });
  };

  const handleEditContent = async (updated: ContentItem) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Vous devez être connecté pour modifier du contenu');
        return;
      }

      const res = await fetch(`${API_BASE}/api/contents/${updated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      const row = await res.json();
      setItems(items.map(i => i.id === updated.id ? {...i, ...{
        title: row.title,
        url: row.url,
        description: row.description,
        category: row.category,
        platform: row.platform,
        keywords: row.keywords
      }} : i));
    } catch (e) {
      console.error('Erreur modification:', e);
      alert(e instanceof Error ? e.message : 'Erreur lors de la modification du contenu');
    }
  };

  const handleStartEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Supprimer définitivement cet élément ?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Vous devez être connecté pour supprimer du contenu');
        return;
      }

      const res = await fetch(`${API_BASE}/api/contents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      console.error('Erreur suppression:', e);
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression du contenu');
    }
  };

  // On mount: load contents from local API and check auth token
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token is still valid by trying to fetch users (will fail if invalid)
        try {
          const res = await fetch(`${API_BASE}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          // If token is valid and user is superadmin, they'll get users list
          // Otherwise they'll get 401/403, which means token is invalid or not superadmin
          // We don't need the result, just checking if it's not 401
          if (res.status === 401) {
            localStorage.removeItem('authToken');
          }
        } catch (e) {
          // Network error, keep token for now
        }
      }
    };

    const loadContents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contents`);
        if (!res.ok) {
          console.warn('API load error:', res.status, res.statusText);
          if (res.status === 500) {
            console.error('Server error - check if server is running on port', API_BASE);
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setItems(data as ContentItem[]);
        // Reset aliveMap to force re-validation of all links
        setAliveMap({});
      } catch (e) {
        console.error('Erreur chargement contenus:', e);
        if (e instanceof TypeError && e.message.includes('fetch')) {
          console.error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré sur', API_BASE);
        }
      }
    };

    const loadSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          const selectedFont = data.selectedFont || 'inter';

          // Apply font globally
          const fontMap: Record<string, string> = {
            'inter': 'Inter, sans-serif',
            'indie-flower': "'Indie Flower', cursive",
            'cherry-swash': "'Cherry Swash', cursive",
            'open-sans': "'Open Sans', sans-serif",
            'raleway': "'Raleway', sans-serif",
            'playfair': "'Playfair Display', serif",
            'lato': "'Lato', sans-serif",
            'merriweather': "'Merriweather', serif",
            'montserrat': "'Montserrat', sans-serif",
            'roboto-slab': "'Roboto Slab', serif",
            'dancing': "'Dancing Script', cursive"
          };

          document.body.style.fontFamily = fontMap[selectedFont] || 'Inter, sans-serif';
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    };

    checkAuth();
    loadContents();
    loadSettings();
    loadCategories();
  }, []);

  // Optimized URL validity check: lazy check, batch processing, cache results
  useEffect(() => {
    let cancelled = false;
    const checkVideosOptimized = async () => {
      const videoItems = items.filter(i => i.type === 'video');
      const uncheckedItems = videoItems.filter(item => aliveMap[item.id] === undefined);

      if (uncheckedItems.length === 0) return;

      const newAliveMap: Record<string, boolean> = {};

      // Platforms that always work or don't need checking
      // Note: YouTube is NOT in this list because videos can be deleted/private
      const trustedPlatforms = ['facebook', 'instagram'];

      // Process in batches of 5 to avoid overwhelming the network
      const batchSize = 5;
      for (let i = 0; i < uncheckedItems.length; i += batchSize) {
        if (cancelled) return;

        const batch = uncheckedItems.slice(i, i + batchSize);
        const promises = batch.map(async (item) => {
          // Skip check for trusted platforms
          if (trustedPlatforms.includes(item.platform || '')) {
            return { id: item.id, alive: true };
          }

          try {
            const isAlive = await checkUrlAlive(item.url, 5000);
            return { id: item.id, alive: isAlive };
          } catch (e) {
            // If validation fails, assume alive to avoid false negatives
            return { id: item.id, alive: true };
          }
        });

        const results = await Promise.allSettled(promises);

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value) {
            newAliveMap[result.value.id] = result.value.alive;
          } else {
            // If check failed, assume alive to avoid false negatives
            newAliveMap[batch[idx].id] = true;
          }
        });

        // Update state incrementally for better UX
        if (!cancelled && Object.keys(newAliveMap).length > 0) {
          setAliveMap(prev => ({ ...prev, ...newAliveMap }));
        }
      }
    };

    // Only check on mount or when new items are added
    if (items.length > 0) {
      // Debounce to avoid multiple checks
      const timer = setTimeout(() => {
        checkVideosOptimized();
      }, 500);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    return () => { cancelled = true; };
  }, [items.length]); // Only trigger on items length change, not full items array

  // Fetch missing/placeholder titles (uses backend to avoid CORS)
  useEffect(() => {
    let cancelled = false;

    const fetchTitleFor = async (url: string) => {
      try {
        // Use backend to fetch title (avoids CORS)
        const response = await fetch('http://localhost:3005/api/fetch-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.title) return data.title;
        }
      } catch (e) {
        console.error('fetch-title error:', e);
      }

      return null;
    };

    const run = async () => {
      const updated: ContentItem[] = [...items];
      let changed = false;
      for (let i = 0; i < updated.length; i++) {
        if (cancelled) return;
        const it = updated[i];
        const needs = typeof it.title === 'string' && (it.title.startsWith('Imported:') || it.title.match(/^yt-|^Imported:/));
        if (needs) {
          const t = await fetchTitleFor(it.url);
          if (t) {
            updated[i] = { ...it, title: t };
            changed = true;
            setItems(prev => prev.map(p => p.id === it.id ? { ...p, title: t } : p));
          }
        }
      }
      return changed;
    };

    run();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Fetch thumbnails for Instagram and Facebook videos
  useEffect(() => {
    let cancelled = false;

    const fetchThumbnails = async () => {
      const videoItems = items.filter(i => i.type === 'video');
      const itemsNeedingThumbnails = videoItems.filter(item =>
        (item.platform === 'instagram' || item.platform === 'facebook') &&
        !thumbnailMap[item.id]
      );

      if (itemsNeedingThumbnails.length === 0) return;

      const newThumbnails: Record<string, string> = {};

      // Process in batches of 3 to avoid overwhelming the backend
      const batchSize = 3;
      for (let i = 0; i < itemsNeedingThumbnails.length; i += batchSize) {
        if (cancelled) return;

        const batch = itemsNeedingThumbnails.slice(i, i + batchSize);
        const promises = batch.map(async (item) => {
          try {
            const response = await fetch(`${API_BASE}/api/fetch-title`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: item.url })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.thumbnail) {
                return { id: item.id, thumbnail: data.thumbnail };
              }
            }
          } catch (e) {
            console.error(`Error fetching thumbnail for ${item.platform}:`, e);
          }
          return { id: item.id, thumbnail: null };
        });

        const results = await Promise.allSettled(promises);

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value?.thumbnail) {
            newThumbnails[result.value.id] = result.value.thumbnail;
          }
        });

        // Update state incrementally for better UX
        if (!cancelled && Object.keys(newThumbnails).length > 0) {
          setThumbnailMap(prev => ({ ...prev, ...newThumbnails }));
        }

        // Small delay between batches to avoid overwhelming the server
        if (i + batchSize < itemsNeedingThumbnails.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    };

    // Debounce to avoid multiple fetches
    const timer = setTimeout(() => {
      fetchThumbnails();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, items]); // Trigger on items change

  // always show mosaic; auth screen removed per request

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Ambient Light */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]"></div>
      </div>

      <Header
        user={user}
        onLogout={handleLogout}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onOpenAdd={() => setIsAddModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenUsers={() => setIsUsersModalOpen(true)}
        onOpenCategories={() => setIsCategoriesModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(v: string) => setSearchQuery(v)}
      />

      <main className="max-w-7xl mx-auto px-4">
        {/* Quick Add Buttons (visible only for authenticated users) */}
        {user.role !== 'user' && (
          <div className="mb-8 flex gap-3 flex-wrap">
            <button 
              onClick={() => { setAddContentType('video'); setIsAddModalOpen(true); }}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Video size={20} /> Ajouter une vidéo
            </button>
            <button 
              onClick={() => { setAddContentType('note'); setIsAddModalOpen(true); }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <BookOpen size={20} /> Ajouter une note
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setViewMode('videos')} className={`px-4 py-2 rounded-full text-sm ${viewMode === 'videos' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}`}>
            Vidéos <span className="ml-2 text-xs text-gray-200">({filteredItems.filter(i => i.type === 'video' && aliveMap[i.id] !== false).length})</span>
          </button>
          <button onClick={() => setViewMode('notes')} className={`px-4 py-2 rounded-full text-sm ${viewMode === 'notes' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}`}>
            Notes <span className="ml-2 text-xs text-gray-200">({filteredItems.filter(i => i.type === 'article').length})</span>
          </button>
        </div>

        <MasonryGrid items={displayedItems} user={user} onOpenVideo={(u,p,t) => { setModalVideo({url:u, platform:p, title:t}); setIsVideoModalOpen(true); }} onOpenNote={(it) => { setModalNote(it); setIsNoteModalOpen(true); }} onEdit={(it) => handleStartEdit(it)} onDelete={(id) => handleDeleteContent(id)} thumbnailMap={thumbnailMap} categories={categories} />
      </main>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => { setIsVideoModalOpen(false); setModalVideo({}); }} url={modalVideo.url} platform={modalVideo.platform} title={modalVideo.title} />
      <NoteModal isOpen={isNoteModalOpen} onClose={() => { setIsNoteModalOpen(false); setModalNote(null); }} note={modalNote} />

      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleAdminLogin} />
      <UsersModal isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)} />
      <CategoriesModal isOpen={isCategoriesModalOpen} onClose={() => setIsCategoriesModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <EditContentModal isOpen={isEditModalOpen} item={editingItem} onClose={() => { setIsEditModalOpen(false); setEditingItem(null); }} onSave={(u) => handleEditContent(u)} />

      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
            setIsAddModalOpen(false);
            setAddContentType(null);
        }} 
        onAdd={handleAddContent}
        contentType={addContentType}
      />
    </div>
  );
};

const container = document.getElementById('root');
if (container && !container.hasAttribute('data-root-initialized')) {
  container.setAttribute('data-root-initialized', 'true');
  const root = createRoot(container);
  root.render(<App />);
}