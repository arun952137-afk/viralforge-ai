'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

const NAV = [
  { label: 'CORE', items: [
    { href: '/dashboard',    icon: '⬡', name: 'Command Center' },
    { href: '/studio',       icon: '⚡', name: 'AI Studio' },
    { href: '/copilot',      icon: '🤖', name: 'AI Copilot' },
  ]},
  { label: 'INTELLIGENCE', items: [
    { href: '/analytics',    icon: '◈',  name: 'Analytics' },
    { href: '/viral-engine', icon: '🔥', name: 'Viral Engine' },
    { href: '/competitor',   icon: '🎯', name: 'Competitor AI' },
    { href: '/trends',       icon: '📡', name: 'Trend Intel' },
  ]},
  { label: 'CREATION', items: [
    { href: '/brand',        icon: '✦',  name: 'Brand Builder' },
    { href: '/faceless',     icon: '🎬', name: 'Faceless AI' },
    { href: '/scheduler',    icon: '📅', name: 'Scheduler' },
    { href: '/projects',     icon: '📁', name: 'Projects' },
    { href: '/history',      icon: '🕐', name: 'History' },
  ]},
  { label: 'ACCOUNT', items: [
    { href: '/billing',      icon: '💎', name: 'Upgrade Plan' },
    { href: '/profile',      icon: '👤', name: 'Profile' },
  ]},
]

const PLAN_TAG: Record<string, string> = { free: 'tb', starter: 'tc', pro: 'tv', studio: 'tp' }

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; plan: string; credits: number; username?: string }>({ plan: 'free', credits: 0 })
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: p } = await supabase.from('users').select('plan,credits,username').eq('id', data.user.id).single()
      setUser({ email: data.user.email, plan: p?.plan ?? 'free', credits: p?.credits ?? 0, username: p?.username })
    })
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }

  const W = collapsed ? 64 : 224

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {mobile && <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setMobile(false)} />}

      <aside style={{
        position: 'relative', zIndex: 50, display: 'flex', flexDirection: 'column',
        flexShrink: 0, height: '100%',
        width: W, transition: 'width .3s cubic-bezier(.4,0,.2,1)',
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={() => setCollapsed(c => !c)} style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--grad2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 14,
            border: 'none', cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 0 16px rgba(124,58,237,.55)',
          }}>C</button>
          {!collapsed && <div style={{ overflow: 'hidden' }}>
            <div className="syne" style={{ fontWeight: 900, fontSize: 14, color: '#fff', lineHeight: 1 }}>CREOVA</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>AI Operating System</div>
          </div>}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {NAV.map(s => (
            <div key={s.label} style={{ marginBottom: 18 }}>
              {!collapsed && <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text4)', padding: '0 6px', marginBottom: 6 }}>{s.label}</div>}
              {s.items.map(n => {
                const active = path === n.href || (n.href !== '/dashboard' && path.startsWith(n.href))
                return (
                  <Link key={n.href} href={n.href} onClick={() => setMobile(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: collapsed ? '9px 0' : '8px 10px', justifyContent: collapsed ? 'center' : undefined,
                    borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 2,
                    textDecoration: 'none', transition: 'all .15s',
                    background: active ? 'rgba(124,58,237,.14)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(124,58,237,.3)' : 'transparent'}`,
                    color: active ? '#b47fff' : 'var(--text3)',
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                    {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: 8, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {!collapsed && <div style={{ padding: '8px 10px', marginBottom: 4, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username || user.email?.split('@')[0]}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span className={`tag ${PLAN_TAG[user.plan]}`} style={{ fontSize: 9 }}>{user.plan}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{user.credits === -1 ? '∞' : user.credits} credits</span>
            </div>
          </div>}
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : undefined,
            gap: 8, padding: collapsed ? '9px 0' : '8px 10px', width: '100%',
            border: 'none', borderRadius: 10, background: 'transparent', color: 'var(--text3)',
            fontSize: 13, cursor: 'pointer', transition: 'all .15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          ><span>🚪</span>{!collapsed && 'Sign out'}</button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'none' }} className="mobile-topbar">
          <button onClick={() => setMobile(true)}>☰</button>
          <span className="syne" style={{ fontWeight: 900, color: '#fff' }}>CREOVA</span>
        </div>
        <div style={{ flex: 1, padding: '24px 28px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
