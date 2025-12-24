import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
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
  Sun,
  Share2,
  Check,
  Copy,
  X
} from 'lucide-react';

// --- CONFIGURATION ---
// The base URL for the API is read from environment variable
// with fallback to '/spirit' for backward compatibility

// --- TYPES ---
interface ContentItem {
  id: string;
  type: 'video' | 'article';
  platform?: 'youtube' | 'facebook' | 'instagram' | 'other';
  title: string;
  url: string;
  category: string;
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

interface Category {
    id: string;
    label: string;
    icon: string;
}

// --- HELPER FUNCTIONS ---
const getYoutubeId = (url: string) => {
    try {
        const u = new URL(url);
        const host = u.hostname.replace('www.', '');
        if (host === 'youtu.be') return u.pathname.slice(1);
        if (host.endsWith('youtube.com')) return u.searchParams.get('v');
    } catch (e) {}
    const match = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

const getPlatform = (url: string): ContentItem['platform'] => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
};


// --- API FUNCTIONS ---
// Use environment variable with fallback to '/spirit'
const API_BASE_RESOLVED = import.meta.env.VITE_API_BASE_URL || '/spirit';

const apiFetch = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    return fetch(`${API_BASE_RESOLVED}${url}`, { ...options, headers });
};

// Fonction pour appliquer la police de manière globale sur toute l'application
const applyFontGlobally = (fontName: string) => {
  // Créer ou mettre à jour un style global dynamique
  let styleElement = document.getElementById('dynamic-font-style') as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'dynamic-font-style';
    document.head.appendChild(styleElement);
  }

  // Appliquer la police avec !important pour surcharger tous les styles
  // Y compris les titres avec font-serif
  styleElement.textContent = `
    * {
      font-family: "${fontName}", sans-serif !important;
    }
  `;

  console.log('✅ Police appliquée globalement:', fontName);
};

// --- COMPONENTS ---

