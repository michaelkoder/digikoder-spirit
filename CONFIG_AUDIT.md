# Audit de Configuration - Local vs Production

## 🔍 RÉSUMÉ EXÉCUTIF

**Statut**: ⚠️ **PROBLÈMES TROUVÉS** - Différences critiques entre local et prod

---

## 1️⃣ FRONTEND (Vite + React)

### Configuration Vite
| Paramètre | Valeur | Status |
|-----------|--------|--------|
| **Base path** | `/spirit/` | ✅ Cohérent |
| **Vite port** | `5173` | ✅ Correct |
| **Vite host** | `0.0.0.0` | ✅ Correct |
| **Proxy API** | `/spirit/api` → `http://localhost:3001` | ✅ Configuré |
| **Mode build** | `vite build` | ✅ Correct |

### API_BASE en React
| Contexte | Valeur | Status |
|----------|--------|--------|
| **Développement** | `/spirit` (hardcoded) | ⚠️ Pas de variable env |
| **Production** | `/spirit` (idem) | ⚠️ Pas de variable env |
| **.env.production** | `VITE_API_BASE_URL=/spirit` | ⚠️ **NON UTILISÉ** |

**PROBLÈME 🚨**: 
- React utilise `const API_BASE = '/spirit'` (hardcoded ligne 38)
- `.env.production` définit `VITE_API_BASE_URL=/spirit` mais ce n'est **JAMAIS LU**
- Aucune différence de comportement entre local et prod

---

## 2️⃣ BACKEND EXPRESS (Développement Local)

### Configuration Serveur
| Paramètre | Valeur | Status |
|-----------|--------|--------|
| **Port par défaut** | `3001` (process.env.PORT ou 3001) | ✅ Correct |
| **CORS** | Activé (`app.use(cors())`) | ✅ Correct |
| **Body Parser** | JSON activé | ✅ Correct |
| **Database** | `db_json.cjs` (fichier local) | ⚠️ Voir détails |

**Routes API disponibles**:
- ✅ `GET /api/contents`
- ✅ `POST /api/contents`
- ✅ `PUT /api/contents/:id`
- ✅ `DELETE /api/contents/:id`
- ✅ `GET /api/me` (validation JWT)
- ✅ `POST /api/validate-url` (vérification vidéos)
- ✅ `POST /api/login`
- ✅ `POST /api/logout`
- ✅ `GET /api/settings`
- ✅ `POST /api/settings`

### JWT Configuration
| Paramètre | Serveur | API Vercel | Status |
|-----------|---------|------------|--------|
| **JWT_SECRET** | `process.env.JWT_SECRET \|\| 'dev-secret-key'` | `process.env.JWT_SECRET \|\| 'dev-secret-key'` | ✅ **Identique** |
| **Expire** | `8h` | `8h` | ✅ Identique |

---

## 3️⃣ BACKEND API VERCEL (Production)

### Fichiers API Serverless
```
/api/
  ├── login.js          ✅ Authentification
  ├── logout.js         ✅ Déconnexion
  ├── me.js             ✅ Profil utilisateur
  └── validate-url.js   ✅ Vérification vidéos
```

**PROBLÈME CRITIQUE 🚨**:
- En **production**, les appels API vont à `/api/*` (pas de proxy)
- En **développement**, via Vite proxy: `/spirit/api/*` → `localhost:3001/*`
- Vercel sert l'API depuis `/.netlify/functions/` ou `/api/`

---

## 4️⃣ DIFFÉRENCES IDENTIFIÉES

### 🔴 CRITIQUE

#### 1. **Proxy manquant en production**
```
Local:
  /spirit/api/login → [Vite Proxy] → localhost:3001/api/login ✅

Production:
  /spirit/api/login → ??? (à vérifier)
```

#### 2. **Base de données différente**
```
Local (Express):
  - db_json.cjs (SQLite in-memory ou fichier)
  - Données persistantes dans /data/settings.json

Production (Vercel):
  - Les fonctions serverless NE PARTAGENT PAS d'état
  - Pas de base de données configurée!
```

