import path from "path"
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---------------------------------------------------------------------------
// Content Security Policy — tightened for production hardening (issue #637)
// Supabase, Gemini API, and self-hosted assets are explicitly whitelisted.
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  // Scripts: allow self + Vite HMR websocket in dev
  "script-src 'self' 'unsafe-inline'",
  // Styles: allow self + inline styles required by Tailwind/shadcn
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: allow self, data URIs, and Supabase storage
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
  // Fetch/XHR: allow Supabase REST/Auth, Gemini API, and local backend
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://generativelanguage.googleapis.com http://localhost:8000 http://localhost:3000",
  // Workers
  "worker-src 'self' blob:",
  // Framing: prevent clickjacking
  "frame-ancestors 'none'",
  // No plugins
  "object-src 'none'",
  // Upgrade insecure requests in production
  "upgrade-insecure-requests",
].join("; ")

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["next-themes"],
  },
  build: {
    sourcemap: true,
    // Split vendor chunks for better caching (pairs with lazy routing in issue #638)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', '@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    // Inject security headers in dev server responses
    headers: {
      "Content-Security-Policy": CSP,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  preview: {
    // Same headers for `vite preview` (production-like local testing)
    headers: {
      "Content-Security-Policy": CSP,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    },
  },
    sourcemap: 'hidden'
  }
})
