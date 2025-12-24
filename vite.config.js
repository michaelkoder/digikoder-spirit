import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/spirit/', // IMPORTANT: Base path pour la production
  server: {
    proxy: {
      // Redirige les requêtes de /spirit/api vers votre backend Node.js
      '/spirit/api': {
        target: 'http://localhost:3002', // L'adresse de votre serveur API local
        changeOrigin: true, // Nécessaire pour les hôtes virtuels
        rewrite: (path) => path.replace(/^\/spirit\/api/, '/api'), // Réécrit l'URL pour le backend
      },
    }
  }
})
