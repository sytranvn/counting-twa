import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import fs from 'fs/promises'

function generateManifest() {
  return {
    name: 'generate-manifest',
    async writeBundle(options: any) {
      const data = {
        url: process.env.VITE_APP_URL,
        name: process.env.VITE_APP_TITLE,
        iconUrl: `${process.env.VITE_APP_URL}/logo.png`
      }
      const outPath = path.resolve(options.dir, 'tonconnect-manifest.json')
      try {
        await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('\ntonconnect-manifest.json')
      } catch (err) {
        console.error('Error generating tonconnect-manifest.json', err);
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [generateManifest(), react(), nodePolyfills(), ],
  base: '/',
  build: {
    chunkSizeWarningLimit: 5000,
  },
})
