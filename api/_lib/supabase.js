// Server-side Supabase client.
//
// Prefers SUPABASE_SERVICE_ROLE_KEY (server-only secret, never VITE_-prefixed).
// Falls back to the public anon key so the forms keep working before the
// service role is configured — the anon path relies on the "Public can insert
// inquiries" RLS policy. Once the service role is configured, apply
// supabase/migrations/20260919_inquiries_api_only.sql to close the anon path.
//
// No credentials are hard-coded here; if the environment is not configured the
// caller receives `null` and must handle it (the API returns 503 so the
// failure is visible instead of silently returning "success").

import { createClient } from '@supabase/supabase-js'

export function supabaseMode() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return 'service-role'
  if (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) return 'anon'
  return 'unconfigured'
}

export function serverSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-application-name': 'rosid-web-api' } },
  })
}

/**
 * Anon-key client for public *reads* (sitemap, cached public content).
 * Deliberately never the service role: RLS stays the boundary, so a bug in a
 * public endpoint can only ever expose rows the anon role may already read.
 */
export function publicSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-application-name': 'rosid-web-public' } },
  })
}
