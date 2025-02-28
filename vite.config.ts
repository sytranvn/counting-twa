import { defineConfig, createLogger, UserConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import fs from 'fs/promises'
import { loadEnv } from 'vite'

function generateManifest(config: UserConfig) {
  const env = loadEnv(config.mode!, process.cwd(), 'VITE_')
  const logger = createLogger()
  logger.info(config.mode!)
  const data = {
    url: env.VITE_APP_URL,
    name: env.VITE_APP_TITLE,
    iconUrl: `${env.VITE_APP_URL}/logo.png`
  }
  return {
    name: 'generate-manifest',
    async writeBundle(options: any) {
      await fs.writeFile('log.log', config.mode!)
      const outPath = path.resolve(options.dir, 'tonconnect-manifest.json')
      try {
        await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
      } catch (err) {
        logger.error('Error generating tonconnect-manifest.json ' + err, { timestamp: true });
      }
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/tonconnect-manifest.json') {

          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify(data));
        } else {
          next();
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), nodePolyfills(), generateManifest({ mode })],
  base: '/',
  build: {
    chunkSizeWarningLimit: 5000,
  },
}))
