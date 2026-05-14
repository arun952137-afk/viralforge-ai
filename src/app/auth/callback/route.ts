import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url    = new URL(request.url)
  const code   = url.searchParams.get('code')
  const next   = url.searchParams.get('next') ?? '/dashboard'
  const origin = url.origin

  if (!code) {
    // Implicit flow — tokens in hash fragment, handled client-side
    return NextResponse.redirect(`${origin}/auth/confirm`)
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[callback] exchange error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data?.user) {
      // Safety net: upsert user row (DB trigger is primary, this is fallback)
      const { user } = data
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        username:
          user.user_metadata?.preferred_username ||
          user.user_metadata?.user_name ||
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          (user.email ? user.email.split('@')[0] : 'creator'),
        plan: 'free',
        credits: 10,
      }, { onConflict: 'id', ignoreDuplicates: true })
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('[callback] unexpected:', err)
    return NextResponse.redirect(`${origin}/login`)
  }
}
