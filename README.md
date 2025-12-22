# 🌟 Loookaa Spirit

Plateforme de partage spirituel pour vidéos de méditation, musiques à fréquences vibratoires, documentaires et ressources de bien-être.

## ✨ Fonctionnalités principales

- 🎬 **Lecteur vidéo intégré** : YouTube, Facebook, Instagram (support formats vertical et horizontal)
- 📝 **Articles/Notes** : Système de notes textuelles avec modal scrollable
- 🔄 **Mode Switch** : Basculer entre mode Vidéos et mode Notes
- 🎨 **Catégories dynamiques** : S'appliquent aux vidéos ET aux articles
- 👥 **Gestion des utilisateurs** : 3 rôles (guest, admin, superadmin)
- 🔐 **Authentification JWT** : Session persistante (8h)
- 🔍 **Recherche avancée** : Par titre et description
- ✅ **Validation YouTube** : Filtrage automatique des liens morts
- 📱 **Responsive** : Interface moderne glassmorphism avec grille masonry
- 🔗 **Partage social** : Facebook, WhatsApp, copie de lien

## 🚀 Installation et démarrage

### Prérequis
- Node.js >= 18
- npm >= 9

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration des variables d'environnement

Copier le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Le fichier `.env.local` contient déjà les bonnes valeurs pour le développement local :

```env
# Frontend (Vite) - Parle directement au serveur Express
VITE_API_BASE_URL=http://localhost:3002

# Backend (Express)
NODE_ENV=development
ADMIN_USER=admin
ADMIN_HASH=$2a$10$N9qo8uLOickgx2ZMRZoMyeiNDfXUJfLQoKqvQXKH2GDgaEo/D8s6y
JWT_SECRET=dev-secret-key-minimum-32-characters-long-change-in-prod
PORT=3002
```

> **Note** : Le hash correspond au mot de passe `admin123`

### 3. Démarrer l'application

**Option A : Tout en un seul terminal (recommandé)**

```bash
npm run start:all    
```

Cette commande lance automatiquement :
- Le serveur Express (backend) sur `http://localhost:3002`
- Le serveur Vite (frontend) sur `http://localhost:5173`

**Option B : Deux terminaux séparés**

```bash
# Terminal 1 - Backend
npm run start:server

# Terminal 2 - Frontend
npm run start:frontend
```

### 4. Accéder à l'application

Ouvrir le navigateur sur : **http://localhost:5173/spirit/**

### 5. Connexion

- **Email** : `admin`
- **Mot de passe** : `admin123`
- **Rôle** : `superadmin`

## 📁 Structure du projet

```
digikoderSpritit/
├── index.tsx              # Application React principale (SPA)
├── index.html             # Point d'entrée HTML
├── vite.config.ts         # Configuration Vite
├── server/
│   ├── index.cjs          # Serveur Express local
│   └── db_json.cjs        # Gestion base JSON (users)
├── data/
│   ├── digikoder.json     # Contenu (vidéos + articles)
│   └── settings.json      # Paramètres app
├── api/                   # Endpoints serverless (production)
│   ├── login.js
│   ├── me.js
│   ├── contents.js
│   ├── validate-url.js
│   ├── categories.js
│   └── settings.js
└── REFERENCE_FONCTIONNELLE.md  # Documentation complète
```

## 🎯 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance backend + frontend en parallèle |
| `npm run start:frontend` | Lance uniquement Vite (port 5173) |
| `npm run start:server` | Lance uniquement Express (port 3001) |
| `npm run build` | Build de production dans `/dist` |
| `npm run preview` | Prévisualiser le build de production |
| `npm run create:superadmin` | Créer un nouveau superadmin |

## 🌐 Environnements

### Local
- **Frontend** : http://localhost:5173/spirit/
- **Backend** : http://localhost:3002
- **Base de données** : Fichiers JSON dans `/data`

### Production
- **URL** : https://loookaa.com/spirit/
- **Hébergement** : o2switch
- **Backend** : Fonctions serverless dans `/api`
- **Build** : Upload du dossier `/dist` vers `/spirit/`

## 🔐 Gestion des utilisateurs

### Rôles disponibles

1. **user** (guest)
   - Lecture seule
   - Accès aux vidéos et articles
   - Pas de boutons admin

2. **admin**
   - Ajout de contenu uniquement
   - Pas d'accès aux paramètres

3. **superadmin**
   - Accès complet
   - Gestion utilisateurs
   - Gestion catégories
   - Gestion paramètres

### Créer un nouveau superadmin

```bash
npm run create:superadmin
# Suivre les instructions à l'écran
```

## 📝 Documentation

- **[REFERENCE_FONCTIONNELLE.md](./REFERENCE_FONCTIONNELLE.md)** : Référence complète du projet
  - Types de contenu (Vidéos / Articles)
  - Système de Mode et filtrage
  - Rôles utilisateurs
  - Modals (vidéo, article)
  - Environnements
  - Checklist de test

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** : Guide de déploiement en production

- **[.clauderc](./.clauderc)** : Instructions pour Claude Code

## ⚠️ Points d'attention

- **Toujours consulter REFERENCE_FONCTIONNELLE.md** avant toute modification
- Le frontend parle **directement** au backend (pas de proxy Vite)
- Les catégories s'appliquent aux **deux** modes (Vidéos ET Notes)
- Les liens Instagram ouvrent l'app mobile (pas de nouvel onglet)
- Validation automatique des liens YouTube via oEmbed API

## 🧪 Tests

Voir la checklist complète dans [REFERENCE_FONCTIONNELLE.md](./REFERENCE_FONCTIONNELLE.md#-checklist-test-complet)

Points clés à tester :
- Switch Mode Vidéos/Notes
- Vidéos horizontales et verticales (Shorts/Reels)
- Articles avec scroll
- Partage social (modal portal)
- Session persistante après refresh
- Filtrage par catégorie dans les deux modes

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier que le port 3002 est libre
lsof -ti:3002 | xargs kill -9
npm run start:server
```

### Le frontend ne se connecte pas au backend
Vérifier que `VITE_API_BASE_URL=http://localhost:3002` dans `.env.local`

### Erreur d'authentification
Supprimer le token et se reconnecter :
```javascript
localStorage.removeItem('authToken')
```

## 📞 Support

**Projet** : Loookaa Spirit
**URL Production** : https://loookaa.com/spirit/
**Hébergement** : o2switch
**Framework** : React 19 + Vite + Express.js
**Version** : 1.1 - Système de Mode Vidéos/Notes

---

✨ **Profitez de votre voyage spirituel !** ✨
