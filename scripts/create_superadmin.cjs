// Script pour créer le compte super administrateur
const db = require('../server/db_json.cjs');

// Prendre les arguments de la ligne de commande
const email = process.argv[2] || 'admin@digikoder.local';
const password = process.argv[3] || 'admin123';

async function createSuperAdmin() {
  console.log('\n=== Création du compte Super Administrateur ===\n');
  
  if (!email || !email.includes('@')) {
    console.error('❌ Email invalide');
    process.exit(1);
  }
  
  // Check if user exists
  const existing = db.getUserByEmail(email);
  if (existing) {
    console.log('❌ Cet email existe déjà');
    process.exit(1);
  }
  
  if (!password || password.length < 4) {
    console.error('❌ Le mot de passe doit contenir au moins 4 caractères');
    process.exit(1);
  }
  
  try {
    const user = await db.createUser(email, password, 'superadmin');
    console.log('\n✅ Super admin créé avec succès!');
    console.log('   Email:', user.email);
    console.log('   Rôle:', user.role);
    console.log('\nVous pouvez maintenant vous connecter avec ces identifiants.');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
  } catch (e) {
    console.error('\n❌ Erreur lors de la création:', e.message);
    process.exit(1);
  }
}

createSuperAdmin();
