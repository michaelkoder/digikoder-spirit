const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./db_json.cjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Log ALL incoming requests
app.use((req, res, next) => {
  console.log(`\n🌐 INCOMING REQUEST: ${req.method} ${req.path}`);
  console.log('   Headers:', Object.keys(req.headers).join(', '));
  console.log('   Body:', req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : 'N/A');
  next();
});

// JWT Secret - same as in Vercel API for consistency
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// ============ SETTINGS DATABASE FUNCTIONS ============

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

const ensureSettingsFile = () => {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      selectedFont: 'Inter',
      categories: []
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
};

const readDb = () => {
  ensureSettingsFile();
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeDb = (data) => {
  ensureSettingsFile();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
};

// ============ AUTHENTICATION MIDDLEWARE ============

// JWT-based auth middleware (consistent with Vercel API)
const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    console.log('[AuthMiddleware] 🔐 START -', req.method, req.path);
    try {
      const authHeader = req.headers.authorization;
      console.log('[AuthMiddleware] 🔑 Auth header:', authHeader ? 'present' : 'missing');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AuthMiddleware] ❌ No Bearer token');
        return res.status(401).json({ error: 'Non autorisé - Token manquant' });
      }

      const token = authHeader.substring(7);
      console.log('[AuthMiddleware] 🎫 Token extracted, length:', token.length);

      // Verify JWT token
      let payload;
      try {
        console.log('[AuthMiddleware] 🔍 Verifying JWT...');
        payload = jwt.verify(token, JWT_SECRET);
        console.log('[AuthMiddleware] ✅ JWT verified, user:', payload.sub);
      } catch (jwtErr) {
        console.log('[AuthMiddleware] ❌ JWT verification failed:', jwtErr.message);
        return res.status(401).json({ error: 'Non autorisé - Token invalide ou expiré' });
      }

      // Get user from database using email from JWT
      console.log('[AuthMiddleware] 📂 Loading user from DB...');
      const user = db.getUserByEmail(payload.sub);
      console.log('[AuthMiddleware] 👤 User found:', user ? user.email : 'NOT FOUND');

      if (!user) {
        console.log('[AuthMiddleware] ❌ User not found in DB');
        return res.status(401).json({ error: 'Non autorisé - Utilisateur introuvable' });
      }

      // Check role if required
      if (requiredRole && user.role !== requiredRole && user.role !== 'superadmin') {
        console.log('[AuthMiddleware] ❌ Insufficient permissions');
        return res.status(403).json({ error: 'Accès refusé - Permissions insuffisantes' });
      }

      // Attach user info to request
      req.user = { id: user.id, email: user.email, role: user.role };
      console.log('[AuthMiddleware] ✅ SUCCESS - Calling next()');
      next();
    } catch (e) {
      console.error('[AuthMiddleware] 💥 ERROR:', e);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

// Generate JWT token (consistent with Vercel API)
const generateToken = (email, role) => {
  return jwt.sign({ sub: email, role: role }, JWT_SECRET, { expiresIn: '8h' });
};

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

app.get('/api/contents', (req, res) => {
  const rows = db.getContents();
  res.json(rows.map(r => ({
    id: String(r.id),
    title: r.title,
    url: r.url,
    type: r.type,
    platform: r.platform,
    category: r.category,
    description: r.description,
    keywords: r.keywords || [],
    addedBy: r.owner || 'unknown',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString() : ''
  })));
});

app.post('/api/contents', authMiddleware('admin'), (req, res) => {
  try {
    const { title, url, type, platform, category, description, keywords } = req.body;

    // Validation
    if (!title || !url) {
      return res.status(400).json({ error: 'Titre et URL requis' });
    }

    const item = {
      title,
      url,
      type,
      platform,
      category,
      description,
      keywords: keywords || [],
      owner: req.user.email // Use authenticated user's email
    };

    const inserted = db.insertContent(item);
    res.json({
      id: String(inserted.id),
      title: inserted.title,
      url: inserted.url,
      type: inserted.type,
      platform: inserted.platform,
      category: inserted.category,
      description: inserted.description,
      keywords: inserted.keywords || [],
      addedBy: inserted.owner || 'unknown',
      date: inserted.created_at ? new Date(inserted.created_at).toLocaleDateString() : ''
    });
  } catch (e) {
    console.error('Create content error:', e);
    res.status(500).json({ error: 'Erreur lors de la création du contenu' });
  }
});

app.put('/api/contents/:id', authMiddleware('admin'), (req, res) => {
  try {
    const id = req.params.id;
    const content = db.getContentById(id);

    if (!content) {
      return res.status(404).json({ error: 'Contenu introuvable' });
    }

    // Only superadmin or content owner can update
    if (req.user.role !== 'superadmin' && content.owner !== req.user.email) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre contenu' });
    }

    const updated = db.updateContent(id, req.body);
    res.json({
      id: String(updated.id),
      title: updated.title,
      url: updated.url,
      type: updated.type,
      platform: updated.platform,
      category: updated.category,
      description: updated.description,
      keywords: updated.keywords || [],
      addedBy: updated.owner || 'unknown',
      date: updated.created_at ? new Date(updated.created_at).toLocaleDateString() : ''
    });
  } catch (e) {
    console.error('Update content error:', e);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/contents/:id', authMiddleware('admin'), (req, res) => {
  try {
    const id = req.params.id;
    const content = db.getContentById(id);

    if (!content) {
      return res.status(404).json({ error: 'Contenu introuvable' });
    }

    // Only superadmin or content owner can delete
    if (req.user.role !== 'superadmin' && content.owner !== req.user.email) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que votre propre contenu' });
    }

    const ok = db.deleteContent(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete content error:', e);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

app.get('/api/profiles', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email required' });
  const row = db.getProfileByEmail(email);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json({ email: row.email, role: row.role });
});

// ============ AUTHENTICATION & USER MANAGEMENT ============

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await db.validatePassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Generate JWT token (consistent with Vercel API)
    const token = generateToken(user.email, user.role);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      token,
      isAuthenticated: true
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get current user endpoint (verify JWT and return user info)
app.get('/api/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non autorisé - Token manquant' });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      console.log('JWT verification failed:', jwtErr.message);
      return res.status(401).json({ error: 'Non autorisé - Token invalide ou expiré' });
    }

    // Get user from database
    const user = db.getUserByEmail(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Non autorisé - Utilisateur introuvable' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (e) {
    console.error('Get me error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Logout endpoint (JWT-based, just return OK - client will remove token)
app.post('/api/logout', (req, res) => {
  // With JWT, we don't need to track sessions server-side
  // The client simply removes the token from localStorage
  res.json({ ok: true });
});

// Get all users (superadmin only)
app.get('/api/users', authMiddleware('superadmin'), (req, res) => {
  try {
    const users = db.getUsers().map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json(users);
  } catch (e) {
    console.error('Get users error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create user (superadmin only)
app.post('/api/users', authMiddleware('superadmin'), async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const user = await db.createUser(email, password, role);
    res.json(user);
  } catch (e) {
    if (e.message === 'User already exists') {
      return res.status(409).json({ error: 'Cet email existe déjà' });
    }
    console.error('Create user error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete user (superadmin only)
app.delete('/api/users/:id', authMiddleware('superadmin'), (req, res) => {
  try {
    const id = req.params.id;

    // Prevent deleting yourself
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const ok = db.deleteUser(id);
    if (!ok) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============ FACEBOOK EMBED ============
app.get('/api/fb/embed', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });


    const headers = {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    };
    const r = await fetch(url, { redirect: 'follow', headers });
    const finalUrl = r.url || url;
    const html = await r.text().catch(() => '');

    // Try to extract canonical from og:url or link rel="canonical"
    let canonical = null;
    const m1 = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
    if (m1 && m1[1]) canonical = m1[1];
    if (!canonical) {
      const m2 = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      if (m2 && m2[1]) canonical = m2[1];
    }
    const href = canonical || finalUrl;

    // Attempt to extract a numeric video id from HTML for a more reliable embed
    const findVideoId = (txt) => {
      if (!txt) return null;
      let m;
      m = txt.match(/\"video_id\":\"(\d{5,})\"/); // "video_id":"123456"
      if (m && m[1]) return m[1];
      m = txt.match(/\"videoID\":\"(\d{5,})\"/); // "videoID":"123456"
      if (m && m[1]) return m[1];
      m = txt.match(/[?&]v=(\d{5,})/); // watch?v=123456
      if (m && m[1]) return m[1];
      // sometimes og:video:url contains video.php?v=ID
      const mv = txt.match(/<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["']/i);
      if (mv && mv[1]) {
        const mv2 = mv[1].match(/[?&]v=(\d{5,})/);
        if (mv2 && mv2[1]) return mv2[1];
      }
      return null;
    };
    const videoId = findVideoId(html);

    // Si on a un videoId fiable, préférer un lien watch/?v=ID pour l'embed
    let embedHref = href;
    let endpointHint = null;
    if (videoId) {
      embedHref = `https://www.facebook.com/watch/?v=${videoId}`;
      endpointHint = 'video';
    }

    // Choose endpoint: prefer hint if present; otherwise reels/posts -> post.php, else video.php
    const endpoint = endpointHint || ( /\/(reel|posts)\//i.test(embedHref) ? 'post' : 'video' );

    return res.json({ embedHref, endpoint });
  } catch (e) {
    return res.status(500).json({ error: 'resolve_failed' });
  }
});

// ============ URL VALIDATION & METADATA ============

// Validate URL is accessible (avoids CORS on client)
app.post('/api/check-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required', ok: false });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeoutId);
      return res.json({ ok: response.ok || response.status === 0, status: response.status });
    } catch (e) {
      clearTimeout(timeoutId);
      // Try GET as fallback
      try {
        const response = await fetch(url, { 
          method: 'GET',
          signal: controller.signal,
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
        clearTimeout(timeoutId);
        return res.json({ ok: response.ok, status: response.status });
      } catch (e2) {
        clearTimeout(timeoutId);
        return res.json({ ok: false, status: 0, error: e2.message });
      }
    }
  } catch (e) {
    console.error('check-url error:', e);
    return res.status(500).json({ error: 'server error', ok: false });
  }
});

// Helper function to clean and decode HTML entities in titles
function cleanTitle(rawTitle) {
  if (!rawTitle) return null;

  let cleaned = rawTitle;

  // Decode HTML entities (&#xa0; &#xe9; etc.)
  cleaned = cleaned
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Remove Facebook stats (views, reactions) - pattern: "1,2 M vues · 44 K réactions |"
  cleaned = cleaned.replace(/^[\d\s,\.]+[KMB]?\s*(vues?|views?|reactions?|réactions?|partages?|shares?|commentaires?|comments?)[\s·•|]*/gi, '');
  cleaned = cleaned.replace(/[\s·•|]+[\d\s,\.]+[KMB]?\s*(vues?|views?|reactions?|réactions?|partages?|shares?|commentaires?|comments?)[\s·•|]*/gi, '');

  // Remove multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove leading/trailing pipes and separators
  cleaned = cleaned.replace(/^[\s|·•-]+|[\s|·•-]+$/g, '').trim();

  return cleaned || null;
}

// Fetch title and thumbnail from URL (avoids CORS on client)
app.post('/api/fetch-title', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required', title: null, thumbnail: null });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    let title = null;
    let thumbnail = null;

    try {
      // Try YouTube oEmbed
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
          const response = await fetch(oembedUrl, {
            signal: controller.signal,
            headers: { 'user-agent': 'Mozilla/5.0' }
          });
          if (response.ok) {
            const data = await response.json().catch(() => null);
            if (data) {
              title = cleanTitle(data.title) || null;
              thumbnail = data.thumbnail_url || null;
              clearTimeout(timeoutId);
              return res.json({ title, thumbnail, source: 'youtube-oembed' });
            }
          }
        } catch (e) {
          console.error('YouTube oEmbed error:', e);
        }
      }

      // Try Instagram Graph API oEmbed (public endpoint)
      if (url.includes('instagram.com')) {
        try {
          // Instagram oEmbed endpoint (without access token for public posts)
          const oembedUrl = `https://graph.facebook.com/v12.0/instagram_oembed?url=${encodeURIComponent(url)}&omitscript=true`;
          const response = await fetch(oembedUrl, {
            signal: controller.signal,
            headers: { 'user-agent': 'Mozilla/5.0' }
          });
          if (response.ok) {
            const data = await response.json().catch(() => null);
            if (data) {
              title = cleanTitle(data.title || data.author_name) || null;
              thumbnail = data.thumbnail_url || null;
              if (title || thumbnail) {
                clearTimeout(timeoutId);
                return res.json({ title, thumbnail, source: 'instagram-oembed' });
              }
            }
          }
        } catch (e) {
          console.error('Instagram oEmbed error:', e);
        }
      }

      // Try Facebook oEmbed
      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'user-agent': 'Mozilla/5.0' },
            redirect: 'follow'
          });
          if (response.ok) {
            const html = await response.text().catch(() => '');
            // Extract og:image for thumbnail
            const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            if (imgMatch && imgMatch[1]) thumbnail = imgMatch[1];
            // Extract og:title
            const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
            if (titleMatch && titleMatch[1]) title = cleanTitle(titleMatch[1]) || null;
          }
        } catch (e) {
          console.error('Facebook metadata error:', e);
        }
      }

      // Fallback: fetch HTML and parse meta tags
      if (!title || !thumbnail) {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const html = await response.text().catch(() => '');

          // Extract thumbnail if not found
          if (!thumbnail) {
            let match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            if (match && match[1]) thumbnail = match[1];
          }

          // Extract title if not found
          if (!title) {
            // Try og:title
            let match = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
            if (match && match[1]) {
              title = cleanTitle(match[1]) || null;
            } else {
              // Try twitter:title
              match = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
              if (match && match[1]) {
                title = cleanTitle(match[1]) || null;
              } else {
                // Try <title> tag
                match = html.match(/<title>([^<]+)<\/title>/i);
                if (match && match[1]) {
                  title = cleanTitle(match[1]) || null;
                }
              }
            }
          }
        }
      }

      clearTimeout(timeoutId);
      return res.json({ title, thumbnail, source: 'html-parsing' });

    } catch (e) {
      clearTimeout(timeoutId);
      console.error('fetch-title final error:', e);
      return res.json({ title: null, thumbnail: null, error: e.message, source: 'error' });
    }
  } catch (e) {
    console.error('fetch-title error:', e);
    return res.status(500).json({ error: 'server error', title: null, thumbnail: null });
  }
});

