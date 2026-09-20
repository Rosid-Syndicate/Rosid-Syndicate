import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_URL = 'https://www.rosiddai.com'

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  // Canonical origin used for <link rel=canonical>, Open Graph URLs, JSON-LD
  // and robots.txt. Override with VITE_SITE_URL when the custom domain goes live.
  process.env.VITE_SITE_URL = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')

  // Fail fast at BUILD time (never at runtime in front of a visitor) when the
  // public Supabase configuration is missing. A failed deploy keeps the previous
  // production build live; a runtime crash would not.
  if (mode === 'production') {
    const missing = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].filter((k) => !env[k])
    if (missing.length) {
      throw new Error(
        `[build] Missing required environment variables: ${missing.join(', ')}. ` +
          'Set them in Vercel → Project → Settings → Environment Variables (see .env.example).'
      )
    }
  }

  return {
    plugins: [react()],
    base: '/',
    build: {
      // Source maps were previously published with the production bundle.
      // Nothing consumes them (no error-tracking service is configured), so
      // they are disabled to avoid shipping 3 MB of source to every visitor.
      sourcemap: false,
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2020',
      rollupOptions: {
        output: {
          // Dependencies are external in the SSR (prerender) build, so chunking
          // only applies to the browser bundle.
          manualChunks: isSsrBuild
            ? undefined
            : {
                'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                supabase: ['@supabase/supabase-js'],
              },
        },
      },
    },
  }
})
