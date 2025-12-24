# Loookaa Spirit

Plateforme de partage spirituel pour vidéos de méditation, musiques à fréquences vibratoires, documentaires et ressources de bien-être.

**URL Production** : https://loookaa.com/spirit/

---

## Table des matières

- [Développement Local](#développement-local)
- [Déploiement sur o2switch](#déploiement-sur-o2switch)
- [Dépannage](#dépannage)
- [Architecture](#architecture)

---

## Développement Local

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE_USERNAME/digikoder-spirit.git
cd digikoder-spirit

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
```

### Configuration .env.local

Éditez `.env.local` :

```bash
# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:3002

# Backend (Express)
NODE_ENV=development
PORT=3002
JWT_SECRET=dev-secret-key-minimum-32-characters-long
ADMIN_USER=admin
ADMIN_HASH=$2a$10$N9qo8uLOickgx2ZMRZoMyeiNDfXUJfLQoKqvQXKH2GDgaEo/D8s6y
```

> Le hash correspond au mot de passe `admin123`. Pour générer un nouveau hash :
> ```bash
> node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('votrePassword', 10));"
> ```

### Démarrer l'application

```bash
# Démarrer backend + frontend ensemble
npm run start:all
```

**Accès** : http://localhost:5173/spirit/

**Connexion** :
- Email : `admin`
- Mot de passe : `admin123`

### Scripts disponibles

```bash
npm run dev              # Frontend Vite uniquement
npm run start:server     # Backend Express uniquement
npm run start:all        # Backend + Frontend (recommandé)
npm run build            # Build production
npm run preview          # Prévisualiser le build
```

---

## Déploiement sur o2switch

### Prérequis (une seule fois)

#### 1. Créer un repo Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/digikoder-spirit.git
git push -u origin main
```

#### 2. Configurer l'accès SSH

```bash
# Tester la connexion
> autoriser mon ip courante a accéder au SSH 
> récup mon ip > https://www.monip.org/
> cpanl de o2swith > aller dans Autorisation SSH et ajouter 
> terminal de mon mac : 
ssh clmi3187@sapotier.o2switch.net

# Créer une clé SSH (recommandé)
ssh-keygen -t rsa -b 4096
ssh-copy-id clmi3187@sapotier.o2switch.net
```

#### 3. Installer PM2 sur o2switch

```bash
ssh clmi3187@sapotier.o2switch.net
npm install -g pm2
pm2 startup
# Exécuter la commande affichée par pm2 startup
exit
```

#### 4. Rendre le script de déploiement exécutable

```bash
chmod +x deploy.sh
```

### Déploiement

#### Premier déploiement et mises à jour

```bash
# 1. Développer et tester localement
npm run start:all

# 2. (Optionnel) Commiter et pousser sur Git
git add .
git commit -m "Description des changements"
git push

# 3. Déployer (build local + upload via SCP)
./deploy.sh
```

**Ce que fait le script** :
1. ✅ Build le frontend **localement** (évite les problèmes de mémoire sur o2switch)
2. ✅ Upload via SCP : `dist/`, `server/`, `data/`, `package.json`
3. ✅ **PRÉSERVE** `.htaccess`, `.env` et les fichiers `data/` existants
4. ✅ Installe les dépendances de production
5. ✅ Redémarre PM2 automatiquement

### Configuration post-déploiement

#### 1. Modifier le JWT_SECRET

```bash
ssh clmi3187@loookaa.com
nano ~/loookaa/spirit/.env
```

Remplacez :
```bash
JWT_SECRET=UneChaineTresSecuriseeDe64CaracteresMinimum2025Loookaa!
```

Redémarrez :
```bash
pm2 restart loookaa-spirit
exit
```

#### 2. Configurer le .htaccess WordPress

**⚠️ IMPORTANT** : Éditez le fichier `.htaccess` à la **racine de WordPress** (PAS dans /spirit/).

Fichier : `~/loookaa/.htaccess`

**Ajoutez ces lignes APRÈS `RewriteEngine On` et AVANT toutes les autres règles :**

```apache
# EXCLUSION /spirit/ - DOIT ÊTRE EN PREMIER
RewriteCond %{REQUEST_URI} ^/spirit(/|$) [NC]
RewriteRule ^ - [L]
```

Exemple complet :

```apache
<IfModule mod_rewrite.c>
RewriteEngine On

# ============================================================
# EXCLUSION TOTALE /spirit/ - CETTE RÈGLE DOIT ÊTRE ICI
# ============================================================
RewriteCond %{REQUEST_URI} ^/spirit(/|$) [NC]
RewriteRule ^ - [L]

# Les autres règles WordPress/HMWP suivent...
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?/$1 [QSA,L]
</IfModule>
```

**Rechargez Apache :**

```bash
ssh clmi3187@loookaa.com
touch ~/loookaa/.htaccess
exit
```

#### 3. Vérifier que tout fonctionne

Testez dans votre navigateur :
- https://loookaa.com/spirit/ → Application s'affiche
- https://loookaa.com/spirit/api/settings → JSON retourné

---

## Dépannage

### 404 sur /spirit/ (Cette page ne semble pas exister)

**Cause** : Le `.htaccess` WordPress bloque l'accès au dossier `/spirit/`.

**Solution** :

1. Vérifiez le `.htaccess` WordPress :

```bash
ssh clmi3187@loookaa.com
head -20 ~/loookaa/.htaccess
```

2. Assurez-vous que cette règle est présente **en premier** (après `RewriteEngine On`) :

```apache
RewriteCond %{REQUEST_URI} ^/spirit(/|$) [NC]
RewriteRule ^ - [L]
```

3. Si absent ou incorrect, éditez le fichier :

```bash
nano ~/loookaa/.htaccess
```

4. Rechargez Apache et videz les caches :

```bash
touch ~/loookaa/.htaccess
pm2 restart loookaa-spirit
```

Puis videz :
- Cache WordPress (via admin)
- Cache navigateur (Ctrl+Shift+R)

5. Testez :

```bash
curl -I https://loookaa.com/spirit/
# Doit retourner HTTP/2 200
```

### API ne répond pas (502 Bad Gateway)

**Cause** : PM2 est arrêté ou a planté.

**Solution** :

```bash
ssh clmi3187@loookaa.com
pm2 status
# Si offline :
pm2 restart loookaa-spirit
# Voir les erreurs :
pm2 logs loookaa-spirit --err
```

### Port 3002 déjà utilisé

**Solution** :

```bash
ssh clmi3187@loookaa.com
lsof -ti:3002 | xargs kill -9
pm2 restart loookaa-spirit
```

### Commandes PM2 utiles

```bash
pm2 status                    # État de toutes les apps
pm2 logs loookaa-spirit       # Logs en temps réel
pm2 restart loookaa-spirit    # Redémarrer
pm2 stop loookaa-spirit       # Arrêter
pm2 delete loookaa-spirit     # Supprimer de PM2
pm2 save                      # Sauvegarder la config
```

---

## Architecture

### Structure du projet

```
digikoder-spirit/
├── index.tsx              # Point d'entrée React
├── index.html             # Template HTML
├── vite.config.js         # Config Vite (base: /spirit/)
├── package.json           # Dépendances et scripts
│
├── server/
│   ├── index.cjs          # API Express (port 3002)
│   └── db_json.cjs        # Gestion base JSON
│
├── data/
│   ├── digikoder.json     # Base de données (contenus + users)
│   └── settings.json      # Configuration app
│
├── deploy-git.sh          # Script déploiement automatique
├── .env.example           # Template variables environnement
└── .env.local             # Config locale (gitignored)
```

### URLs et ports

**Développement local** :
- Frontend : http://localhost:5173/spirit/
- Backend : http://localhost:3002

**Production (o2switch)** :
- Frontend : https://loookaa.com/spirit/
- API : https://loookaa.com/spirit/api/
- Port interne Node.js : 3002 (géré par PM2)

### Endpoints API principaux

```
POST   /api/login              # Authentification
POST   /api/logout             # Déconnexion
GET    /api/me                 # User actuel
GET    /api/contents           # Liste contenus
POST   /api/contents           # Créer contenu
PUT    /api/contents/:id       # Modifier contenu
DELETE /api/contents/:id       # Supprimer contenu
POST   /api/validate-url       # Valider URL vidéo
GET    /api/settings           # Config app
```

### Fonctionnalités

- Lecteur vidéo intégré : YouTube, Facebook, Instagram
- Système de notes textuelles avec modal scrollable
- Mode Switch : Vidéos / Notes
- Catégories dynamiques
- 3 rôles utilisateurs : guest, admin, superadmin
- Authentification JWT (session 8h)
- Recherche par titre et description
- Validation YouTube automatique
- Interface responsive glassmorphism
- Partage social : Facebook, WhatsApp, copie de lien

### Rôles utilisateurs

| Rôle | Permissions |
|------|-------------|
| **guest** | Lecture seule, accès vidéos et articles |
| **admin** | Ajout de contenu uniquement |
| **superadmin** | Accès complet : contenu, utilisateurs, catégories, paramètres |

---

## Workflow complet

### Développement → Production

```bash
# 1. Développer localement
npm run start:all
# Tester sur http://localhost:5173/spirit/

# 2. (Optionnel) Commiter sur Git
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push

# 3. Déployer
./deploy.sh

# 4. Vérifier
# https://loookaa.com/spirit/
```

### Checklist déploiement

- [ ] Code testé en local
- [ ] `deploy.sh` exécuté avec succès
- [ ] PM2 status = online
- [ ] https://loookaa.com/spirit/ fonctionne
- [ ] API répond : https://loookaa.com/spirit/api/settings
- [ ] Login admin fonctionne
- [ ] Vérifier que .htaccess et .env n'ont pas été écrasés

---

## Support

**Projet** : Loookaa Spirit
**Hébergement** : o2switch
**Framework** : React 19 + Vite + Express.js
**Version** : 1.1

En cas de problème persistant, contactez le support o2switch pour vérifier :
- AllowOverride activé sur le domaine loookaa.com
- Permissions sur ~/loookaa/spirit/
- Configuration Apache

---

✨ **Bon développement !** ✨