// Fetch media metadata: width/height/aspect/orientation
app.post('/api/media-meta', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required' });
    }

    const result = { width: null, height: null, aspectRatio: null, orientation: null };

    const setOrientation = () => {
      if (result.width && result.height) {
        const w = Number(result.width);
        const h = Number(result.height);
        if (w > 0 && h > 0) {
          result.aspectRatio = Number((w / h).toFixed(3));
          result.orientation = w >= h ? 'landscape' : 'portrait';
        }
      }
    };

    // Try YouTube oEmbed
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oembedUrl, { headers: { 'user-agent': 'Mozilla/5.0' } });
        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data && data.thumbnail_width && data.thumbnail_height) {
            result.width = data.thumbnail_width;
            result.height = data.thumbnail_height;
            setOrientation();
          }
        }
      }
    } catch (e) {}

    // Try Instagram api (if accessible) for media info
    try {
      if (!result.orientation && url.includes('instagram.com')) {
        const apiUrl = `https://www.instagram.com/api/v1/media/from_url/?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl, { headers: { 'user-agent': 'Mozilla/5.0', 'accept': 'application/json' } });
        if (response.ok) {
          const data = await response.json().catch(() => null);
          if (data && data.media) {
            const m = data.media;
            if (m.original_width && m.original_height) {
              result.width = m.original_width;
              result.height = m.original_height;
              setOrientation();
            }
          }
        }
      }
    } catch (e) {}

    // Fallback: fetch HTML and parse og:video:width/height or og:image width/height
    try {
      if (!result.orientation) {
        const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, redirect: 'follow' });
        if (response.ok) {
          const html = await response.text().catch(() => '');
          const wMeta = html.match(/<meta[^>]+property=["']og:video:width["'][^>]+content=["'](\d+)["']/i) || html.match(/<meta[^>]+property=["']og:image:width["'][^>]+content=["'](\d+)["']/i);
          const hMeta = html.match(/<meta[^>]+property=["']og:video:height["'][^>]+content=["'](\d+)["']/i) || html.match(/<meta[^>]+property=["']og:image:height["'][^>]+content=["'](\d+)["']/i);
          if (wMeta && wMeta[1] && hMeta && hMeta[1]) {
            result.width = Number(wMeta[1]);
            result.height = Number(hMeta[1]);
            setOrientation();
          }
        }
      }
    } catch (e) {}

    // As a last resort, infer from URL path patterns
    if (!result.orientation) {
      const u = new URL(url);
      const path = u.pathname.toLowerCase();
      if (path.includes('/reel/') || path.includes('/shorts/')) {
        result.orientation = 'portrait';
        result.aspectRatio = 9/16;
      } else {
        result.orientation = 'landscape';
        result.aspectRatio = 16/9;
      }
    }

    return res.json(result);
  } catch (e) {
    console.error('media-meta error:', e);
    return res.status(500).json({ error: 'server error' });
  }
});

// Get Instagram embed HTML via oEmbed API
app.post('/api/instagram-embed', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required' });
    }

    // Use Instagram's oEmbed API
    const oembedUrl = `https://graph.facebook.com/v12.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=&omitscript=true`;
    
    try {
      const response = await fetch(oembedUrl, {
        headers: { 'user-agent': 'Mozilla/5.0' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.html) {
          return res.json({ html: data.html, success: true });
        }
      }
    } catch (e) {
      console.error('Instagram oEmbed error:', e);
    }

    // Fallback: return basic blockquote structure
    const fallbackHtml = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"><a href="${url}" target="_blank">View on Instagram</a></blockquote>`;
    return res.json({ html: fallbackHtml, success: false, fallback: true });
    
  } catch (e) {
    console.error('instagram-embed error:', e);
    return res.status(500).json({ error: 'server error' });
  }
});

