'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function AuthConfirmPage() {
  const router = useRouter()
  const ran    = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function handle() {
      // Supabase detectSessionInUrl:true will auto-parse the hash fragment
      // and fire onAuthStateChange — we just need to listen for it
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await ensureUser(session.user)
        router.replace('/dashboard')
        return
      }

      // Listen for session established from hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await ensureUser(session.user)
            subscription.unsubscribe()
            router.replace('/dashboard')
          } else if (event === 'SIGNED_OUT') {
            subscription.unsubscribe()
            router.replace('/login')
          }
        }
      )

      // Timeout safety net
      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login?error=timeout')
      }, 12000)
    }

    async function ensureUser(user: {
      id: string
      email?: string
      user_metadata?: Record<string, string>
    }) {
      try {
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
      } catch (e) {
        console.error('[confirm] upsert error:', e)
      }
    }

    handle()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: 24,
    }}>
      {/* Logo */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: '#fff',
        boxShadow: '0 0 32px rgba(124,58,237,0.6)',
        animation: 'gpulse 2s ease-in-out infinite',
      }}>C</div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Signing you in…
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>
          Setting up your CREOVA workspace
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7C3AED,#3B82F6)',
            animation: 'pdot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.25}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
