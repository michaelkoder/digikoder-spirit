<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Digikoder Spirit (Local JSON-File)

Frontend React (Vite) + Backend Express, avec persistance 100% locale via fichier JSON.

## Prérequis
- Node.js (>= 18)

## Lancement
1. Installer les dépendances:
   `npm install`
2. Démarrer l'API locale (port par défaut 3005):
   `npm run start:server`
3. Démarrer le front (Vite):
   `npm run dev`

## Données locales
- Les contenus sont stockés dans `data/digikoder.json`.
- Les endpoints Express: `GET/POST/PUT/DELETE /api/contents`, `GET /api/profiles?email=...`.

## Seed & import
- Seed de base: `npm run seed:local`
- Import des liens du PDF OUTILS MEDITATION: `node scripts/import_pdf_links.cjs`

## Ports
- Backend Express: `3005` (configurable dans `server/index.cjs`)
- Frontend Vite: `3003` (auto, peut changer si utilisé)

## Mode 100% local
- Pas de Supabase/SQLite. Le backend n'utilise que le fichier JSON.


## CREER UN NOUVEAU SUPER ADMIN 
## node scripts/create_superadmin.cjs email@gmail.com pass