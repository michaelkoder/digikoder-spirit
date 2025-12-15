import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';

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
}

interface User {
  email: string;
  isAuthenticated: boolean;
  role?: 'admin' | 'user';
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

// Best-effort URL alive check. Uses noembed for known providers, falls back to HEAD fetch.
const checkUrlAlive = async (url: string, timeoutMs = 5000): Promise<boolean> => {
  // try noembed first (works for many providers)
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
    // fall through to HEAD
  } finally {
    clearTimeout(id);
  }

  // Fallback: attempt a HEAD request to the resource
  const controller2 = new AbortController();
  const id2 = setTimeout(() => controller2.abort(), timeoutMs);
  try {
    const res2 = await fetch(url, { method: 'HEAD', signal: controller2.signal });
    clearTimeout(id2);
    if (res2 && (res2.ok || res2.status === 0)) return true; // status 0 for opaque
  } catch (e) {
    // final fallback: consider dead
  } finally {
    clearTimeout(id2);
  }

  return false;
};

// --- COMPONENTS ---

const Header = ({ user, onLogout, activeFilter, onFilterChange, onOpenAdd, onOpenAdmin }: any) => {
  const categories: {id: Category | 'all', label: string, icon: any}[] = [
    { id: 'all', label: 'Tout', icon: Filter },
    { id: 'musique', label: 'Fréquences & Musique', icon: Music },
    { id: 'meditation', label: 'Méditation', icon: Play },
    { id: 'documentaire', label: 'Savoir & Docu', icon: Video },
    { id: 'article', label: 'Notes & Blog', icon: BookOpen },
    { id: 'outils', label: 'Outils Pratiques', icon: ShieldCheck },
  ];

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
                {user.role === 'admin' ? (
                  <>
                    <button 
                      onClick={onOpenAdd}
                      className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-2 text-sm"
                    >
                      <Plus size={18} /> Partager
                    </button>
                    <span className="text-xs text-amber-200 px-2 py-1 rounded border border-amber-300">ADMIN</span>
                  </>
                ) : (
                  <button onClick={onOpenAdmin} className="text-xs bg-white/5 text-gray-200 px-3 py-1 rounded">Se connecter (admin)</button>
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

const VideoEmbed = ({ url, platform, title, onOpen }: { url: string, platform: string, title: string, onOpen?: (u: string, p: string, t?: string) => void }) => {
  // Always render a visual thumbnail/card in the mosaic. Playback happens in modal only.
  const videoId = platform === 'youtube' ? getYoutubeId(url) : null;
  const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <div onClick={() => onOpen?.(url, platform, title)} className="relative rounded-lg overflow-hidden group cursor-pointer bg-black/20 hover:scale-[1.01] transition-transform">
      {thumbnail ? (
        <div className="relative">
          <img src={thumbnail} alt={title} className="w-full h-auto block object-cover" />
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

const ContentCard: React.FC<{ item: ContentItem, user?: User, onOpenVideo?: (u: string, p: string, t?: string) => void, onOpenNote?: (item: ContentItem) => void, onEdit?: (item: ContentItem) => void, onDelete?: (id: string) => void }> = ({ item, user, onOpenVideo, onOpenNote, onEdit, onDelete }) => {
  const isVideo = item.type === 'video';

  return (
    <div className="break-inside-avoid mb-6 glass-panel rounded-xl overflow-hidden hover:translate-y-[-2px] transition-transform duration-300 group">
      {/* Media Area */}
      {isVideo ? (
        <div className="p-2 pb-0">
            <VideoEmbed url={item.url} platform={item.platform || 'other'} title={item.title} onOpen={onOpenVideo} />
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
           <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
               item.category === 'musique' ? 'border-teal-500/50 text-teal-300 bg-teal-500/10' :
               item.category === 'meditation' ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' :
               item.category === 'documentaire' ? 'border-blue-500/50 text-blue-300 bg-blue-500/10' :
               'border-amber-500/50 text-amber-300 bg-amber-500/10'
           }`}>
             {item.category}
           </span>
           <div className="flex gap-2">
                  {item.platform === 'youtube' && <Youtube size={14} className="text-red-400" />}
                  {item.platform === 'facebook' && <Facebook size={14} className="text-blue-400" />}
                  {item.platform === 'instagram' && <Instagram size={14} className="text-pink-400" />}
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => onEdit?.(item)} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-200">Modifier</button>
                      <button onClick={() => onDelete?.(item.id)} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white">Suppr</button>
                    </>
                  )}
           </div>
        </div>
        
        <h3 className="font-serif font-bold text-lg leading-tight mb-2 text-gray-100 group-hover:text-amber-200 transition-colors">
          {item.type === 'video' ? (
            <button onClick={() => onOpenVideo?.(item.url, item.platform || 'other', item.title)} className="text-left w-full text-inherit">
              {item.title}
            </button>
          ) : (
            <button onClick={() => onOpenNote?.(item)} className="text-left w-full text-inherit">
              {item.title}
            </button>
          )}
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

const MasonryGrid = ({ items, user, onOpenVideo, onOpenNote, onEdit, onDelete }: { items: ContentItem[], user?: User, onOpenVideo?: (u: string, p: string, t?: string) => void, onOpenNote?: (item: ContentItem) => void, onEdit?: (item: ContentItem) => void, onDelete?: (id: string) => void }) => {
  // Simple CSS Column masonry implementation
  // We use columns-1 for mobile, columns-2 for tablet, columns-3/4 for desktop
  
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
        <ContentCard key={item.id} item={item} user={user} onOpenVideo={onOpenVideo} onOpenNote={onOpenNote} onEdit={onEdit} onDelete={onDelete} />
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

const AddContentModal = ({ isOpen, onClose, onAdd }: any) => {
  const [formData, setFormData] = useState({
      url: '',
      title: '',
      category: 'musique',
      description: '',
      captcha: ''
  });
  
  // Simple captcha
  const [captchaNum] = useState({ a: Math.floor(Math.random()*10), b: Math.floor(Math.random()*10) });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (parseInt(formData.captcha) !== captchaNum.a + captchaNum.b) {
          alert('Calcul incorrect (sécurité anti-robot)');
          return;
      }
      onAdd({
          url: formData.url,
          title: formData.title,
          category: formData.category,
          description: formData.description
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="glass-panel w-full max-w-lg rounded-xl p-6 relative z-10 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white font-serif">Partager une pépite</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Lien (Youtube, Facebook, Article...)</label>
                    <input 
                        required
                        type="url"
                        value={formData.url}
                        onChange={e => setFormData({...formData, url: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none"
                        placeholder="https://..."
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">Titre</label>
                         <input 
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none"
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">Catégorie</label>
                         <select 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded p-2 text-white focus:border-purple-400 focus:outline-none appearance-none"
                        >
                            <option value="musique">Musique / Fréquences</option>
                            <option value="meditation">Méditation</option>
                            <option value="documentaire">Documentaire</option>
                            <option value="article">Article / Note</option>
                            <option value="outils">Outils</option>
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
  if (!isOpen || !url) return null;

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  const buildSrc = (): string => {
    try {
      if (platform === 'facebook') {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
      } else if (platform === 'instagram') {
        const u = new URL(url);
        return `${u.origin}${u.pathname}embed`;
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

  useEffect(() => {
    setIframeLoaded(false);
    setIframeFailed(false);
    const t = setTimeout(() => {
      if (!iframeLoaded) setIframeFailed(true);
    }, 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, reloadKey]);

  const handleRetry = () => {
    setIframeFailed(false);
    setReloadKey(k => k + 1);
  };

  let paddingTop = '56.25%';
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (path.includes('/reel/') || path.includes('/shorts/') || path.includes('/stories/')) {
      paddingTop = `${(16/9)*100}%`;
    } else if (platform === 'instagram' && path.includes('/p/')) {
      paddingTop = '100%';
    }
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-black/80 rounded-lg overflow-hidden border border-white/10 z-10" style={{maxHeight: '90vh'}}>
        <div className="flex justify-between items-center p-3 border-b border-white/5">
          <div className="text-sm text-gray-200">{title || 'Lecture'}</div>
          <div className="flex items-center gap-2">
            {platform === 'facebook' && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white">Ouvrir sur Facebook</a>
            )}
            <button onClick={onClose} className="text-gray-300 hover:text-white px-3">Fermer</button>
          </div>
        </div>

        <div style={{paddingTop}} className="relative bg-black">
          {!iframeFailed ? (
            <iframe key={reloadKey} onLoad={() => setIframeLoaded(true)} className="absolute top-0 left-0 w-full h-full" src={src} title={title} allow="autoplay; encrypted-media; clipboard-write; picture-in-picture" allowFullScreen></iframe>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4">
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

const AdminLoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (email: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded admin credentials
    const adminUser = 'admin';
    const adminPass = 'admin123';
    if (username === adminUser && password === adminPass) {
      onLogin('admin@local');
      onClose();
      return;
    }
    setError('Identifiants invalides');
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
            <label className="text-xs text-gray-400 block mb-1">Utilisateur</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">Se connecter</button>
        </form>
        <div className="mt-3 text-xs text-gray-400">Identifiants par défaut: <strong>admin</strong> / <strong>admin123</strong></div>
      </div>
    </div>
  );
};

const EditContentModal = ({ isOpen, item, onClose, onSave }: { isOpen: boolean, item?: ContentItem | null, onClose: () => void, onSave: (updated: ContentItem) => void }) => {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (item) setForm({ ...item });
  }, [item]);

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
            <select value={form.category || 'musique'} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white">
              <option value="musique">Musique / Fréquences</option>
              <option value="meditation">Méditation</option>
              <option value="documentaire">Documentaire</option>
              <option value="article">Article / Note</option>
              <option value="outils">Outils</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">Enregistrer</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  // Démarrer en mode invité authentifié pour éviter l'écran d'inscription
  const [user, setUser] = useState<User>({ email: 'guest@local', isAuthenticated: true });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [items, setItems] = useState<ContentItem[]>(INITIAL_DATA);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<{url?: string, platform?: string, title?: string}>({});
  const [aliveMap, setAliveMap] = useState<Record<string, boolean>>({});
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [modalNote, setModalNote] = useState<ContentItem | null>(null);
  

  // Filter Logic
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter(item => item.category === activeFilter);
  }, [items, activeFilter]);

  // View mode: show videos mosaic or notes (articles)
  const [viewMode, setViewMode] = useState<'videos' | 'notes'>('videos');

  const displayedItems = useMemo(() => {
    if (viewMode === 'notes') {
      return filteredItems.filter(i => i.type === 'article');
    }
    // videos mode: only video items and alive (not explicitly false)
    return filteredItems.filter(i => i.type === 'video' && aliveMap[i.id] !== false);
  }, [filteredItems, viewMode, aliveMap]);

  // Handlers
  const handleLogin = (email: string) => {
    setUser({ email, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUser({ email: '', isAuthenticated: false });
  };

  const handleAddContent = (data: any) => {
     const platform = getPlatform(data.url);
     const type = data.category === 'article' ? 'article' : 'video';
     
     const newItem: ContentItem = {
         id: Date.now().toString(),
         type,
         platform,
         title: data.title,
         url: data.url,
         category: data.category,
         description: data.description,
         addedBy: user.email.split('@')[0], // just take the name part
         date: new Date().toLocaleDateString()
     };
     
     setItems([newItem, ...items]);
  };

  const handleAdminLogin = (email: string) => {
    // set admin role
    setUser({ email, isAuthenticated: true, role: 'admin' });
  };

  const handleEditContent = (updated: ContentItem) => {
    setItems(items.map(i => i.id === updated.id ? {...i, ...updated} : i));
  };

  const handleStartEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteContent = (id: string) => {
    if (!confirm('Supprimer définitivement cet élément ?')) return;
    setItems(items.filter(i => i.id !== id));
  };

  // On mount (and when items change) check which urls are alive and update aliveMap.
  useEffect(() => {
    let cancelled = false;
    const checkAll = async () => {
      const map: Record<string, boolean> = { ...aliveMap };
      for (const it of items) {
        // skip if we already know it's alive
        if (map[it.id] === true) continue;
        try {
          const ok = await checkUrlAlive(it.url, 5000);
          if (cancelled) return;
          map[it.id] = ok;
          // update progressively for responsiveness
          setAliveMap({ ...map });
        } catch (e) {
          map[it.id] = false;
          setAliveMap({ ...map });
        }
      }
    };
    checkAll();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (!user.isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

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
      />

      <main className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setViewMode('videos')} className={`px-4 py-2 rounded-full text-sm ${viewMode === 'videos' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}`}>
            Vidéos <span className="ml-2 text-xs text-gray-200">({filteredItems.filter(i => i.type === 'video' && aliveMap[i.id] !== false).length})</span>
          </button>
          <button onClick={() => setViewMode('notes')} className={`px-4 py-2 rounded-full text-sm ${viewMode === 'notes' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300'}`}>
            Notes <span className="ml-2 text-xs text-gray-200">({filteredItems.filter(i => i.type === 'article').length})</span>
          </button>
        </div>

        <MasonryGrid items={displayedItems} user={user} onOpenVideo={(u,p,t) => { setModalVideo({url:u, platform:p, title:t}); setIsVideoModalOpen(true); }} onOpenNote={(it) => { setModalNote(it); setIsNoteModalOpen(true); }} onEdit={(it) => handleStartEdit(it)} onDelete={(id) => handleDeleteContent(id)} />
      </main>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => { setIsVideoModalOpen(false); setModalVideo({}); }} url={modalVideo.url} platform={modalVideo.platform} title={modalVideo.title} />
      <NoteModal isOpen={isNoteModalOpen} onClose={() => { setIsNoteModalOpen(false); setModalNote(null); }} note={modalNote} />

      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleAdminLogin} />
      <EditContentModal isOpen={isEditModalOpen} item={editingItem} onClose={() => { setIsEditModalOpen(false); setEditingItem(null); }} onSave={(u) => handleEditContent(u)} />

      <AddContentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddContent}
      />

    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);