# 📚 RÉFÉRENCE FONCTIONNELLE - LOOOKAA SPIRIT

> **IMPORTANT** : Ce document est la référence absolue. À consulter AVANT toute modification pour éviter les régressions.

---

## 🎯 TYPES DE CONTENU

L'application gère **2 TYPES** de contenu :

### 1. **VIDEO** (`type: 'video'`)
- Lecteur vidéo dans une modal
- Plateformes supportées : YouTube, Facebook, Instagram
- Les liens Instagram ne sont pas ouverts dans une modal avec lecteur vidéo, ce sont des liens externe qui ouvrent directement le lien de la video dans un nouvel onglet du navigateur ou directement dans l'application instagram ( sans ouvrir de nouvel onglet dans ce cas la )
- Formats : Horizontal (16:9) ET Vertical (9:16 pour Shorts/Reels)
- URL d'embed différente selon la plateforme
- Bouton "Partager" (Facebook, WhatsApp, Instagram, Copier lien)

### 2. **ARTICLE/NOTE** (`type: 'article'`)
- **PAS de vidéo** - Contenu textuel uniquement
- Affichage dans une **modal de texte avec scroll**
- Le champ `description` contient tout le texte
- URL peut être `#` (pas de lien externe)
- Exemple : "Affirmations Positives Mika"

---

## 🎨 MODE ET FILTRAGE

### Switch de Mode (header, partie droite) :

Le mode détermine quel TYPE de contenu est affiché :

1. **Mode "Vidéos"** (`mediaMode: 'video'`)
   - Affiche UNIQUEMENT les vidéos
   - Couleur : Purple gradient
   - Icône : Video
   - C'est le mode par défaut

2. **Mode "Notes"** (`mediaMode: 'article'`)
   - Affiche UNIQUEMENT les articles/notes
   - Couleur : Emerald gradient
   - Icône : BookOpen
   - Contenu textuel uniquement

### Catégories (s'appliquent aux DEUX modes) :

**Filtre "Tout"** (par défaut) :
- Affiche tous les contenus du mode actif
- Icône : Video

**Catégories dynamiques** :
- Icônes personnalisées (Music, Play, Sparkles, Film, etc.)
- Filtrent le contenu du mode actif par catégorie
- Gestion admin (superadmin uniquement)
- S'appliquent aussi bien aux vidéos qu'aux articles

### Logique de filtrage :
1. **Filtrage par MODE** : video ou article (via switch)
2. **Filtrage par CATÉGORIE** : "Tout" ou catégorie spécifique
3. **Filtrage par RECHERCHE** : texte dans titre ou description
4. **Filtrage liens morts** : uniquement pour les vidéos YouTube

---

## 👤 RÔLES UTILISATEURS

### 1. **superadmin**
- Accès complet à tous les boutons admin
- Gestion utilisateurs (CRUD)
- Gestion catégories
- Gestion paramètres (polices, etc.)
- Ajout/Édition/Suppression de contenu

### 2. **admin**
- Ajout de contenu uniquement
- PAS d'accès aux utilisateurs, catégories, paramètres

### 3. **user**
- Lecture seule
- Pas de boutons admin visibles

---

## 🔐 AUTHENTIFICATION

### JWT (JSON Web Token)
- Stocké dans `localStorage` sous clé `authToken`
- Durée : 8 heures
- Contient : `{ sub: email, role: 'superadmin'|'admin'|'user' }`
- Décodage client-side en cas d'échec API `/api/me`

### Variables d'environnement
```
ADMIN_USER=admin
ADMIN_HASH=$2a$10$... (bcrypt)
JWT_SECRET=dev-secret-key-minimum-32-characters-long
ADMIN_ROLE=superadmin (par défaut)
```

---

## 📹 MODAL VIDÉO

### Formats détectés automatiquement :
**VERTICAL (9:16)** si URL contient :
- `/shorts/` (YouTube Shorts)
- `/reel/` (Instagram Reels)
- `instagram.com/p/` ou `/tv/`
- `tiktok.com`
- `stories`

**HORIZONTAL (16:9)** sinon

### Embed URLs :
- **YouTube** : `https://www.youtube.com/embed/{ID}?autoplay=1&modestbranding=1&rel=0&playsinline=1`
- **Facebook** : `https://www.facebook.com/plugins/video.php?href={encodedURL}&show_text=false&autoplay=true`
- **Autres** : URL directe

### Comportement :
- Autoplay activé
- Fullscreen différé (1.5s desktop, 3.5s mobile)
- Loader pendant chargement
- Click outside = fermeture

### Boutons de partage (dans la modal) :
- **Position** : En haut à gauche de la modal vidéo
- **Boutons disponibles** :
  1. 📋 Copier le lien (icône Copy)
  2. 👥 Partager sur Facebook (icône Facebook)
  3. 💬 Partager sur WhatsApp (icône WhatsApp)
- **Affichage** : Boutons ronds avec backdrop-blur
- **PAS de bouton partage dans les vignettes** - uniquement dans la modal

---

## 📝 MODAL ARTICLE/NOTE

### Fonctionnalités REQUISES :
- ✅ Affichage du `title` en haut
- ✅ Affichage du `description` avec **scroll vertical**
- ✅ Formatage du texte (retours à la ligne préservés)
- ✅ Bouton fermeture (X en haut à droite)
- ✅ Click outside = fermeture
- ✅ Fond semi-transparent noir
- ✅ Modal centrée avec max-width

