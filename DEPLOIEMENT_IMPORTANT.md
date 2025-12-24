# ⚠️ ATTENTION : Utiliser UNIQUEMENT `deploy.sh`

## 🚫 NE PLUS UTILISER `deploy-git.sh`

Le script `deploy-git.sh` a été **SUPPRIMÉ** car il cause des problèmes graves :

### ❌ Problèmes avec `deploy-git.sh` :

1. **`git reset --hard`** → Écrase TOUT :
   - `.htaccess` (perd la correction du $1 pour l'API)
   - `.env` (perd le JWT_SECRET de production)
   - `data/settings.json` (perd les catégories)
   - `data/digikoder.json` (perd les contenus)

2. **`npm run build` sur le serveur** :
   - Peut échouer (mémoire insuffisante sur o2switch)
   - Utilise potentiellement un mauvais `vite.config.js`
   - Build avec de mauvais paths (`/assets/` au lieu de `/spirit/assets/`)

3. **Workflow Git obligatoire** :
   - Force à commit/push avant chaque déploiement
   - Ralentit le développement

---

## ✅ Utiliser `deploy.sh` à la place

### Avantages :

1. ✅ **Build LOCAL** → Pas de problème de RAM, utilise toujours le bon vite.config
2. ✅ **PRÉSERVE la config** → `.htaccess`, `.env`, `data/` ne sont jamais écrasés
3. ✅ **Upload SCP rapide** → Uniquement `dist/`, `server/`, `package.json`
4. ✅ **Pas de Git obligatoire** → Déployez directement vos modifications locales

### Utilisation :

```bash
# 1. Développer et tester localement
npm run start:all

# 2. Déployer
./deploy.sh
```

C'est tout ! 🎉

---

## 📋 Ce que fait `deploy.sh`

```bash
# Étape 1 : Build local (évite les problèmes de mémoire)
npm run build

# Étape 2 : Upload via SCP
scp -r dist/* clmi3187@sapotier.o2switch.net:~/loookaa/spirit/
scp -r server/ clmi3187@sapotier.o2switch.net:~/loookaa/spirit/
scp -r data/ clmi3187@sapotier.o2switch.net:~/loookaa/spirit/
scp package.json clmi3187@sapotier.o2switch.net:~/loookaa/spirit/

# Étape 3 : Configuration serveur (PRÉSERVATION)
ssh clmi3187@sapotier.o2switch.net bash << 'EOF'
    cd ~/loookaa/spirit

    # Crée .env UNIQUEMENT s'il n'existe pas
    if [ ! -f ".env" ]; then
        echo "PORT=3002" > .env
        echo "JWT_SECRET=CHANGEZ_CE_SECRET" >> .env
    fi

    # Crée .htaccess UNIQUEMENT s'il n'existe pas
    if [ ! -f ".htaccess" ]; then
        # Création du .htaccess avec la règle $1 correcte
    fi

    # Installe les dépendances et redémarre PM2
    npm install --production
    pm2 restart loookaa-spirit || pm2 start server/index.cjs --name "loookaa-spirit"
EOF
```

---

## 🔒 Sécurité

Le script `deploy.sh` :
- Ne touche JAMAIS aux fichiers de configuration existants
- Ne fait pas de `git reset --hard` destructif
- Préserve les modifications manuelles sur le serveur

---

**Pour toute question, voir le README.md**