// ============ URL VALIDATION (Backend to avoid CORS) ============

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
        videoId = u.pathname.slice(1).split('?')[0]; // Remove query params
      } else if (host.endsWith('youtube.com')) {
        videoId = u.searchParams.get('v');
      }
    } catch (e) {
      // Try regex fallback
      const match = url.match(/(?:v=|\/v\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : null;
    }

    if (!videoId) {
      // Not a YouTube URL, consider it alive (we can't validate Facebook/Instagram)
      console.log(`[validate-url] Not a YouTube URL: ${url} - assuming alive`);
      return res.json({ alive: true });
    }

    // Clean video ID (remove any trailing characters)
    videoId = videoId.substring(0, 11);

    // PRIMARY METHOD: YouTube oEmbed API (most reliable)
    // Returns 200 for valid videos, 404 for deleted/private videos
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VideoChecker/1.0)'
        }
      });
      clearTimeout(timeoutId);

      // oEmbed returns 200 only for valid, public videos
      // Returns 401 for private, 404 for deleted
      const alive = response.status === 200;

      if (alive) {
        // Parse JSON to get video title
        const data = await response.json();
        const title = data.title || null;
        console.log(`[validate-url] Video ${videoId}: ✓ ALIVE, title: "${title}"`);
        return res.json({ alive: true, title });
      } else {
        console.log(`[validate-url] Video ${videoId}: ✗ DEAD (oEmbed status: ${response.status})`);
        return res.json({ alive: false });
      }

    } catch (fetchError) {
      // Network error or timeout
      console.log(`[validate-url] Video ${videoId}: Network error - ${fetchError.message}`);

      // On network errors, assume alive to avoid false positives
      return res.json({ alive: true });
    }
  } catch (e) {
    console.error('[validate-url] error:', e);
    return res.status(500).json({ error: e.message });
  }
});

