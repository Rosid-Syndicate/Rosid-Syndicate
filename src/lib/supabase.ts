import { createClient } from '@supabase/supabase-js'

// Both values are intentionally public (the anon key is designed for browser
// use and is protected by Row Level Security). They are no longer hard-coded
// in source so the project can rotate keys or point at another project without
// a code change. vite.config.ts fails the production build with a clear
// message if either variable is missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Admin sessions live in localStorage (Supabase default). Tokens are only
    // ever sent to the Supabase origin; the API functions never receive them.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
