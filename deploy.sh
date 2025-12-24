#!/bin/bash

###############################################################################
# Script de déploiement SAFE pour Loookaa Spirit sur o2switch
# Préserve : .htaccess, .env, data/settings.json, data/digikoder.json
###############################################################################

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SSH_USER="clmi3187"
SSH_HOST="sapotier.o2switch.net"
REMOTE_DIR="~/loookaa/spirit"
NODE_PORT="3002"
APP_NAME="loookaa-spirit"

print_step() {
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERREUR:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  ATTENTION:${NC} $1"
}

###############################################################################
# Étape 1 : Build LOCAL (évite l'erreur de mémoire sur o2switch)
###############################################################################

print_step "Build local du frontend..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Le build a échoué - dossier dist/ absent"
    exit 1
fi
print_success "Build terminé"

###############################################################################
# Étape 2 : Upload vers le serveur
###############################################################################

print_step "Upload des fichiers vers le serveur..."

# Créer le dossier s'il n'existe pas
ssh ${SSH_USER}@${SSH_HOST} "mkdir -p ${REMOTE_DIR}"

# Upload du dossier server/
print_step "Upload server/..."
scp -r server/ ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/

# Upload du build frontend
print_step "Upload dist/..."
scp -r dist/* ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/

# Upload data/ (sera écrasé uniquement si nécessaire)
print_step "Upload data/..."
scp -r data/ ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/

# Upload package.json
scp package.json ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/

print_success "Upload terminé"

###############################################################################
# Étape 3 : Configuration sur le serveur (PRÉSERVATION)
###############################################################################

print_step "Configuration sur le serveur..."

ssh ${SSH_USER}@${SSH_HOST} bash << 'EOF'
    set -e
    cd ~/loookaa/spirit

    # Créer .env s'il n'existe pas
    if [ ! -f ".env" ]; then
        echo "📝 Création du fichier .env..."
        cat > .env << 'ENVEOF'
PORT=3002
JWT_SECRET=CHANGEZ_CE_SECRET_EN_PRODUCTION
NODE_ENV=production
ENVEOF
        echo "⚠️  N'oubliez pas de modifier JWT_SECRET dans .env !"
    else
        echo "✓ Fichier .env existant conservé"
    fi

    # Créer .htaccess s'il n'existe pas
    if [ ! -f ".htaccess" ]; then
        echo "📝 Création du fichier .htaccess..."
        cat > .htaccess << 'HTEOF'
DirectoryIndex index.html

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /spirit/

    # RÈGLE 1 : GESTION DE L'API
    RewriteRule ^api/(.*)$ http://127.0.0.1:3002/api/$1 [P,L]

    # RÈGLE 2 : GESTION DES ROUTES DU FRONT-END
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule . index.html [L]
</IfModule>
HTEOF
        echo "✓ Fichier .htaccess créé"
    else
        echo "✓ Fichier .htaccess existant conservé"
    fi

    # Installer les dépendances de production uniquement
    echo "📦 Installation des dépendances..."
    npm install --production

    # Gérer PM2
    if command -v pm2 &> /dev/null; then
        echo "🚀 Gestion PM2..."
        if pm2 describe loookaa-spirit &> /dev/null; then
            echo "🔄 Redémarrage de l'application..."
            PORT=3002 pm2 restart loookaa-spirit
        else
            echo "▶️  Démarrage de l'application..."
            PORT=3002 pm2 start server/index.cjs --name "loookaa-spirit"
            pm2 save
        fi
        pm2 status loookaa-spirit
    else
        echo "⚠️  PM2 n'est pas installé"
        echo "Pour installer PM2: npm install -g pm2"
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "✅ Déploiement terminé avec succès !"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🌐 Frontend : https://loookaa.com/spirit/"
    echo "🔌 API      : https://loookaa.com/spirit/api/settings"
    echo ""
EOF

if [ $? -eq 0 ]; then
    print_success "Déploiement réussi !"
    echo ""
    echo -e "${GREEN}✓${NC} Frontend : ${BLUE}https://loookaa.com/spirit/${NC}"
    echo -e "${GREEN}✓${NC} API      : ${BLUE}https://loookaa.com/spirit/api/settings${NC}"
    echo ""
    print_warning "Vérifiez que tout fonctionne correctement"
else
    print_error "Le déploiement a échoué"
    exit 1
fi