// ============ SETTINGS ENDPOINTS ============

// GET /api/settings - Get current settings (public endpoint)
app.get('/api/settings', (req, res) => {
  try {
    const db = readDb();
    return res.json(db);
  } catch (e) {
    console.error('GET /api/settings error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/settings - Update settings (admin only)
app.put('/api/settings', authMiddleware(), (req, res) => {
  console.log('[Settings] 🚀 PUT HANDLER REACHED - body:', req.body);
  try {
    const { selectedFont } = req.body;
    console.log('[Settings] PUT request - font:', selectedFont, 'user:', req.user?.email);

    // Validate font selection - Liste complète des Google Fonts disponibles
    const allowedFonts = [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Ubuntu',
      'Nunito', 'Work Sans', 'Quicksand', 'Josefin Sans', 'DM Sans', 'Space Grotesk',
      'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Crimson Text',
      'EB Garamond', 'Libre Baskerville', 'Indie Flower', 'Dancing Script', 'Pacifico',
      'Caveat', 'Fira Code', 'JetBrains Mono', 'Courier Prime'
    ];

    if (!selectedFont || !allowedFonts.includes(selectedFont)) {
      console.log('[Settings] ❌ Invalid font:', selectedFont);
      return res.status(400).json({
        error: 'Invalid font selection',
        allowedFonts
      });
    }

    // Only admin and superadmin can update settings
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      console.log('[Settings] ❌ Insufficient permissions:', req.user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }

    const db = readDb();

    // Update settings
    db.selectedFont = selectedFont;
    db.updatedAt = new Date().toISOString();
    db.updatedBy = req.user.email;

    writeDb(db);

    console.log('[Settings] ✅ Font saved successfully:', selectedFont);
    return res.json({
      success: true,
      settings: db
    });
  } catch (e) {
    console.error('[Settings] 💥 PUT /api/settings error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ============ CATEGORIES MANAGEMENT ============

// GET /api/categories - Get all categories (public)
app.get('/api/categories', (req, res) => {
  try {
    const db = readDb();
    const categories = db.categories || [];
    return res.json(categories);
  } catch (e) {
    console.error('GET /api/categories error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/categories - Add new category (PUBLIC pour test)
app.post('/api/categories', (req, res) => {
  try {
    const { id, label, icon } = req.body;

    if (!id || !label || !icon) {
      return res.status(400).json({ error: 'id, label, and icon are required' });
    }

    const db = readDb();

    // Initialize categories if not exists
    if (!db.categories) {
      db.categories = [];
    }

    // Check if category ID already exists
    if (db.categories.some(cat => cat.id === id)) {
      return res.status(400).json({ error: 'Category ID already exists' });
    }

    // Add new category
    db.categories.push({ id, label, icon });
    writeDb(db);

    return res.json({
      success: true,
      category: { id, label, icon },
      categories: db.categories
    });
  } catch (e) {
    console.error('POST /api/categories error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/categories/:id - Update category (PUBLIC pour test)
app.put('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { label, icon } = req.body;

    if (!label || !icon) {
      return res.status(400).json({ error: 'label and icon are required' });
    }

    const db = readDb();

    if (!db.categories) {
      return res.status(404).json({ error: 'No categories found' });
    }

    const categoryIndex = db.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update category
    db.categories[categoryIndex] = { id, label, icon };
    writeDb(db);

    return res.json({
      success: true,
      category: { id, label, icon },
      categories: db.categories
    });
  } catch (e) {
    console.error('PUT /api/categories/:id error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/categories/:id - Delete category (PUBLIC pour test)
app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;

    const db = readDb();

    if (!db.categories) {
      return res.status(404).json({ error: 'No categories found' });
    }

    const initialLength = db.categories.length;
    db.categories = db.categories.filter(cat => cat.id !== id);

    if (db.categories.length === initialLength) {
      return res.status(404).json({ error: 'Category not found' });
    }

    writeDb(db);

    return res.json({
      success: true,
      deletedId: id,
      categories: db.categories
    });
  } catch (e) {
    console.error('DELETE /api/categories/:id error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Use a non-conflicting default port
const PORT = process.env.PORT || 3002;
app.listen(PORT, '::', () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Backend available at http://localhost:${PORT}`);
});
