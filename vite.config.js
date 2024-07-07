import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { domain } from './domain'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.jsx",
  })],
  server: {
    watch: {
      usePolling: true,
    },
    port: 5173,
  },
  base: `https://${domain}.netlify.app`
})
