'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default function AuthConfirmPage() {
  const router = useRouter()
  const done   = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    async function handle() {
      // Give Supabase a moment to parse the hash fragment
      await new Promise(r => setTimeout(r, 300))

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await upsertUser(session.user)
        router.replace('/dashboard')
        return
      }

      // Listen for auth state change (hash parsed async)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await upsertUser(session.user)
            subscription.unsubscribe()
            router.replace('/dashboard')
          } else if (event === 'SIGNED_OUT') {
            subscription.unsubscribe()
            router.replace('/login')
          }
        }
      )

      // Hard timeout fallback
      setTimeout(() => { subscription.unsubscribe(); router.replace('/login') }, 10000)
    }

    async function upsertUser(user: { id: string; email?: string; user_metadata?: Record<string, string> }) {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          username:
            user.user_metadata?.preferred_username ||
            user.user_metadata?.user_name ||
            user.user_metadata?.name ||
            (user.email ? user.email.split('@')[0] : 'creator'),
          plan: 'free',
          credits: 10,
        }, { onConflict: 'id', ignoreDuplicates: true })
      } catch (e) {
        console.error('upsert error:', e)
      }
    }

    handle()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 28px rgba(124,58,237,0.6)', animation: 'gpulse 2s ease-in-out infinite' }}>C</div>
      <div style={{ textAlign: 'center' }}>
        <div className="syne" style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Signing you in…</div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>Setting up your CREOVA workspace</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#3B82F6)', animation: `pdot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}
