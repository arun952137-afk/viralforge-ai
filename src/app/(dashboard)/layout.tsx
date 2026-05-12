'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/studio',    icon: '✨', label: 'AI Studio' },
  { href: '/projects',  icon: '📁', label: 'Projects' },
  { href: '/history',   icon: '📜', label: 'History' },
  { href: '/billing',   icon: '⚡', label: 'Billing' },
  { href: '/profile',   icon: '👤', label: 'Profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string; plan?: string; credits?: number } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('plan,credits').eq('id', data.user.id).single()
      setUser({ email: data.user.email, plan: profile?.plan ?? 'free', credits: profile?.credits ?? 0 })
    })
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 flex flex-col transition-all duration-300`} style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div onClick={() => setCollapsed(c => !c)} className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-sm syne cursor-pointer flex-shrink-0">C</div>
          {!collapsed && <span className="syne font-bold text-base">CREOVA</span>}
        </div>
        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.map(n => {
            const active = path === n.href || (n.href !== '/dashboard' && path.startsWith(n.href))
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <span className="text-base flex-shrink-0">{n.icon}</span>
                {!collapsed && n.label}
              </Link>
            )
          })}
        </nav>
        {/* User */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {!collapsed && user && (
            <div className="mb-3 px-2">
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="tag tag-purple text-xs capitalize">{user.plan}</span>
                <span className="text-xs text-slate-400">{user.credits === -1 ? '∞' : user.credits} credits</span>
              </div>
            </div>
          )}
          <button onClick={logout} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all w-full ${collapsed ? 'justify-center' : ''}`}>
            <span>🚪</span>{!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