const Header = ({ user, onLogout, activeFilter, onFilterChange, onOpenAdmin, onOpenUsers, onOpenSettings, onOpenCategories, searchQuery, onSearchChange, categories, mediaMode, setMediaMode }: any) => {
  const iconMap: Record<string, any> = { Music, Play, Sparkles, Film, TrendingUp, Heart, Star, BookOpen, Headphones, Mic, Radio, Disc, Target, Zap, Award, Compass, Globe, Sun, Video, ShieldCheck, Filter };

  const allCategories = [
    { id: 'all', label: 'Tout', icon: 'Video' },
    ...categories
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-purple-500 to-amber-300 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sun className="text-white" size={20} />
            </div>
            <h1 className="text-lg md:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 font-serif">
              LOOOKAA <span className="text-amber-300">SPIRIT</span>
            </h1>
            <Sun size={20} className="text-amber-300 hidden sm:block" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
            {/* Mode Switch */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">Mode</span>
              <div className="flex bg-black/30 rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setMediaMode('video')}
                  className={`px-3 md:px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 ${
                    mediaMode === 'video'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Video size={14} />
                  <span className="hidden sm:inline">Vidéos</span>
                </button>
                <button
                  onClick={() => setMediaMode('article')}
                  className={`px-3 md:px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 ${
                    mediaMode === 'article'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BookOpen size={14} />
                  <span className="hidden sm:inline">Notes</span>
                </button>
              </div>
            </div>

            {user.isAuthenticated && user.role !== 'user' ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {/* Boutons d'administration - 2 lignes sur mobile */}
                {user.role === 'superadmin' && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <button onClick={onOpenUsers} className="bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium transition-all flex items-center gap-1 text-xs sm:text-sm">
                      <span>👥</span>
                      <span className="hidden sm:inline">Utilisateurs</span>
                    </button>
                    <button onClick={onOpenCategories} className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium transition-all flex items-center gap-1 text-xs sm:text-sm">
                      <span>📂</span>
                      <span className="hidden sm:inline">Catégories</span>
                    </button>
                    <button onClick={onOpenSettings} className="bg-purple-600 hover:bg-purple-500 text-white px-2 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium transition-all flex items-center gap-1 text-xs sm:text-sm">
                      <span>⚙️</span>
                      <span className="hidden sm:inline">Paramètres</span>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-200 px-2 py-1 rounded border border-amber-300">{user.role?.toUpperCase()}</span>
                  <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors" aria-label="Déconnexion">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={onOpenAdmin} className="text-xs bg-white/5 text-gray-200 px-3 py-1 rounded">Se connecter</button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative w-full max-w-xl">
            <input
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-black/10 border border-white/10 rounded px-3 py-2 pr-10 text-sm text-white placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((cat: any) => {
            const Icon = iconMap[cat.icon] || Filter;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${activeFilter === cat.id ? 'bg-purple-600/50 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

const ContentCard = ({ item, user, onOpenVideo, onOpenNote, onEdit, onDelete, getCategoryLabel }: any) => {
    // Admin peut modifier uniquement son propre contenu
    // Superadmin peut tout modifier
    const canEdit = user?.role === 'superadmin' || (user?.role === 'admin' && item.addedBy === user.email);

    const getImageSource = () => {
        if (item.platform === 'youtube') {
            return `https://i.ytimg.com/vi/${getYoutubeId(item.url)}/hqdefault.jpg`;
        }
        // For Instagram, Facebook and other platforms, don't try to load thumbnails
        return null;
    };

    const getBackgroundColor = () => {
        switch (item.platform) {
            case 'instagram':
                return 'bg-gradient-to-br from-pink-500 to-purple-600';
            case 'facebook':
                return 'bg-blue-600';
            default:
                return 'bg-gray-700';
        }
    };

    const handleCardClick = () => {
        const isMobile = /Mobi/i.test(navigator.userAgent);
        const isVideo = item.type === 'video';

        // Special handling for Instagram on mobile to avoid the blank tab issue
        if (item.platform === 'instagram' && isVideo && isMobile) {
            window.location.href = item.url; // Navigate current tab
            return;
        }
        
        // Standard behavior for desktop or other platforms
        if (item.platform === 'instagram' && isVideo) {
             window.open(item.url, '_blank', 'noopener,noreferrer');
             return;
        }

        if (isVideo) {
            onOpenVideo?.(item.url, item.platform || 'other', item.title);
        } else {
            // Article/Note type - open text modal
            onOpenNote?.(item.title, item.description || '');
        }
    };

    const isVideo = item.type === 'video';

    return (
        <div onClick={handleCardClick} className="break-inside-avoid mb-6 glass-panel rounded-xl overflow-hidden hover:translate-y-[-2px] transition-transform duration-300 group cursor-pointer">
            <div className="p-2 pb-0">
                <div className={`relative rounded-lg overflow-hidden group aspect-video flex items-center justify-center ${getImageSource() ? 'bg-black/20' : getBackgroundColor()}`}>
                    {getImageSource() && (
                        <img src={getImageSource()!} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        {isVideo ? (
                            <Play className="text-white" size={48} />
                        ) : (
                            <BookOpen className="text-white" size={48} />
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-purple-500/50 text-purple-300 bg-purple-500/10">
                        {getCategoryLabel(item.category)}
                    </span>
                    <div className="flex gap-2 items-center">
                        {item.platform === 'youtube' && <Youtube size={28} className="text-red-400" />}
                        {item.platform === 'facebook' && <Facebook size={28} className="text-blue-400" />}
                        {item.platform === 'instagram' && <Instagram size={28} className="text-pink-400" />}
                        {canEdit && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-200">Modifier</button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }} className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white">Suppr</button>
                            </>
                        )}
                    </div>
                </div>
                <h3 className="font-serif font-bold text-lg leading-tight mb-2 text-gray-100">{item.title}</h3>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-xs text-gray-500">Par {item.addedBy}</span>
                </div>
            </div>
        </div>
    );
};

// --- MODALS ---

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  platform: string;
  title: string;
  onClose: () => void;
}

const VideoModal = ({ isOpen, videoUrl, platform, title, onClose }: VideoModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [allowFullscreen, setAllowFullscreen] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const embedUrlRef = useRef('');

  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      setAllowFullscreen(false);
      setIsVertical(false);
      embedUrlRef.current = '';
      return;
    }

    // Détecter format vertical basé sur l'URL et les patterns connus
    const isVerticalByUrl =
      videoUrl.includes('/shorts/') ||
      videoUrl.includes('/reel/') ||
      videoUrl.includes('/reels/') ||
      videoUrl.includes('instagram.com/p/') ||
      videoUrl.includes('instagram.com/tv/') ||
      videoUrl.includes('tiktok.com') ||
      videoUrl.includes('stories');

    // Pour Facebook: /watch/ et /videos/ sont généralement paysage
    // Seuls /reel/ et /reels/ sont verticaux
    const isFacebookHorizontal = platform === 'facebook' &&
      (videoUrl.includes('/watch/') || videoUrl.includes('/videos/')) &&
      !videoUrl.includes('/reel');

    setIsVertical(isFacebookHorizontal ? false : isVerticalByUrl);

    // Build embed URL once when modal opens
    if (platform === 'youtube') {
      const videoId = getYoutubeId(videoUrl);
      // YouTube embed parameters:
      // autoplay=1: auto-play video on first load only
      // modestbranding=1: minimal YouTube branding
      // rel=0: don't suggest related videos from other channels
      // playsinline=1: play inline on iOS (helps with mobile issues)
      embedUrlRef.current = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
    } else if (platform === 'facebook') {
      // Facebook video embed URL
      const encodedUrl = encodeURIComponent(videoUrl);
      embedUrlRef.current = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&autoplay=true`;
    } else {
      embedUrlRef.current = videoUrl;
    }

    // Give iframe time to load before allowing fullscreen
    const timer = setTimeout(() => {
      setIsReady(true);
      // Additional delay for mobile to ensure video is properly initialized
      const isMobile = /Mobi/i.test(navigator.userAgent);
      const delay = isMobile ? 3500 : 1500;
      setTimeout(() => setAllowFullscreen(true), delay);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, videoUrl, platform]);

  if (!isOpen) return null;

  const embedUrl = embedUrlRef.current;

  // Classes dynamiques selon le format
  const containerClasses = isVertical
    ? "w-full max-w-md aspect-[9/16] bg-black rounded-lg overflow-hidden relative" // Format vertical (9:16)
    : "w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden relative";  // Format horizontal (16:9)

  const handleShare = (platform: 'facebook' | 'whatsapp' | 'copy') => {
    const encodedUrl = encodeURIComponent(videoUrl);
    const encodedText = encodeURIComponent(title);

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank', 'noopener,noreferrer');
        break;
      case 'copy':
        navigator.clipboard.writeText(videoUrl).then(() => {
          alert('Lien copié !');
        });
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[310] text-white hover:text-gray-300 transition-colors"
        aria-label="Fermer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Boutons de partage */}
      <div className="absolute top-4 left-4 z-[310] flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleShare('copy'); }}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          aria-label="Copier le lien"
          title="Copier le lien"
        >
          <Copy size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleShare('facebook'); }}
          className="bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          aria-label="Partager sur Facebook"
          title="Partager sur Facebook"
        >
          <Facebook size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleShare('whatsapp'); }}
          className="bg-green-600/80 hover:bg-green-600 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          aria-label="Partager sur WhatsApp"
          title="Partager sur WhatsApp"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
      </div>

      <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Chargement de la vidéo...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          className={`w-full h-full transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          src={embedUrl}
          title={title}
          allow={`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture${allowFullscreen ? '; fullscreen' : ''}`}
          allowFullScreen={allowFullscreen}
          frameBorder="0"
        />
      </div>

      {platform === 'youtube' && !allowFullscreen && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-400 pointer-events-none">
          ⏱️ Fullscreen disponible après le chargement...
        </div>
      )}
    </div>
  );
};

// Modal pour afficher les articles/notes textuelles
interface ArticleModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

const ArticleModal = ({ isOpen, title, content, onClose }: ArticleModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[310] text-white hover:text-gray-300 transition-colors"
        aria-label="Fermer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        className="w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-amber-500 p-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-100px)] p-6">
          <div className="text-gray-100 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditVideoModal = ({ isOpen, item, categories, onClose, onSave }: any) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setUrl(item.url || '');
      setCategory(item.category || '');
      setDescription(item.description || '');
      setError('');
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !category) {
      setError('Tous les champs obligatoires doivent être remplis');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/contents/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, url, category, description })
      });
      if (!res.ok) throw new Error(await res.text());
      await onSave({ ...item, title, url, category, description });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-md rounded-xl p-6 relative z-10 border border-white/20">
          <h3 className="text-lg font-bold mb-4">Modifier la vidéo</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Titre</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description (optionnel)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" rows={3} />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              </div>
          </form>
      </div>
    </div>
  );
};

// Modale pour ajouter une vidéo
const AddVideoModal = ({ isOpen, categories, onClose, onSave }: any) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titlePlaceholder, setTitlePlaceholder] = useState('Titre de la vidéo');
  const [fetchingTitle, setFetchingTitle] = useState(false);

  // Détecter automatiquement la plateforme
  const detectPlatform = (url: string): 'youtube' | 'facebook' | 'instagram' | 'other' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
  };

  // Fonction pour récupérer automatiquement le titre depuis l'URL
  const fetchTitleFromUrl = async (videoUrl: string) => {
    if (!videoUrl.trim()) return;

    setFetchingTitle(true);
    setTitlePlaceholder('Récupération titre automatique depuis url collée...');

    try {
      const res = await apiFetch('/api/validate-url', {
        method: 'POST',
        body: JSON.stringify({ url: videoUrl })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setTitle(data.title);
          setTitlePlaceholder('Titre de la vidéo');
        } else {
          setTitlePlaceholder('Récupération du titre HS. Saisir le titre manuellement');
        }
      } else {
        setTitlePlaceholder('Récupération du titre HS. Saisir le titre manuellement');
      }
    } catch (err) {
      console.error('Error fetching title:', err);
      setTitlePlaceholder('Récupération du titre HS. Saisir le titre manuellement');
    } finally {
      setFetchingTitle(false);
    }
  };

  // Surveiller les changements d'URL pour auto-fetch du titre
  useEffect(() => {
    if (url && url.trim() !== '') {
      const timeoutId = setTimeout(() => {
        fetchTitleFromUrl(url);
      }, 800); // Attendre 800ms après la saisie pour éviter trop de requêtes

      return () => clearTimeout(timeoutId);
    } else {
      setTitlePlaceholder('Titre de la vidéo');
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !category) {
      setError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const platform = detectPlatform(url);
      const res = await apiFetch('/api/contents', {
        method: 'POST',
        body: JSON.stringify({ title, url, category, description, type: 'video', platform })
      });
      if (!res.ok) throw new Error(await res.text());
      const newItem = await res.json();
      onSave(newItem);
      // Reset form
      setTitle('');
      setUrl('');
      setCategory('');
      setDescription('');
      setTitlePlaceholder('Titre de la vidéo');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-md rounded-xl p-6 relative z-10 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Video size={20} className="text-purple-400" /> Ajouter une vidéo</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL * (Collez l'URL en premier)</label>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-2">
                  Titre *
                  {fetchingTitle && (
                    <span className="text-xs text-amber-400 animate-pulse">⏳ Récupération...</span>
                  )}
                </label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={titlePlaceholder} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Catégorie *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description (optionnel)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" rows={3} />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded flex items-center justify-center gap-2">
                  {loading ? 'Création...' : <><Plus size={18} /> Créer</>}
                </button>
              </div>
          </form>
      </div>
    </div>
  );
};

// Modale pour ajouter une note
const AddNoteModal = ({ isOpen, categories, onClose, onSave }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/contents', {
        method: 'POST',
        body: JSON.stringify({
          title,
          url: `note://${Date.now()}`, // URL fictive pour les notes
          category,
          description: content,
          type: 'article',
          platform: 'other'
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const newItem = await res.json();
      onSave(newItem);
      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-4xl rounded-xl p-6 relative z-10 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-amber-400" /> Ajouter une note</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Infos */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Titre *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la note" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Catégorie *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Annuler</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded flex items-center justify-center gap-2">
                    {loading ? 'Création...' : <><Plus size={18} /> Créer</>}
                  </button>
                </div>
              </div>
              {/* Colonne droite - Contenu */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contenu de la note *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Écrivez votre note ici..."
                  className="w-full h-64 bg-black/30 border border-white/10 rounded p-3 text-white resize-none"
                  required
                />
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};

// Modale pour modifier une note (2 colonnes)
const EditNoteModal = ({ isOpen, item, categories, onClose, onSave }: any) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setContent(item.description || '');
      setCategory(item.category || '');
      setError('');
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/contents/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, category, description: content })
      });
      if (!res.ok) throw new Error(await res.text());
      await onSave({ ...item, title, category, description: content });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-4xl rounded-xl p-6 relative z-10 border border-white/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-amber-400" /> Modifier la note</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Infos */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Titre *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la note" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Catégorie *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">Annuler</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded">
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
              {/* Colonne droite - Contenu */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contenu de la note *</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Écrivez votre note ici..."
                  className="w-full h-64 bg-black/30 border border-white/10 rounded p-3 text-white resize-none"
                  required
                />
              </div>
            </div>
          </form>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const userData = await res.json();
      onLogin(userData);
      onClose();
    } catch (err: any) {
      setError('Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="glass-panel w-full max-w-md rounded-xl p-6 relative z-10 border border-white/20">
          <h3 className="text-lg font-bold mb-4">Connexion Admin</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" required />
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded">{loading ? 'Connexion...' : 'Se connecter'}</button>
          </form>
      </div>
    </div>
  );
};

// --- USERS MANAGEMENT MODAL ---
const UsersManagementModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'admin' });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ email: '', password: '', role: 'admin' });
        setShowAddForm(false);
        loadUsers();
      } else {
        const error = await res.json();
        alert('Erreur: ' + (error.error || 'Impossible de créer l\'utilisateur'));
      }
    } catch (err) {
      console.error('Add user error:', err);
      alert('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      const res = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[80vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">👥 Gestion des Utilisateurs</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Ajouter un utilisateur
          </button>

          {showAddForm && (
            <form onSubmit={handleAddUser} className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                    Créer
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-8">Chargement...</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Rôle: <span className="text-amber-300">{user.role}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-gray-400 text-center py-4">Aucun utilisateur</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CATEGORIES MANAGEMENT MODAL ---
const CategoriesManagementModal = ({ isOpen, onClose, categories, onUpdate }: { isOpen: boolean; onClose: () => void; categories: Category[]; onUpdate: () => void }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '', label: '', icon: 'Music' });

  const iconOptions = ['Music', 'Play', 'Sparkles', 'Film', 'TrendingUp', 'Heart', 'Star', 'BookOpen', 'Headphones', 'Mic', 'Radio', 'Disc', 'Target', 'Zap', 'Award', 'Compass', 'Globe', 'Sun'];
  const iconMap: Record<string, any> = { Music, Play, Sparkles, Film, TrendingUp, Heart, Star, BookOpen, Headphones, Mic, Radio, Disc, Target, Zap, Award, Compass, Globe, Sun };

  // Fonction pour nettoyer et générer l'ID automatiquement
  const cleanId = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]/g, '') // Supprime tous les caractères spéciaux
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({ id: '', label: '', icon: 'Music' });
        setShowAddForm(false);
        setEditingId(null);
        onUpdate();
      } else {
        const error = await res.json();
        alert('Erreur: ' + (error.error || 'Impossible de sauvegarder'));
      }
    } catch (err) {
      console.error('Save category error:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    try {
      const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onUpdate();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  const startEdit = (cat: Category) => {
    setFormData({ id: cat.id, label: cat.label, icon: cat.icon });
    setEditingId(cat.id);
    setShowAddForm(true);
    // Scroll vers le haut pour voir le formulaire
    setTimeout(() => {
      const modal = document.querySelector('[data-modal="categories"]');
      if (modal) {
        modal.scrollTop = 0;
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[80vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">📂 Gestion des Catégories</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]" data-modal="categories">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({ id: '', label: '', icon: 'Music' });
            }}
            className="mb-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Ajouter une catégorie
          </button>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nom de la catégorie</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      const id = editingId || cleanId(label);
                      setFormData({ ...formData, label, id });
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white"
                    placeholder="ex: Musique Méditation"
                  />
                  {formData.label && (
                    <p className="text-xs text-gray-400 mt-1">
                      ID généré: <span className="text-purple-400 font-mono">{formData.id || cleanId(formData.label)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Icône</label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      const isSelected = formData.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                              : 'border-white/10 bg-black/20 hover:border-purple-400/50 hover:bg-purple-500/10'
                          }`}
                          title={iconName}
                        >
                          <IconComponent size={24} className={isSelected ? 'text-purple-300' : 'text-gray-400'} />
                        </button>
                      );
                    })}
                  </div>
                  {formData.icon && (
                    <p className="text-xs text-gray-400 mt-2">
                      Icône sélectionnée: <span className="text-purple-400">{formData.icon}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                    {editingId ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({ id: '', label: '', icon: 'Music' });
                    }}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || Music;
              return (
                <div key={cat.id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center">
                      <IconComponent size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{cat.label}</p>
                      <p className="text-xs text-gray-400">ID: {cat.id} • Icône: {cat.icon}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS MODAL (Superadmin only) ---
const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [previewFont, setPreviewFont] = useState('Inter');
  const [originalFont, setOriginalFont] = useState('Inter');
  const [loading, setLoading] = useState(false);

  const fonts = [
    { value: 'Inter', label: 'Inter', category: 'Sans-Serif' },
    { value: 'Roboto', label: 'Roboto', category: 'Sans-Serif' },
    { value: 'Open Sans', label: 'Open Sans', category: 'Sans-Serif' },
    { value: 'Lato', label: 'Lato', category: 'Sans-Serif' },
    { value: 'Montserrat', label: 'Montserrat', category: 'Sans-Serif' },
    { value: 'Poppins', label: 'Poppins', category: 'Sans-Serif' },
    { value: 'Raleway', label: 'Raleway', category: 'Sans-Serif' },
    { value: 'Ubuntu', label: 'Ubuntu', category: 'Sans-Serif' },
    { value: 'Nunito', label: 'Nunito', category: 'Sans-Serif' },
    { value: 'Work Sans', label: 'Work Sans', category: 'Sans-Serif' },
    { value: 'Quicksand', label: 'Quicksand', category: 'Sans-Serif' },
    { value: 'Josefin Sans', label: 'Josefin Sans', category: 'Sans-Serif' },
    { value: 'DM Sans', label: 'DM Sans', category: 'Sans-Serif' },
    { value: 'Space Grotesk', label: 'Space Grotesk', category: 'Sans-Serif' },
    { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
    { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
    { value: 'Lora', label: 'Lora', category: 'Serif' },
    { value: 'PT Serif', label: 'PT Serif', category: 'Serif' },
    { value: 'Crimson Text', label: 'Crimson Text', category: 'Serif' },
    { value: 'EB Garamond', label: 'EB Garamond', category: 'Serif' },
    { value: 'Libre Baskerville', label: 'Libre Baskerville', category: 'Serif' },
    { value: 'Indie Flower', label: 'Indie Flower', category: 'Handwriting' },
    { value: 'Dancing Script', label: 'Dancing Script', category: 'Handwriting' },
    { value: 'Pacifico', label: 'Pacifico', category: 'Handwriting' },
    { value: 'Caveat', label: 'Caveat', category: 'Handwriting' },
    { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
    { value: 'Courier Prime', label: 'Courier Prime', category: 'Monospace' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Charger Google Fonts dynamiquement
  useEffect(() => {
    if (!isOpen) return;

    const link = document.getElementById('google-fonts-settings') as HTMLLinkElement;
    const fontUrls = fonts.map(f => f.value.replace(/ /g, '+')).join('|');

    if (!link) {
      const newLink = document.createElement('link');
      newLink.id = 'google-fonts-settings';
      newLink.rel = 'stylesheet';
      newLink.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.value.replace(/ /g, '+')}`).join('&')}&display=swap`;
      document.head.appendChild(newLink);
    }
  }, [isOpen]);

  // Appliquer la police en temps réel sur toute la plateforme
  useEffect(() => {
    if (previewFont && isOpen) {
      applyFontGlobally(previewFont);
    }
  }, [previewFont, isOpen]);

  const loadSettings = async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const font = data.selectedFont || 'Inter';
        setSelectedFont(font);
        setPreviewFont(font);
        setOriginalFont(font);
      }
    } catch (err) {
      console.error('Load settings error:', err);
    }
  };

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    setPreviewFont(fontValue);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('💾 Saving font:', selectedFont);
      console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL || '/spirit'}/api/settings`);
      console.log('Request body:', JSON.stringify({ selectedFont }));

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 10s')), 10000)
      );

      const fetchPromise = apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ selectedFont })
      });

      const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      console.log('Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Save successful:', data);
        setOriginalFont(selectedFont);
        alert('Paramètres sauvegardés avec succès!');
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Save failed:', res.status, errorData);
        alert(`Erreur lors de la sauvegarde: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('💥 Save settings error:', err);
      alert(`Erreur lors de la sauvegarde: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Remettre la police d'origine
    setPreviewFont(originalFont);
    applyFontGlobally(originalFont);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80" onClick={handleCancel}>
      <div className="w-full max-w-5xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">⚙️ Paramètres - Police de caractères</h2>
          <button onClick={handleCancel} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des polices */}
            <div>
              <label className="block text-sm text-gray-300 mb-3 font-medium">Choisissez une police</label>
              <div className="bg-black/20 border border-white/10 rounded-lg p-3 max-h-[500px] overflow-y-auto">
                <div className="space-y-2">
                  {fonts.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => handleFontChange(font.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedFont === font.value
                          ? 'bg-purple-600 border-2 border-purple-400 shadow-lg'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-purple-500/30'
                      }`}
                      style={{ fontFamily: `"${font.value}", sans-serif` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-lg">{font.label}</p>
                          <p className="text-xs text-gray-400">{font.category}</p>
                        </div>
                        {selectedFont === font.value && (
                          <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aperçu en temps réel */}
            <div>
              <label className="block text-sm text-gray-300 mb-3 font-medium">Aperçu en temps réel</label>
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 sticky top-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      LOOOKAA SPIRIT
                    </h3>
                    <p className="text-gray-300 text-lg" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      Plateforme de partage spirituel
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-white text-base mb-2" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      Cette police s'applique à toute la plateforme en temps réel.
                    </p>
                    <p className="text-gray-400 text-sm" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      Vous pouvez voir l'aperçu directement sur l'interface pendant que vous naviguez entre les différentes polices.
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-purple-300 font-semibold" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      Police sélectionnée :
                    </p>
                    <p className="text-white text-xl font-bold mt-1" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      {selectedFont}
                    </p>
                  </div>

                  <div className="bg-black/30 rounded p-4 border border-white/10">
                    <p className="text-xs text-gray-400 mb-2" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      Exemple de texte :
                    </p>
                    <p className="text-white" style={{ fontFamily: `"${previewFont}", sans-serif` }}>
                      AaBbCcDdEeFfGgHhIiJjKkLl<br/>
                      MmNnOoPpQqRrSsTtUuVvWwXxYyZz<br/>
                      0123456789
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-all"
            >
              {loading ? 'Sauvegarde en cours...' : '💾 Sauvegarder les paramètres'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
const App = () => {
  const [user, setUser] = useState<User>({ email: 'guest', isAuthenticated: false, role: 'user' });
  const [items, setItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaMode, setMediaMode] = useState<'video' | 'article'>('video'); // Mode Vidéos ou Notes
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; platform: string; title: string } | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null);
  const [aliveMap, setAliveMap] = useState<Record<string, boolean>>({});
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      let currentUser: User = { email: 'guest', isAuthenticated: false, role: 'user' };
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await apiFetch('/api/me');
          if (res.ok) {
            const profile = await res.json();
            // Ensure we use the role from the server response
            currentUser = {
              email: profile.email,
              isAuthenticated: true,
              role: profile.role || 'admin',
              id: profile.id
            };
            console.log('Auth check successful:', currentUser);
          } else {
            // Only remove token if we get a 401/403 (unauthorized), not for other errors
            if (res.status === 401 || res.status === 403) {
              console.log('Token invalid (status ' + res.status + '), removing...');
              localStorage.removeItem('authToken');
            } else {
              console.log('Auth check failed with status', res.status, 'but keeping token');
              // Try to decode token to get role (JWT payload is base64)
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                currentUser = {
                  email: payload.sub || 'admin',
                  isAuthenticated: true,
                  role: payload.role || 'superadmin'
                };
                console.log('Restored user from token:', currentUser);
              } catch {
                currentUser = { email: 'admin', isAuthenticated: true, role: 'superadmin' };
              }
            }
          }
        } catch (e) {
          console.error("Auth check failed with network error:", e);
          // Keep the token on network errors - don't disconnect the user
          // Try to decode token to get role
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUser = {
              email: payload.sub || 'admin',
              isAuthenticated: true,
              role: payload.role || 'superadmin'
            };
            console.log('Restored user from token (network error):', currentUser);
          } catch {
            currentUser = { email: 'admin', isAuthenticated: true, role: 'superadmin' };
          }
        }
      }
      setUser(currentUser);

      // Load data regardless of auth status
      try {
        const [contentsRes, categoriesRes, settingsRes] = await Promise.all([
          apiFetch('/api/contents'),
          apiFetch('/api/categories'),
          apiFetch('/api/settings')
        ]);
        if (contentsRes.ok) setItems(await contentsRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (settingsRes.ok) {
            const settings = await settingsRes.json();
            const selectedFont = settings.selectedFont || 'Inter';
            // Appliquer la police sauvegardée de manière globale
            applyFontGlobally(selectedFont);
            console.log('Police appliquée au chargement:', selectedFont);
        }
      } catch (e) { console.error("Failed to load initial data", e); }
    };
    checkAuthAndLoadData();
  }, []);

  // Effect to check for dead video links in parallel batches for performance
  useEffect(() => {
    const checkLinksInBatches = async () => {
      const videosToCheck = items.filter(item => item.type === 'video' && aliveMap[item.id] === undefined);
      if (videosToCheck.length === 0) return;

      console.log(`[DeadLinksCheck] Checking ${videosToCheck.length} videos for dead links`);
      const BATCH_SIZE = 5; // Process 5 videos concurrently

      for (let i = 0; i < videosToCheck.length; i += BATCH_SIZE) {
        const batch = videosToCheck.slice(i, i + BATCH_SIZE);
        
        const promises = batch.map(item => 
          apiFetch('/api/validate-url', {
            method: 'POST',
            body: JSON.stringify({ url: item.url }),
          })
          .then(res => {
            if (!res.ok) {
              console.log(`[DeadLinksCheck] Validation API error for ${item.url}: ${res.status}`);
              return { alive: true }; // Assume alive on HTTP error
            }
            return res.json();
          })
          .then(result => {
            const alive = result.alive !== false;
            console.log(`[DeadLinksCheck] ${item.url}: ${alive ? '✓ ALIVE' : '✗ DEAD'}`);
            return ({ id: item.id, alive });
          })
          .catch((err) => {
            console.error(`[DeadLinksCheck] Error checking ${item.url}:`, err);
            return ({ id: item.id, alive: true }); // Assume alive on network error
          })
        );

        const results = await Promise.all(promises);
        
        const batchAliveMap = results.reduce((acc, result) => {
          acc[result.id] = result.alive;
          return acc;
        }, {} as Record<string, boolean>);

        console.log(`[DeadLinksCheck] Batch results:`, batchAliveMap);
        // Update state immediately after each batch for progressive feedback
        setAliveMap(prev => ({ ...prev, ...batchAliveMap }));
      }
    };

    // Run check a little after initial load to not block UI
    const timer = setTimeout(checkLinksInBatches, 500);
    return () => clearTimeout(timer);
  }, [items]);

  const handleLogin = (userData: any) => {
    localStorage.setItem('authToken', userData.token);
    setUser({ ...userData, isAuthenticated: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser({ email: 'guest', isAuthenticated: false, role: 'user' });
  };

  const getCategoryLabel = (categoryId: string) => categories.find(c => c.id === categoryId)?.label || categoryId;

  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Filtrer par MODE (video ou article)
    result = result.filter(item => item.type === mediaMode);

    // 2. Filtrer par CATÉGORIE (si pas "all")
    if (activeFilter !== 'all') {
      result = result.filter(item => item.category === activeFilter);
    }

    // 3. Filtrer par recherche texte
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(it => it.title.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q));
    }

    // 4. Filter out dead links (uniquement pour les vidéos)
    result = result.filter(item => item.type !== 'video' || aliveMap[item.id] !== false);

    return result;
  }, [items, mediaMode, activeFilter, searchQuery, aliveMap]);

  return (
    <div className="min-h-screen pb-20 relative">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]"></div>
        </div>

        <Header
            user={user}
            onLogout={handleLogout}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onOpenUsers={() => setIsUsersModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenCategories={() => setIsCategoriesModalOpen(true)}
            categories={categories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            mediaMode={mediaMode}
            setMediaMode={setMediaMode}
        />

        <main className="max-w-7xl mx-auto px-4">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredItems.map(item => (
                    <ContentCard
                        key={item.id}
                        item={item}
                        user={user}
                        onOpenVideo={(url: string, platform: string, title: string) => {
                          setSelectedVideo({ url, platform, title });
                        }}
                        onOpenNote={(title: string, content: string) => {
                          setSelectedArticle({ title, content });
                        }}
                        onEdit={user.isAuthenticated ? (item: ContentItem) => {
                          setItemToEdit(item);
                        } : undefined}
                        onDelete={user.isAuthenticated ? async (id: string) => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cet élément?')) {
                            try {
                              const res = await apiFetch(`/api/contents/${id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setItems(items.filter(i => i.id !== id));
                              }
                            } catch (err) {
                              console.error('Delete error:', err);
                            }
                          }
                        } : undefined}
                        getCategoryLabel={getCategoryLabel}
                    />
                ))}
            </div>
        </main>
        
        <VideoModal
          isOpen={!!selectedVideo}
          videoUrl={selectedVideo?.url || ''}
          platform={selectedVideo?.platform || 'other'}
          title={selectedVideo?.title || ''}
          onClose={() => setSelectedVideo(null)}
        />

        <ArticleModal
          isOpen={!!selectedArticle}
          title={selectedArticle?.title || ''}
          content={selectedArticle?.content || ''}
          onClose={() => setSelectedArticle(null)}
        />

        {/* Modale d'édition - utilise EditNoteModal pour les articles, EditVideoModal pour les vidéos */}
        <EditVideoModal
          isOpen={!!itemToEdit && itemToEdit.type === 'video'}
          item={itemToEdit}
          categories={categories}
          onClose={() => setItemToEdit(null)}
          onSave={(updatedItem: ContentItem) => {
            setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
          }}
        />

        <EditNoteModal
          isOpen={!!itemToEdit && itemToEdit.type === 'article'}
          item={itemToEdit}
          categories={categories}
          onClose={() => setItemToEdit(null)}
          onSave={(updatedItem: ContentItem) => {
            setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
          }}
        />

        {/* Modales d'ajout */}
        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          categories={categories}
          onClose={() => setIsAddVideoModalOpen(false)}
          onSave={(newItem: ContentItem) => {
            setItems([newItem, ...items]);
          }}
        />

        <AddNoteModal
          isOpen={isAddNoteModalOpen}
          categories={categories}
          onClose={() => setIsAddNoteModalOpen(false)}
          onSave={(newItem: ContentItem) => {
            setItems([newItem, ...items]);
          }}
        />

        <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={handleLogin} />

        <UsersManagementModal
          isOpen={isUsersModalOpen}
          onClose={() => setIsUsersModalOpen(false)}
        />

        <CategoriesManagementModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          categories={categories}
          onUpdate={async () => {
            const res = await apiFetch('/api/categories');
            if (res.ok) {
              const data = await res.json();
              setCategories(data);
            }
          }}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        {/* Boutons flottants d'ajout (visibles uniquement si connecté) */}
        {user.isAuthenticated && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {mediaMode === 'video' ? (
              <button
                onClick={() => setIsAddVideoModalOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-110 transition-all flex items-center justify-center"
                title="Ajouter une vidéo"
              >
                <Plus size={28} />
              </button>
            ) : (
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 hover:scale-110 transition-all flex items-center justify-center"
                title="Ajouter une note"
              >
                <Plus size={28} />
              </button>
            )}
          </div>
        )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
