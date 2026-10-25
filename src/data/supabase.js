import { createClient } from '@supabase/supabase-js'

// Browser client: public URL and publishable (anon) key only. The session is kept in
// localStorage and refreshed automatically, so a reload restores the signed-in user.
// Row Level Security decides what each request may read or change.
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_ANON_KEY ?? '', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
