'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function Spinner() {
  return <span style={{ width:16, height:16, display:'inline-block', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', animation:'spin .7s linear infinite' }} />
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

function SignupForm() {
  const router     = useRouter()
  const params     = useSearchParams()
  const plan       = params.get('plan') ?? 'free'
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [oauthBusy,setOauthBusy]= useState<string|null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!username||!email||!pass) { toast.error('Fill in all fields'); return }
    if (pass.length < 8) { toast.error('Password must be 8+ characters'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass })
      if (error) throw error
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id, email, username,
          plan: plan==='pro'?'pro':plan==='studio'?'studio':'free',
          credits: plan==='studio'?-1:plan==='pro'?500:10,
        }, { onConflict:'id', ignoreDuplicates:false })
        toast.success('Account created! Welcome to CREOVA 🚀')
        router.push('/dashboard')
        router.refresh()
      }
    } catch(err:unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed')
    } finally { setLoading(false) }
  }

  async function oauth(provider: 'google'|'github') {
    setOauthBusy(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch(err:unknown) {
      toast.error(err instanceof Error ? err.message : `${provider} failed`)
      setOauthBusy(null)
    }
  }

  const planLabel: Record<string,string> = {
    free:'10 free AI credits included', starter:'Starter — ₹799/mo (60% OFF)',
    pro:'Creator Pro — ₹1,799/mo (60% OFF)', studio:'Studio — ₹4,499/mo (60% OFF)',
  }
  const busy = loading || !!oauthBusy

  return (
    <div style={{ width:'100%', maxWidth:440 }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,#7C3AED,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22, color:'#fff', margin:'0 auto 16px', boxShadow:'0 0 28px rgba(124,58,237,0.55)' }}>C</div>
        <h1 className="syne" style={{ fontSize:28, fontWeight:800, color:'#fff', marginBottom:8 }}>Create your account</h1>
        <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:100, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', fontSize:12, fontWeight:600, color:'#b47fff' }}>{planLabel[plan]??planLabel.free}</div>
      </div>

      <div className="card" style={{ padding:'32px 28px', display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={()=>oauth('google')} disabled={busy} className="btn btn-s"
          style={{ width:'100%', justifyContent:'center', padding:13, fontSize:14 }}>
          {oauthBusy==='google'?<Spinner/>:<><GoogleIcon/> Sign up with Google</>}
        </button>
        <button onClick={()=>oauth('github')} disabled={busy} className="btn btn-s"
          style={{ width:'100%', justifyContent:'center', padding:13, fontSize:14 }}>
          {oauthBusy==='github'?<Spinner/>:<><GitHubIcon/> Sign up with GitHub</>}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'8px 0' }}>
          <div style={{ flex:1, height:1, background:'var(--border2)' }} />
          <span style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>or email</span>
          <div style={{ flex:1, height:1, background:'var(--border2)' }} />
        </div>

        <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:6 }}>CREATOR HANDLE</label>
            <input className="inp" placeholder="@yourchannel" value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username" />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:6 }}>EMAIL</label>
            <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--text2)', fontWeight:600, display:'block', marginBottom:6 }}>PASSWORD (8+ CHARS)</label>
            <input className="inp" type="password" placeholder="Create a strong password" value={pass} onChange={e=>setPass(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={busy} className="btn btn-p"
            style={{ width:'100%', justifyContent:'center', padding:13, fontSize:15, marginTop:4, opacity:busy?0.7:1 }}>
            {loading?<Spinner/>:'🚀 Create Free Account'}
          </button>
        </form>

        <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginTop:6, lineHeight:1.7 }}>
          By signing up you agree to our <Link href="/terms" style={{ color:'var(--violet2)', textDecoration:'none' }}>Terms</Link> & <Link href="/privacy" style={{ color:'var(--violet2)', textDecoration:'none' }}>Privacy</Link>
        </p>
        <p style={{ textAlign:'center', fontSize:14, color:'var(--text3)' }}>
          Already have an account? <Link href="/login" style={{ color:'var(--violet2)', textDecoration:'none', fontWeight:600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text3)' }}>Loading…</div>}>
      <SignupForm />
    </Suspense>
  )
}
