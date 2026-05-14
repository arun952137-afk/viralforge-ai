import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // NEVER intercept auth routes — they handle their own sessions
  if (
    path.startsWith('/auth/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/favicon') ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — critical for PKCE token rotation
  const { data: { user } } = await supabase.auth.getUser()

  const PROTECTED = [
    '/dashboard', '/studio', '/copilot', '/analytics',
    '/viral-engine', '/competitor', '/trends', '/brand',
    '/faceless', '/scheduler', '/projects', '/history',
    '/billing', '/profile',
  ]
  const AUTH_ONLY = ['/login', '/signup', '/forgot-password']

  const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + '/'))
  const isAuthOnly  = AUTH_ONLY.some(p => path.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthOnly && user) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
