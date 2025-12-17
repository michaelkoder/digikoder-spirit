# 🚀 Guide de Démarrage - Digikoder Spirit

## 📋 Prérequis

- Node.js version 18 ou supérieure
- npm ou yarn
- Terminal/Console

## 🔧 Installation Complète

### Étape 1 : Installation des dépendances

```bash
npm install
```

Cette commande va installer :
- React 19.2.3
- Express 4.18.2
- bcryptjs (hashage de mots de passe)
- lucide-react (icônes)
- Vite (build tool)
- TypeScript

### Étape 2 : Créer votre Super Admin

```bash
npm run create:superadmin
```

Vous serez invité à entrer :
- Email : `admin@digikoder.local` (ou autre)
- Mot de passe : au moins 6 caractères

Ce compte aura TOUS les droits sur la plateforme.

### Étape 3 : Démarrer le Backend

Ouvrez un premier terminal et lancez :

```bash
npm run start:server
```

Vous devriez voir :
```
Server listening on port 3005
```

⚠️ **IMPORTANT** : Laissez ce terminal ouvert !

### Étape 4 : Démarrer le Frontend

Ouvrez un DEUXIÈME terminal et lancez :

```bash
npm run dev
```

Vous devriez voir :
```
  VITE v6.2.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Étape 5 : Accéder à l'Application

Ouvrez votre navigateur sur : **http://localhost:5173**

---

## 🎯 Première Utilisation

### Mode Invité (par défaut)
Vous pouvez :
- ✅ Parcourir tous les contenus
- ✅ Filtrer par catégorie
- ✅ Rechercher
- ✅ Visionner les vidéos
- ❌ Pas d'ajout/modification

### Se Connecter en Admin

1. Cliquez sur **"Se connecter"** (en haut à droite)
2. Entrez vos identifiants super admin
3. Vous voyez maintenant :
   - Bouton **"Partager"** (ajouter du contenu)
   - Bouton **"Utilisateurs"** (gérer les admins)
   - Badge **"👑 SUPER ADMIN"**

### Ajouter Votre Première Vidéo

1. Cliquez sur **"Ajouter une vidéo"**
2. Collez l'URL complète :
   - YouTube : `https://www.youtube.com/watch?v=ABC123`
   - Facebook : `https://www.facebook.com/watch?v=123456`
   - Instagram : `https://www.instagram.com/p/ABC123/`
3. Remplissez le titre et la description
4. Choisissez la catégorie
5. Résolvez le captcha (simple addition)
6. Cliquez **"Ajouter à la Vidéo"**

La vidéo apparaît instantanément dans la grille !

---

## 📺 Visionner des Vidéos

### YouTube
✅ Fonctionne parfaitement
- Cliquez sur la vignette
- La vidéo s'ouvre en modal
- Lecture instantanée

### Facebook
⚠️ Peut nécessiter des cookies tiers
- Si "publication non disponible" s'affiche
- Activez les cookies tiers pour facebook.com
- Ou cliquez "Ouvrir sur Facebook"

### Instagram (NOUVEAU ! 🎉)
✅ Widget embed officiel
- Cliquez sur la publication
- Le widget Instagram se charge (3-5 secondes)
- Lecture directe dans la modale
- Si échec : bouton "Ouvrir sur Instagram"

---

## 👥 Gestion des Utilisateurs

### Créer un Nouvel Admin

1. Connectez-vous en super admin
2. Cliquez **"👥 Utilisateurs"**
3. Cliquez **"+ Ajouter un utilisateur"**
4. Entrez :
   - Email : `admin2@digikoder.local`
   - Mot de passe : minimum 6 caractères
   - Rôle : **Admin** ou **Super Admin**
5. Cliquez **"Créer"**

### Différence Admin vs Super Admin

