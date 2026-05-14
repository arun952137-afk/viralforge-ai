'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16, display: 'inline-block', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.25)',
      borderTopColor: '#fff', animation: 'spin .7s linear infinite',
    }} />
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [oauthBusy,setOauthBusy]= useState<string | null>(null)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !pass) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if (error) throw error
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally { setLoading(false) }
  }

  async function oauth(provider: 'google' | 'github') {
    setOauthBusy(provider)
    try {
      // redirectTo must match one of the Redirect URLs in Supabase Auth settings
      // Supabase will append the hash tokens to this URL after OAuth completes
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (error) throw error
      // Browser navigates away to provider
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `${provider} login failed`)
      setOauthBusy(null)
    }
  }

  const busy = loading || !!oauthBusy

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 22, color: '#fff',
          margin: '0 auto 16px', boxShadow: '0 0 28px rgba(124,58,237,0.55)',
        }}>C</div>
        <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>Sign in to CREOVA Studio</p>
      </div>

      <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => oauth('google')} disabled={busy} className="btn btn-s"
          style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14, opacity: busy ? 0.6 : 1 }}>
          {oauthBusy === 'google' ? <Spinner /> : <><GoogleIcon /> Continue with Google</>}
        </button>

        <button onClick={() => oauth('github')} disabled={busy} className="btn btn-s"
          style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14, opacity: busy ? 0.6 : 1 }}>
          {oauthBusy === 'github' ? <Spinner /> : <><GitHubIcon /> Continue with GitHub</>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>or email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
        </div>

        <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
              EMAIL
            </label>
            <input className="inp" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--violet2)', textDecoration: 'none' }}>
                Forgot?
              </Link>
            </div>
            <input className="inp" type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" disabled={busy} className="btn btn-p"
            style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15, marginTop: 4, opacity: busy ? 0.7 : 1 }}>
            {loading ? <Spinner /> : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', marginTop: 8 }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--violet2)', textDecoration: 'none', fontWeight: 600 }}>
            Start free →
          </Link>
        </p>
      </div>
    </div>
  )
}