#### 3. **Variables d'environnement**
```
Production manque:
  - ADMIN_USER (défaut: 'admin')
  - ADMIN_HASH (hash bcrypt du mot de passe)
  - JWT_SECRET (critère de sécurité!)
  - NODE_ENV (pour distinguer dev/prod)
```

### 🟡 MODÉRÉ

#### 1. **Authentification par cookie vs localStorage**
```
Login retourne:
  - Token JWT en localStorage (React)
  - Cookie Set-Cookie (serveur)

Production:
  - Cookie `digikoder_token` avec secure: true si NODE_ENV=production
```

#### 2. **Validation des vidéos mortes**
```
Endpoint `/api/validate-url`:
  - Local: Fetch la page YouTube directement
  - Production: Idem (devrait marcher)
  - Mais: YouTube peut bloquer en prod si pas de User-Agent
```

---

## 5️⃣ CHECKPOINTS CLÉS

### ✅ Correctement configurés
- [x] Port Express (3001)
- [x] Vite proxy pour `/spirit/api`
- [x] JWT_SECRET identique local/prod (fallback)
- [x] Routes API présentes
- [x] CORS activé
- [x] Base path `/spirit/` correct

### ❌ À CORRIGER IMMÉDIATEMENT
- [ ] **Base de données en production** (SQLite? MongoDB?)
- [ ] **Variables d'environnement Vercel** (ADMIN_USER, ADMIN_HASH, JWT_SECRET, NODE_ENV)
- [ ] **Routage API Vercel** (vercel.json?)
- [ ] **User-Agent pour YouTube** (pour validation vidéos)

### ⚠️ À AMÉLIORER
- [ ] Utiliser `VITE_API_BASE_URL` au lieu de hardcoder
- [ ] Ajouter logs d'erreur plus verbeux
- [ ] Tester la sécurité CORS en prod
- [ ] Vérifier les cookies en prod

---

## 6️⃣ RECOMMANDATIONS

### 1. **Créer vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "ADMIN_USER": "@ADMIN_USER",
    "ADMIN_HASH": "@ADMIN_HASH",
    "JWT_SECRET": "@JWT_SECRET",
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 512,
      "maxDuration": 30
    }
  }
}
```

### 2. **Variables d'environnement Vercel**
À configurer dans Vercel Dashboard:
```
ADMIN_USER = admin
ADMIN_HASH = (bcrypt hash du password)
JWT_SECRET = (secret cryptographique fort)
NODE_ENV = production
```

### 3. **Fixer React API_BASE**
```typescript
const API_BASE = process.env.VITE_API_BASE_URL || '/spirit';
```

### 4. **Configurer la base de données en prod**
Options:
- MongoDB Atlas (cloud database)
- Supabase PostgreSQL
- Vercel KV (Redis)
- Garder SQLite mais persister les données

---

## 7️⃣ TESTS À EFFECTUER

### Local
- [x] Login marche
- [x] API proxy fonctionne
- [x] Vidéos mortes détectées
- [ ] Logout et session timeout

### Production (après corrections)
- [ ] API Vercel accessible
- [ ] Login crée un token JWT valide
- [ ] CORS fonctionne depuis le frontend
- [ ] Données persistent entre redéploiements
- [ ] Vidéos mortes détectées

---

## 8️⃣ CHECKLIST DÉPLOIEMENT

- [ ] Créer `vercel.json`
- [ ] Ajouter variables d'env Vercel
- [ ] Tester en développement local
- [ ] Tester build (`npm run build`)
- [ ] Déployer sur Vercel
- [ ] Vérifier les logs Vercel
- [ ] Tester login en production
- [ ] Tester fetch de contenus
- [ ] Tester validation vidéos
- [ ] Tester upload de vidéos (si applicable)

---

## CONCLUSION

**La configuration locale fonctionne bien**, mais **la production n'est pas configurée correctement**:

1. ❌ Pas de `vercel.json`
2. ❌ Pas de variables d'environnement définies
3. ❌ Pas de base de données partagée
4. ⚠️ API Vercel peut ne pas être routée correctement

**Estim du temps pour corriger**: ~30 minutes
