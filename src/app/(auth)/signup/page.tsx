'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function SignupForm() {
  const router = useRouter()
  const params = useSearchParams()
  const planParam = params.get('plan') ?? 'free'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !username) { toast.error('Fill in all fields'); return }
    if (password.length < 8) { toast.error('Password must be 8+ characters'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id, email, username,
          plan: planParam === 'pro' ? 'pro' : planParam === 'studio' ? 'studio' : 'free',
          credits: planParam === 'studio' ? -1 : planParam === 'pro' ? 500 : 10,
        })
        toast.success('Account created! Check your email.')
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      })
      if (error) throw error
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  const planLabels: Record<string, string> = { free: 'Free (10 credits)', starter: 'Starter — ₹799/mo', pro: 'Creator Pro — ₹1,799/mo', studio: 'Studio — ₹4,499/mo' }

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="syne" style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Create your account</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>
          {planParam !== 'free' ? <><span className="tag tv">{planLabels[planParam]}</span> plan selected</> : '10 free credits on signup'}
        </p>
      </div>

      <div className="card" style={{ padding: '36px 32px' }}>
        <button onClick={handleGoogle} disabled={googleLoading}
          className="btn btn-s" style={{ width: '100%', justifyContent: 'center', padding: 13, marginBottom: 20, fontSize: 14 }}>
          {googleLoading
            ? <span className="a-sp" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
            : <><svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google</>
          }
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>or email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Creator handle</label>
            <input className="inp" placeholder="@yourchannel" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
            <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
            <input className="inp" type="password" placeholder="8+ characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4, fontSize: 15 }}>
            {loading
              ? <span className="a-sp" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
              : '🚀 Create Free Account'
            }
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          By signing up you agree to our <Link href="/terms" style={{ color: 'var(--violet2)' }}>Terms</Link> & <Link href="/privacy" style={{ color: 'var(--violet2)' }}>Privacy Policy</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', marginTop: 12 }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--violet2)', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return <Suspense fallback={<div style={{ color: 'var(--text3)', textAlign: 'center', padding: 60 }}>Loading…</div>}><SignupForm /></Suspense>
}
