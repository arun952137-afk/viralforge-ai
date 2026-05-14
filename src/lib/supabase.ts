import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use implicit flow — PKCE breaks in SSR/Vercel because the code_verifier
// stored in localStorage on the client can't be read by the server-side callback.
// Implicit flow sends tokens directly in the URL hash, handled client-side.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})
