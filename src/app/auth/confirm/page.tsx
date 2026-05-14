'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // getSession() reads the hash fragment and sets the session cookie
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Ensure user row exists
        await supabase.from('users').upsert({
          id: session.user.id,
          email: session.user.email,
          username:
            session.user.user_metadata?.preferred_username ||
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.name ||
            session.user.user_metadata?.full_name ||
            (session.user.email ? session.user.email.split('@')[0] : 'creator'),
          plan: 'free',
          credits: 10,
        }, { onConflict: 'id', ignoreDuplicates: true })
        router.push('/dashboard')
      } else {
        // Also try onAuthStateChange in case session isn't ready yet
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              await supabase.from('users').upsert({
                id: session.user.id,
                email: session.user.email,
                username:
                  session.user.user_metadata?.preferred_username ||
                  session.user.user_metadata?.user_name ||
                  session.user.user_metadata?.name ||
                  (session.user.email ? session.user.email.split('@')[0] : 'creator'),
                plan: 'free',
                credits: 10,
              }, { onConflict: 'id', ignoreDuplicates: true })
              subscription.unsubscribe()
              router.push('/dashboard')
            } else if (event === 'SIGNED_OUT') {
              router.push('/login')
            }
          }
        )
        // Timeout fallback
        setTimeout(() => router.push('/login'), 8000)
      }
    })
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 20
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Syne',
        boxShadow: '0 0 24px rgba(124,58,237,0.6)',
        animation: 'gpulse 2s ease-in-out infinite',
      }}>C</div>
      <div style={{ textAlign: 'center' }}>
        <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          Signing you in…
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>Setting up your CREOVA workspace</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#7C3AED',
            animation: 'pdot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
