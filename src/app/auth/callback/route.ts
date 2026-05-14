import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // No code means implicit flow sent tokens as hash — handle client-side
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/confirm`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] code exchange error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user) {
    // Safety net: ensure public.users row exists
    await supabase.from('users').upsert({
      id: data.user.id,
      email: data.user.email,
      username:
        data.user.user_metadata?.preferred_username ||
        data.user.user_metadata?.user_name ||
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        (data.user.email ? data.user.email.split('@')[0] : 'creator'),
      plan: 'free',
      credits: 10,
    }, { onConflict: 'id', ignoreDuplicates: true })
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
