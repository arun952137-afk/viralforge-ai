import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url    = new URL(request.url)
  const code   = url.searchParams.get('code')
  const origin = url.origin

  if (code) {
    // Email magic link / PKCE path — shouldn't happen with implicit flow
    // but handle gracefully by redirecting to confirm page
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`)
  }

  // Implicit flow: tokens are in the hash fragment (#access_token=...)
  // Hash is never sent to server, so redirect to client-side confirm page
  // which reads the hash and sets the session
  return NextResponse.redirect(`${origin}/auth/confirm`)
}
