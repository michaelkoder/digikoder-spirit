#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🔍 DIAGNOSTIC APACHE DOCUMENTROOT - Loookaa Spirit"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "📋 OBJECTIF : Identifier où Apache sert réellement les fichiers"
echo ""

echo "1️⃣  Vérification de l'environnement cPanel"
echo "───────────────────────────────────────────────────────────"
echo "Recherche des variables d'environnement cPanel..."
env | grep -i "document\|home\|public" | sort
echo ""

echo "2️⃣  Liste des dossiers web potentiels"
echo "───────────────────────────────────────────────────────────"
ls -la ~ | grep -E "(www|html|htdocs|public|loookaa)" | awk '{print $9, $10, $11}'
echo ""

echo "3️⃣  Vérification du DocumentRoot via PHP"
echo "───────────────────────────────────────────────────────────"
# Créer un fichier PHP temporaire pour obtenir le DocumentRoot
cat > ~/loookaa/check-docroot.php <<'EOF'
<?php
echo "DOCUMENT_ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "SCRIPT_FILENAME: " . $_SERVER['SCRIPT_FILENAME'] . "\n";
echo "PWD: " . getcwd() . "\n";
?>
EOF

echo "✅ Fichier check-docroot.php créé dans ~/loookaa/"
echo "   Accédez à : https://loookaa.com/check-docroot.php"
echo "   Puis supprimez-le avec : rm ~/loookaa/check-docroot.php"
echo ""

echo "4️⃣  Test de création de fichier dans différents emplacements"
echo "───────────────────────────────────────────────────────────"

# Test dans ~/loookaa/
if [ -d ~/loookaa/ ]; then
    echo "TEST LOOOKAA" > ~/loookaa/apache-test.txt
    echo "✅ Créé ~/loookaa/apache-test.txt"
    echo "   Testez : https://loookaa.com/apache-test.txt"
else
    echo "❌ ~/loookaa/ n'existe pas"
fi

# Test dans ~/loookaa/spirit/
if [ -d ~/loookaa/spirit/ ]; then
    echo "TEST SPIRIT" > ~/loookaa/spirit/apache-test-spirit.txt
    echo "✅ Créé ~/loookaa/spirit/apache-test-spirit.txt"
    echo "   Testez : https://loookaa.com/spirit/apache-test-spirit.txt"
else
    echo "❌ ~/loookaa/spirit/ n'existe pas"
fi

# Test dans ~/public_html/ si existe
if [ -d ~/public_html/ ] && [ ! -L ~/public_html/ ]; then
    echo "TEST PUBLIC_HTML" > ~/public_html/apache-test-public.txt
    echo "✅ Créé ~/public_html/apache-test-public.txt"
    echo "   Testez : https://loookaa.com/apache-test-public.txt"
fi

echo ""

echo "5️⃣  Vérification des symlinks"
echo "───────────────────────────────────────────────────────────"
find ~ -maxdepth 1 -type l -exec ls -la {} \; 2>/dev/null
echo ""

echo "6️⃣  Contenu du .htaccess WordPress actuel (premières lignes)"
echo "───────────────────────────────────────────────────────────"
if [ -f ~/loookaa/.htaccess ]; then
    head -25 ~/loookaa/.htaccess
else
    echo "❌ ~/loookaa/.htaccess n'existe pas"
fi
echo ""

echo "7️⃣  Contenu du .htaccess Spirit actuel"
echo "───────────────────────────────────────────────────────────"
if [ -f ~/loookaa/spirit/.htaccess ]; then
    cat ~/loookaa/spirit/.htaccess
else
    echo "❌ ~/loookaa/spirit/.htaccess n'existe pas"
fi
echo ""

echo "8️⃣  Test de résolution DNS et HTTP"
echo "───────────────────────────────────────────────────────────"
echo "Test index WordPress..."
curl -I https://loookaa.com/ 2>&1 | head -5
echo ""
echo "Test fichier PHP créé..."
curl -I https://loookaa.com/check-docroot.php 2>&1 | head -5
echo ""
echo "Test fichier texte racine..."
curl -I https://loookaa.com/apache-test.txt 2>&1 | head -5
echo ""
echo "Test /spirit/ (index.html)..."
curl -I https://loookaa.com/spirit/ 2>&1 | head -5
echo ""
echo "Test /spirit/apache-test-spirit.txt..."
curl -I https://loookaa.com/spirit/apache-test-spirit.txt 2>&1 | head -5
echo ""

echo "9️⃣  Statut PM2"
echo "───────────────────────────────────────────────────────────"
pm2 status 2>&1 | grep -E "(loookaa|Status|online|stopped)"
echo ""

echo "🔟 Test API en local (port 3002)"
echo "───────────────────────────────────────────────────────────"
curl -s http://localhost:3002/api/settings 2>&1 | head -3
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Diagnostic terminé !"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 ACTIONS SUIVANTES :"
echo ""
echo "1. Consultez https://loookaa.com/check-docroot.php"
echo "   → Cela vous donnera le VRAI DocumentRoot d'Apache"
echo ""
echo "2. Testez les fichiers créés :"
echo "   → https://loookaa.com/apache-test.txt"
echo "   → https://loookaa.com/spirit/apache-test-spirit.txt"
echo ""
echo "3. Nettoyez les fichiers de test :"
echo "   rm ~/loookaa/check-docroot.php"
echo "   rm ~/loookaa/apache-test.txt"
echo "   rm ~/loookaa/spirit/apache-test-spirit.txt"
echo ""
echo "4. Partagez les résultats pour analyse"
echo ""
