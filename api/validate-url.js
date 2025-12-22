export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

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
      return res.status(200).json({ alive: true });
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
      console.log(`[validate-url] Video ${videoId}: ${alive ? '✓ ALIVE' : '✗ DEAD'} (oEmbed status: ${response.status})`);
      return res.status(200).json({ alive });

    } catch (fetchError) {
      // Network error or timeout
      console.log(`[validate-url] Video ${videoId}: Network error - ${fetchError.message}`);

      // On network errors, assume alive to avoid false positives
      // This prevents removing valid videos due to temporary network issues
      return res.status(200).json({ alive: true });
    }
  } catch (e) {
    console.error('[validate-url] error:', e);
    return res.status(500).json({ error: e.message });
  }
}
