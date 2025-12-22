/**
 * API endpoint: GET/POST /api/contents
 * Handles fetching and creating content items
 */

// TODO: Replace this with real database when moving to production
// For now, we'll return an empty array or error message
// This needs to be integrated with MongoDB/Supabase

const mockData = [
  {
    id: '1',
    title: 'Example Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'video',
    platform: 'youtube',
    category: 'tutorials',
    description: 'Example description',
    keywords: ['example', 'video'],
    addedBy: 'admin',
    date: new Date().toLocaleDateString()
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // TODO: Fetch from database instead of mock data
      // const contents = await db.collection('contents').find({}).toArray();
      res.status(200).json(mockData);
    } else if (req.method === 'POST') {
      // TODO: Implement database insert
      const { title, url, type, platform, category, description, keywords, owner } = req.body;
      
      if (!title || !url) {
        return res.status(400).json({ error: 'title and url required' });
      }

      const newContent = {
        id: Date.now().toString(),
        title,
        url,
        type: type || 'video',
        platform: platform || 'other',
        category: category || 'uncategorized',
        description: description || '',
        keywords: keywords || [],
        addedBy: owner || 'unknown',
        date: new Date().toLocaleDateString()
      };

      // TODO: Save to database
      // await db.collection('contents').insertOne(newContent);
      
      res.status(201).json(newContent);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[/api/contents]', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