### Exemple de données :
```json
{
  "id": "123",
  "type": "article",
  "title": "Affirmations Positives Mika",
  "url": "#",
  "category": "affirmationspositives",
  "description": "🌞 INTRO - Ancrage (45 sec) \n\nJ'utilise le pouvoir..."
}
```

---

## 🔄 FILTRAGE LIENS MORTS (YouTube)

### API YouTube oEmbed
Endpoint : `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={ID}&format=json`

### Retours :
- **200** = Vidéo accessible ✅
- **401** = Vidéo privée ❌
- **404** = Vidéo supprimée ❌

### Implémentation :
- Endpoint local : `/api/validate-url` (GET + POST)
- Timeout : 8 secondes
- Cache des résultats pour performance
- Filtre automatique des vidéos inaccessibles

---

## 🌐 ENVIRONNEMENTS

### LOCAL (http://localhost:5173/spirit/)
```
VITE_API_BASE_URL=http://localhost:3002
```
- Frontend Vite (port 5173)
- Backend Express (port 3002)
- Frontend parle DIRECTEMENT au backend (pas de proxy Vite)

### PRODUCTION (https://loookaa.com/spirit/)
```
# Frontend build dans /spirit/
# API via .htaccess redirection
```
- Build Vite : `npm run build`
- Upload `dist/` vers `/spirit/`
- Variables env sur serveur :
  - `ADMIN_ROLE=superadmin`
  - `JWT_SECRET=...`
  - `ADMIN_HASH=...`

---

## 📦 STRUCTURE FICHIERS

### Frontend
- **index.tsx** : Tout le code React (SPA)
- **index.html** : Point d'entrée
- **vite.config.ts** : Config Vite (base: '/spirit/')
- **.env.local** : Variables locales

### Backend Local
- **server/index.cjs** : Serveur Express complet
- **server/db_json.cjs** : CRUD JSON pour users
- **data/digikoder.json** : Contenu (videos + articles)
- **data/settings.json** : Paramètres app

### Backend Production (Vercel/o2switch)
- **api/login.js** : Auth serverless
- **api/me.js** : Session check
- **api/contents.js** : Liste contenu
- **api/validate-url.js** : Validation YouTube
- **api/categories.js** : CRUD catégories
- **api/settings.js** : CRUD settings

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

### ❌ NE JAMAIS :
1. Supprimer la gestion du `type: 'article'`
2. Supprimer les modals (Video ET Article)
3. Casser la détection format vertical/horizontal
4. Retirer le système de rôles (superadmin/admin/user)
5. Modifier l'authentification JWT sans test complet
6. Supprimer le bouton partager ou sa modal en portal

### ✅ TOUJOURS :
1. Vérifier que TOUS les types de contenu fonctionnent
2. Tester les 3 rôles utilisateurs
3. Vérifier les formats vidéo (16:9 ET 9:16)
4. Tester la modal de partage (portal)
5. Consulter CE DOCUMENT avant toute modif
6. Mettre à jour CE DOCUMENT si nouvelle fonctionnalité

---

## 🧪 CHECKLIST TEST COMPLET

### Mode et Filtrage
- [ ] Switch Mode Vidéos/Notes est visible dans le header
- [ ] Mode Vidéos affiche uniquement les vidéos
- [ ] Mode Notes affiche uniquement les articles
- [ ] Catégories s'appliquent au mode actif
- [ ] Filtre "Tout" affiche tout le contenu du mode actif
- [ ] Recherche par texte fonctionne dans les deux modes

### Vidéos
- [ ] Vidéo YouTube horizontale s'ouvre et joue
- [ ] Vidéo YouTube Shorts verticale s'ouvre en 9:16
- [ ] Vidéo Facebook s'ouvre et joue
- [ ] Instagram s'ouvre (app mobile ou nouvel onglet desktop)
- [ ] Bouton partager affiche menu complet (pas coupé)
- [ ] Copier lien fonctionne
- [ ] Partage Facebook/WhatsApp ouvre nouvelle fenêtre
- [ ] Validation liens morts YouTube fonctionne

### Articles/Notes
- [ ] Article/Note s'ouvre avec texte scrollable
- [ ] Formatage du texte préservé (retours à la ligne)
- [ ] Bouton fermeture fonctionne
- [ ] Click outside ferme la modal

### Authentification et Rôles
- [ ] Connexion superadmin affiche tous les boutons
- [ ] Connexion admin affiche bouton ajout uniquement
- [ ] User ne voit aucun bouton admin
- [ ] Session persiste après rafraîchissement page

### CRUD
- [ ] Ajout nouveau contenu (video + article)
- [ ] Édition contenu existant
- [ ] Suppression contenu

---

## 📞 CONTACT & SUPPORT

**Projet** : Loookaa Spirit
**URL Production** : https://loookaa.com/spirit/
**Hébergement** : o2switch
**Framework** : React 19 + Vite + Express.js
**Database** : JSON files (local) + Vercel serverless (prod)

---

**Dernière mise à jour** : 2025-12-22
**Version** : 1.1 - Ajout du système de Mode (Vidéos/Notes)

---

> ⚡ **RÈGLE D'OR** : Avant toute modification, ouvrir ce fichier et vérifier qu'on ne casse pas une fonctionnalité existante !
