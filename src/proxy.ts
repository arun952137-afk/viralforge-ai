import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // CRITICAL: Never block the auth callback — it needs to exchange the OAuth code first
  if (path.startsWith('/auth/')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return supabaseResponse

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do NOT add logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  const PROTECTED = [
    '/dashboard', '/studio', '/copilot', '/analytics',
    '/viral-engine', '/competitor', '/trends',
    '/brand', '/faceless', '/scheduler',
    '/projects', '/history', '/billing', '/profile',
  ]

  const AUTH_PAGES = ['/login', '/signup', '/forgot-password']

  const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + '/'))
  const isAuthPage = AUTH_PAGES.some(p => path.startsWith(p))

  // Not logged in → redirect to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Already logged in → skip auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
