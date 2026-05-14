import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
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
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // Ensure the user row exists in public.users (safety net on top of the DB trigger)
    const { error: upsertError } = await supabase.from('users').upsert({
      id: data.user.id,
      email: data.user.email,
      username:
        data.user.user_metadata?.preferred_username ||
        data.user.user_metadata?.user_name ||
        data.user.user_metadata?.name ||
        (data.user.email ? data.user.email.split('@')[0] : null) ||
        'creator',
      plan: 'free',
      credits: 10,
    }, { onConflict: 'id', ignoreDuplicates: true })

    if (upsertError) {
      console.error('User upsert error:', upsertError.message)
      // Don't block — user is authenticated, just proceed
    }
  }

  // Redirect to dashboard (or wherever they were going)
  return NextResponse.redirect(`${origin}${next}`)
}
