// Script pour créer un profil admin local
const db = require('../server/db_json.cjs');

const adminEmail = 'admin@digikoder.local';

// Vérifier si le profil existe déjà
const existing = db.getProfileByEmail(adminEmail);
if (existing) {
  console.log('✓ Profil admin existe déjà:', adminEmail);
  console.log('  Role:', existing.role);
  process.exit(0);
}

// Créer le profil admin
const profile = {
  email: adminEmail,
  role: 'admin'
};

db.insertProfile(profile);
console.log('✓ Profil admin créé avec succès!');
console.log('  Email:', adminEmail);
console.log('  Role: admin');
console.log('\nPour vous connecter en admin:');
console.log('1. Cliquez sur "Se connecter" dans l\'interface');
console.log('2. Entrez l\'email:', adminEmail);
console.log('3. Le mot de passe n\'est pas vérifié pour le moment (entrez n\'importe quoi)');
