'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const planParam = params.get('plan') ?? 'free'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !username) { toast.error('Please fill in all fields'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          username,
          plan: planParam === 'pro' ? 'pro' : planParam === 'studio' ? 'studio' : 'free',
          credits: planParam === 'studio' ? -1 : planParam === 'pro' ? 500 : 10,
        }, { onConflict: 'id', ignoreDuplicates: false })
        toast.success('Account created! Welcome to CREOVA 🚀')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `${provider} sign-in failed`)
      setOauthLoading(null)
    }
  }

  const planInfo: Record<string, { label: string; color: string }> = {
    free:    { label: '10 free AI credits included', color: '#93c5fd' },
    starter: { label: 'Starter Plan — ₹799/mo (60% OFF)', color: '#67e8f9' },
    pro:     { label: 'Creator Pro — ₹1,799/mo (60% OFF)', color: '#b47fff' },
    studio:  { label: 'Studio Plan — ₹4,499/mo (60% OFF)', color: '#f9a8d4' },
  }
  const plan = planInfo[planParam] ?? planInfo.free

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 900, fontSize: 20, color: '#fff', margin: '0 auto 16px', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}>C</div>
        <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Create your account</h1>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 12, fontWeight: 600, color: plan.color }}>
          {plan.label}
        </div>
      </div>

      <div className="card" style={{ padding: '32px 28px' }}>
        <button onClick={() => handleOAuth('google')} disabled={!!oauthLoading || loading}
          className="btn btn-s" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: 10, fontSize: 14 }}>
          {oauthLoading === 'google' ? <Spinner /> : (
            <><svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>Sign up with Google</>
          )}
        </button>

        <button onClick={() => handleOAuth('github')} disabled={!!oauthLoading || loading}
          className="btn btn-s" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: 22, fontSize: 14 }}>
          {oauthLoading === 'github' ? <Spinner /> : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>Sign up with GitHub</>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>or email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border2)' }} />
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>CREATOR NAME / HANDLE</label>
            <input className="inp" placeholder="@yourchannel" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>EMAIL</label>
            <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>PASSWORD (8+ CHARACTERS)</label>
            <input className="inp" type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading || !!oauthLoading} className="btn btn-p"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4, fontSize: 15 }}>
            {loading ? <Spinner /> : '🚀 Create Free Account'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
          By creating an account you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--violet2)', textDecoration: 'none' }}>Terms</Link>
          {' '}&{' '}
          <Link href="/privacy" style={{ color: 'var(--violet2)', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', marginTop: 12 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--violet2)', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text3)' }}>
        Loading…
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
