const db = require('../server/db_json.cjs');

const testVideos = [
  {
    url: 'https://www.facebook.com/share/v/wrxBFfFkCgt9Gkfw/',
    title: 'Facebook Video - wrxBFfFkCgt9Gkfw',
  },
  {
    url: 'https://www.facebook.com/reel/403626525522785?fs=e&s=TIeQ9V',
    title: 'Facebook Reel - 403626525522785',
  },
  {
    url: 'https://www.facebook.com/reel/391139230221756?fs=e&s=TIeQ9V',
    title: 'Facebook Reel - 391139230221756',
  },
];

console.log('Vérification et ajout des vidéos Facebook de test...\n');

let added = 0;
let skipped = 0;

for (const video of testVideos) {
  const existing = db.getContentByUrl(video.url);
  
  if (existing) {
    console.log(`✓ Déjà présente: ${video.title}`);
    skipped++;
  } else {
    const item = {
      title: video.title,
      url: video.url,
      type: 'video',
      platform: 'facebook',
      category: 'meditation',
      description: 'Vidéo Facebook de test',
      keywords: ['facebook', 'test', 'video'],
      owner: null
    };
    
    db.insertContent(item);
    console.log(`+ Ajoutée: ${video.title}`);
    added++;
  }
}

console.log(`\nRésumé: ${added} ajoutée(s), ${skipped} déjà présente(s)`);
