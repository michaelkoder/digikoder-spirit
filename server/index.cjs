const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db_json.cjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

app.post('/api/contents', (req, res) => {
  const { title, url, type, platform, category, description, keywords, owner } = req.body;
  const item = { title, url, type, platform, category, description, keywords: keywords || [], owner };
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
});

app.put('/api/contents/:id', (req, res) => {
  const id = req.params.id;
  const updated = db.updateContent(id, req.body);
  if (!updated) return res.status(404).json({ error: 'not found' });
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
});

app.delete('/api/contents/:id', (req, res) => {
  const id = req.params.id;
  const ok = db.deleteContent(id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
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
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    
    const user = await db.validatePassword(email, password);
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });
    
    res.json({ 
      id: user.id,
      email: user.email, 
      role: user.role,
      created_at: user.created_at
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all users (superadmin only)
app.get('/api/users', (req, res) => {
  try {
    // In production, verify superadmin token here
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
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
    if (role !== 'admin' && role !== 'superadmin') return res.status(400).json({ error: 'Rôle invalide' });
    
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
app.delete('/api/users/:id', (req, res) => {
  try {
    const id = req.params.id;
    const ok = db.deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'Utilisateur non trouvé' });
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

// Fetch title from URL (avoids CORS on client)
app.post('/api/fetch-title', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url required', title: null });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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
            if (data && data.title) {
              clearTimeout(timeoutId);
              return res.json({ title: data.title, source: 'youtube-oembed' });
            }
          }
        } catch (e) {}
      }

      // Try Instagram oEmbed
      if (url.includes('instagram.com')) {
        try {
          const oembedUrl = `https://www.instagram.com/api/v1/media/from_url/?url=${encodeURIComponent(url)}`;
          const response = await fetch(oembedUrl, {
            signal: controller.signal,
            headers: {
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'accept': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json().catch(() => null);
            if (data && data.media && (data.media.title || data.media.caption_text)) {
              clearTimeout(timeoutId);
              return res.json({ title: data.media.title || data.media.caption_text, source: 'instagram-api' });
            }
          }
        } catch (e) {}
      }

      // Fallback: fetch HTML and parse title tag
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text().catch(() => '');
        
        // Try og:title
        let match = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        if (match && match[1]) {
          clearTimeout(timeoutId);
          return res.json({ title: match[1].trim(), source: 'og:title' });
        }

        // Try twitter:title
        match = html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
        if (match && match[1]) {
          clearTimeout(timeoutId);
          return res.json({ title: match[1].trim(), source: 'twitter:title' });
        }

        // Try <title> tag
        match = html.match(/<title>([^<]+)<\/title>/i);
        if (match && match[1]) {
          clearTimeout(timeoutId);
          return res.json({ title: match[1].trim(), source: 'title-tag' });
        }
      }

      clearTimeout(timeoutId);
      return res.json({ title: null, source: 'none' });

    } catch (e) {
      clearTimeout(timeoutId);
      return res.json({ title: null, error: e.message, source: 'error' });
    }
  } catch (e) {
    console.error('fetch-title error:', e);
    return res.status(500).json({ error: 'server error', title: null });
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

// Use a non-conflicting default port
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log('Server listening on port', PORT));
