# Guide de Déploiement - Digikoder Spirit

## 🚀 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Vercel
- bcryptjs pour hash le password admin

---

## 📋 1. Configuration Locale (Développement)

### 1.1 Installer les dépendances
```bash
npm install
```

### 1.2 Créer `.env.local` pour le développement
```bash
cp .env.example .env.local
```

Éditer `.env.local`:
```dotenv
VITE_API_BASE_URL=/spirit
NODE_ENV=development
ADMIN_USER=admin
ADMIN_HASH=<votre_hash_bcrypt>
JWT_SECRET=dev-secret-key-minimum-32-chars-long
PORT=3001
```

### 1.3 Générer le hash bcrypt du password
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('votrePassword', 10));"
```

### 1.4 Démarrer en développement

Terminal 1 - Frontend (Vite):
```bash
npm run dev
```
Accès: `http://localhost:5173/spirit/`

Terminal 2 - Backend (Express):
```bash
npm run start:server
```
API: `http://localhost:3001/api/*`

---

## 🌐 2. Configuration Production (Vercel)

### 2.1 Vérifier les fichiers de configuration

✅ `vercel.json` doit exister (créé automatiquement)
✅ `package.json` scripts doivent être corrects
✅ `.env.production` avec `VITE_API_BASE_URL=/spirit`

### 2.2 Configurer les variables d'environnement Vercel

**Méthode 1: Dashboard Vercel**
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Aller dans `Settings` → `Environment Variables`
4. Ajouter:

```
ADMIN_USER = admin
ADMIN_HASH = <hash_bcrypt_du_password>
JWT_SECRET = <secret_crypto_fort_min_32_chars>
NODE_ENV = production
```

**Méthode 2: Via CLI Vercel**
```bash
vercel env add ADMIN_USER
vercel env add ADMIN_HASH
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### 2.3 Générer un JWT_SECRET sécurisé
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
```

### 2.4 Déployer sur Vercel

**Si première fois:**
```bash
npm install -g vercel
vercel login
vercel
```

**Pour les mises à jour:**
```bash
git push  # Push sur GitHub/GitLab
# Vercel déploie automatiquement
```

Ou:
```bash
vercel --prod
```

---

## 🔐 3. Sécurité

### Variables sensibles (NE JAMAIS commiter)
```
ADMIN_HASH - hash du password admin
JWT_SECRET - clé secrète JWT
DATABASE_URL - si applicable
```

### .gitignore
```
.env
.env.local
.env.*.local
node_modules/
dist/
```

### Paramètres CORS
Vercel configure automatiquement avec `vercel.json`:
```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      {
        "key": "Access-Control-Allow-Origin",
        "value": "*"
      },
      {
        "key": "Access-Control-Allow-Methods",
        "value": "GET,POST,PUT,DELETE,OPTIONS"
      }
    ]
  }
]
```

---

## 📝 4. Configuration API

### Routes disponibles (Local + Vercel)

#### Authentification
```
POST /api/login
  Body: { email: "admin", password: "..." }
  Response: { token, email, role, isAuthenticated }

POST /api/logout
  Headers: { Authorization: "Bearer <token>" }

GET /api/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { email, role }
```

#### Contenu
```
GET /api/contents
  Retourne la liste de toutes les vidéos

POST /api/contents
  Headers: { Authorization: "Bearer <token>" }
  Body: { title, url, category, description, ... }

PUT /api/contents/:id
  Headers: { Authorization: "Bearer <token>" }
  Body: { title, url, ... }

DELETE /api/contents/:id
  Headers: { Authorization: "Bearer <token>" }
```

#### Validation
```
POST /api/validate-url
  Body: { url: "https://youtube.com/watch?v=..." }
  Response: { alive: true/false }
```

---

## 🧪 5. Tests

### Test Local
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run start:server

# Terminal 3 - Test API
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"votrePassword"}'
```

### Test Production (Vercel)
```bash
# Remplacer YOUR_DOMAIN par votre domaine Vercel
curl -X POST https://your-domain.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"votrePassword"}'
```

---

## 🐛 6. Dépannage

### "Cannot POST /api/login" (404)
**Local**:
- Vérifier que `npm run start:server` est lancé
- Vérifier port 3001 libre

**Production**:
- Vérifier `vercel.json` existe
- Vérifier variables d'env Vercel sont définies
- Lancer `vercel logs` pour voir les erreurs

### "Auth check failed with status 404"
**Local**:
- Vérifier proxy Vite: `/spirit/api` → `localhost:3001`
- Vérifier `vite.config.ts` est correct

**Production**:
- Vérifier JWT_SECRET est défini en Vercel
- Vérifier ADMIN_HASH est correct

### "Invalid credentials"
- Vérifier ADMIN_HASH correspond au password testé
- Régénérer hash si doute:
  ```bash
  node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('votrePassword', 10));"
  ```

### Vidéos mortes non détectées
**Local**:
- Vérifier endpoint `/api/validate-url` retourne `alive: false`
- Tester avec un vraie vidéo supprimée (3M0hJ2qqqqI)

**Production**:
- Même endpoint doit fonctionner
- YouTube peut bloquer si User-Agent manquant (déjà géré)

---

## 📚 7. Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)

---

## ✅ Checklist Déploiement

- [ ] `.env.local` créé avec variables correctes (local)
- [ ] `npm run dev` et `npm run start:server` marchent
- [ ] Login fonctionne localement
- [ ] Vidéos se chargent
- [ ] Build local: `npm run build`
- [ ] `vercel.json` existe
- [ ] Variables d'env Vercel définies (ADMIN_USER, ADMIN_HASH, JWT_SECRET, NODE_ENV)
- [ ] Déploiement Vercel: `vercel --prod`
- [ ] Vérifier logs: `vercel logs`
- [ ] Tester API production
- [ ] Tester login production
- [ ] Tester chargement vidéos production
- [ ] Tester détection vidéos mortes

---

**Last Updated**: 2025-12-18
