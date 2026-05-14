import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Ensure user row exists in public.users
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.preferred_username 
          || data.user.user_metadata?.user_name
          || data.user.user_metadata?.name
          || data.user.email?.split('@')[0]
          || 'creator',
        plan: 'free',
        credits: 10,
      }, { onConflict: 'id', ignoreDuplicates: true })
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
