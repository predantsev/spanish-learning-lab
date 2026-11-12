// Vite build for the Ukrainian browser UI (WP-06).
// Run from the repository root: `npm run build` (vite build --config apps/web/vite.config.ts).
// Output: dist/web at the repository root; the local Node service serves it on the same origin as /api/v1.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const webRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = fileURLToPath(new URL('../../dist/web', import.meta.url));

// Optional development proxy to an already running local service (never started by this config).
const apiOrigin = process.env.SLL_API_ORIGIN;

export default defineConfig({
  root: webRoot,
  base: '/',
  publicDir: false,
  // JSX uses the automatic runtime (tsconfig "jsx": "react-jsx"); no React plugin is required.
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  build: {
    outDir,
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    // Keep every asset as a file: the service CSP allows self-hosted scripts/styles/media only.
    assetsInlineLimit: 0,
  },
  server: {
    host: '127.0.0.1',
    strictPort: false,
    ...(apiOrigin ? { proxy: { '/api': { target: apiOrigin, changeOrigin: false } } } : {}),
  },
});
