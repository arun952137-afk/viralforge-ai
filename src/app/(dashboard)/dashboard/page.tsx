'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const TOOLS = [
  { href: '/studio?type=script',    icon: '📝', label: 'Write Script',  color: '#7c3aed', desc: 'YouTube, Shorts, Podcast' },
  { href: '/studio?type=hook',      icon: '🪝', label: 'Gen Hooks',     color: '#06b6d4', desc: 'Stop the scroll' },
  { href: '/studio?type=caption',   icon: '💬', label: 'Auto Captions', color: '#ec4899', desc: '6 animated styles' },
  { href: '/studio?type=thumbnail', icon: '🖼️', label: 'Thumbnail AI',  color: '#f97316', desc: 'High-CTR designs' },
  { href: '/studio?type=hashtag',   icon: '🔍', label: 'SEO + Tags',    color: '#10b981', desc: 'Rank higher' },
  { href: '/studio?type=reel_idea', icon: '🎬', label: 'Reel Ideas',    color: '#8b5cf6', desc: 'Trend-based concepts' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ email?: string; plan?: string; credits?: number; username?: string } | null>(null)
  const [projects, setProjects] = useState<{ id: string; title: string; type: string; created_at: string }[]>([])
  const [generations, setGenerations] = useState<{ id: string; generation_type: string; prompt: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      const [{ data: profile }, { data: projs }, { data: gens }] = await Promise.all([
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('projects').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('generations').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(6),
      ])
      setUser({ ...profile, email: authUser.email })
      setProjects(projs ?? [])
      setGenerations(gens ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="h-32 skeleton rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
    </div>
  )

  const name = user?.username || user?.email?.split('@')[0] || 'Creator'
  const credPct = user?.plan === 'studio' ? 100 : Math.min(100, ((user?.credits ?? 0) / (user?.plan === 'pro' ? 500 : 10)) * 100)

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero card */}
      <div className="card p-6 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 20% 0%,rgba(124,58,237,0.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 60%,rgba(37,99,235,0.1) 0%,transparent 50%)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-xl syne">{name[0]?.toUpperCase()}</div>
          <div>
            <h1 className="syne font-bold text-xl">Good morning, {name}! 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Ready to create something viral today?</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[['🔥', '14-day streak', 'rgba(124,58,237,0.15)', 'rgba(124,58,237,0.3)'], ['⬆️', `${user?.plan ?? 'free'} plan`, 'rgba(16,185,129,0.1)', 'rgba(16,185,129,0.25)'], ['⚡', `${user?.credits === -1 ? '∞' : user?.credits} credits left`, 'rgba(6,182,212,0.1)', 'rgba(6,182,212,0.25)']].map(([ic, tx, bg, border]) => (
            <div key={tx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: bg, border: `1px solid ${border}` }}>
              <span>{ic}</span><span>{tx}</span>
            </div>
          ))}
        </div>
        {/* Credit bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>AI Credits</span>
            <span>{user?.credits === -1 ? 'Unlimited' : `${user?.credits} remaining`}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700" style={{ width: `${credPct}%` }} />
          </div>
        </div>
      </div>

      {/* Quick Launch */}
      <div>
        <h2 className="syne font-bold text-lg mb-4">Quick Launch</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href} className="card p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/30 cursor-pointer">
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-xs font-semibold text-slate-200">{t.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="syne font-bold text-base">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-4xl mb-3 opacity-40">📁</div>
              <p className="text-sm">No projects yet</p>
              <Link href="/studio" className="btn-primary mt-4 text-xs px-4 py-2">Create First Project</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-lg flex-shrink-0">🎬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.type} · {formatDate(p.created_at)}</p>
                  </div>
                  <span className="tag tag-purple text-xs">{p.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Generations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="syne font-bold text-base">Recent Generations</h2>
            <Link href="/history" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
          </div>
          {generations.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-4xl mb-3 opacity-40">✨</div>
              <p className="text-sm">No generations yet</p>
              <Link href="/studio" className="btn-primary mt-4 text-xs px-4 py-2">Open AI Studio</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {generations.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-lg flex-shrink-0">
                    {g.generation_type === 'script' ? '📝' : g.generation_type === 'hook' ? '🪝' : g.generation_type === 'caption' ? '💬' : g.generation_type === 'thumbnail' ? '🖼️' : g.generation_type === 'hashtag' ? '🔍' : '🎬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.prompt}</p>
                    <p className="text-xs text-slate-500">{g.generation_type} · {formatDate(g.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