| Action | Admin | Super Admin |
|--------|-------|-------------|
| Voir les contenus | ✅ | ✅ |
| Ajouter du contenu | ✅ | ✅ |
| Modifier SON contenu | ✅ | ✅ |
| Modifier le contenu des AUTRES | ❌ | ✅ |
| Supprimer SON contenu | ✅ | ✅ |
| Supprimer le contenu des AUTRES | ❌ | ✅ |
| Gérer les utilisateurs | ❌ | ✅ |

---

## 🔍 Recherche et Filtres

### Filtrer par Catégorie

Cliquez sur les badges en haut :
- **Tout** : Affiche tout
- **Fréquences & Musique** : Musiques vibratoires, 432 Hz, Schumann...
- **Méditation** : Méditations guidées, nettoyage énergétique...
- **Savoir & Docu** : Documentaires, conférences...
- **Notes & Blog** : Articles, notes personnelles...
- **Outils Pratiques** : Bloqueurs de pub, extensions...

### Rechercher

1. Utilisez la barre de recherche en haut
2. Tapez des mots-clés
3. La recherche filtre :
   - Titres
   - Descriptions
   - Mots-clés auto-générés

---

## 🐛 Dépannage

### Le serveur ne démarre pas

**Erreur** : `Error: listen EADDRINUSE: address already in use :::3005`

**Solution** :
```bash
# Trouver le processus qui utilise le port 3005
lsof -i :3005

# Tuer le processus
kill -9 <PID>

# Relancer
npm run start:server
```

### Erreur "Non autorisé" lors de l'ajout de contenu

**Cause** : Token expiré ou invalide

**Solution** :
1. Déconnectez-vous (bouton déconnexion)
2. Reconnectez-vous
3. Réessayez

### Les vidéos Instagram ne s'affichent pas

**Solution 1** : Attendez 5-10 secondes (le widget Instagram est lent)

**Solution 2** : Actualisez la page (F5)

**Solution 3** : Cliquez sur "Ouvrir sur Instagram"

### Base de données corrompue

**Symptôme** : Erreurs 500, contenus disparus

**Solution** :
```bash
# Sauvegarder l'ancienne base
mv data/digikoder.json data/digikoder.backup.json

# Le serveur créera une nouvelle base au redémarrage
npm run start:server
```

---

## 📁 Structure des Fichiers

```
digikoderSpritit/
├── data/
│   └── digikoder.json         # Base de données (créée automatiquement)
├── server/
│   ├── index.cjs              # API Express
│   └── db_json.cjs            # Accès base de données
├── scripts/
│   └── create_superadmin.cjs  # Script de création admin
├── index.tsx                  # Application React
├── index.html                 # Template HTML
├── index.css                  # Styles globaux
└── package.json               # Configuration npm
```

---

## 🎓 Commandes Utiles

```bash
# Démarrage normal
npm run dev                 # Frontend
npm run start:server        # Backend

# Production
npm run build               # Build du frontend
npm run preview             # Preview du build

# Utilitaires
npm run create:superadmin   # Créer un super admin
npm run seed:local          # Seed des données de test
```

---

## 🔒 Sécurité

### Bonnes Pratiques

1. **Mots de passe** : Utilisez des mots de passe forts (12+ caractères)
2. **Tokens** : Ne partagez jamais votre token d'authentification
3. **Déconnexion** : Déconnectez-vous sur les ordinateurs partagés
4. **Sauvegarde** : Sauvegardez régulièrement `data/digikoder.json`

### Fichiers à NE PAS Commiter

- ❌ `data/digikoder.json` (contient les mots de passe hashés)
- ❌ `.env` (variables d'environnement)
- ❌ `node_modules/` (dépendances)

Ces fichiers sont déjà dans `.gitignore` 😊

---

## 📞 Support

### Questions ?

1. Consultez `OPTIMIZATIONS.md` pour les détails techniques
2. Consultez `README.md` pour un aperçu rapide
3. Vérifiez les logs de la console (F12)

### Bugs ?

Ouvrez un issue sur le repo GitHub avec :
- Description du problème
- Étapes pour reproduire
- Logs de la console
- Version de Node.js

---

**Bon voyage spirituel ! 🌟**

