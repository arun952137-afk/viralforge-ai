'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export const dynamic = 'force-dynamic'

const CHART_DATA = [
  { d: 'Mon', v: 1200, s: 72 }, { d: 'Tue', v: 1900, s: 81 },
  { d: 'Wed', v: 1600, s: 68 }, { d: 'Thu', v: 2800, s: 89 },
  { d: 'Fri', v: 3100, s: 91 }, { d: 'Sat', v: 2600, s: 85 },
  { d: 'Sun', v: 3800, s: 94 },
]

const TOOLS = [
  { href: '/studio',       icon: '⚡', name: 'AI Studio',     desc: 'Generate content',    tag: 'tv' },
  { href: '/viral-engine', icon: '🔥', name: 'Viral Engine',  desc: 'Score your content',  tag: 'to' },
  { href: '/competitor',   icon: '🎯', name: 'Competitor AI', desc: 'Spy on competitors',  tag: 'tb' },
  { href: '/trends',       icon: '📡', name: 'Trend Intel',   desc: 'Catch trends early',  tag: 'tg' },
  { href: '/brand',        icon: '✦',  name: 'Brand Builder', desc: 'Build your identity', tag: 'tv' },
  { href: '/faceless',     icon: '🎬', name: 'Faceless AI',   desc: 'Auto channels',       tag: 'tp' },
  { href: '/scheduler',    icon: '📅', name: 'Scheduler',     desc: 'Perfect timing',      tag: 'tc' },
  { href: '/copilot',      icon: '🤖', name: 'AI Copilot',    desc: 'Your AI assistant',   tag: 'tv' },
]

const TIPS = [
  'Post between 6-8pm IST for 2.4× higher engagement on Reels',
  'Add a curiosity gap in your first 3 seconds to boost retention by 60%',
  'Finance + AI combination niches growing 340% on YouTube this month',
  'Faceless channels with cinematic b-roll get 3× more subscribers',
  'Thumbnails with faces get 37% higher CTR than text-only designs',
]

export default function DashboardPage() {
  const [user, setUser] = useState<{ username?: string; credits: number; plan: string }>({ credits: 0, plan: 'free' })
  const [tipIdx, setTipIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await supabase.from('users').select('plan,credits,username').eq('id', data.user.id).single()
        setUser({ username: p?.username, credits: p?.credits ?? 0, plan: p?.plan ?? 'free' })
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1,2,3].map(i => <div key={i} className="sk" style={{ height: 120, borderRadius: 16 }} />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>AI Systems Online</span>
          </div>
          <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {greeting()}, {user.username || 'Creator'} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Your creator command center is ready.</p>
        </div>
        <Link href="/studio" className="btn btn-p">⚡ Open AI Studio</Link>
      </div>

      {/* AI Tip Banner */}
      <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <span style={{ fontSize: 11, color: 'var(--violet2)', fontWeight: 700, display: 'block', marginBottom: 2 }}>AI INSIGHT</span>
          <p style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{TIPS[tipIdx]}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
        {[
          { label: 'AI Credits Left', value: user.credits === -1 ? '∞' : user.credits, icon: '⚡', color: '#b47fff', sub: user.plan === 'free' ? 'Upgrade for unlimited' : 'Unlimited plan' },
          { label: 'Content Generated', value: '—', icon: '📝', color: '#93c5fd', sub: 'This month' },
          { label: 'Viral Score Avg', value: '—', icon: '🔥', color: '#fdba74', sub: 'Across all content' },
          { label: 'Active Channels', value: '—', icon: '🎬', color: '#6ee7b7', sub: 'Faceless AI channels' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="syne" style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Performance This Week</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Views & viral score trend</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }} />Views</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4' }} />Score</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0b1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }} />
              <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} fill="url(#gv)" name="Views" />
              <Area type="monotone" dataKey="s" stroke="#06B6D4" strokeWidth={2} fill="url(#gs)" name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🔥 Trending Now</div>
          {['AI Voice Cloning Tutorials', 'Faceless Finance Channels', 'Cinematic B-Roll Aesthetics', 'ChatGPT Prompt Secrets', 'Passive Income with AI'].map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', minWidth: 16, textAlign: 'center' }}>#{i+1}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>{t}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i < 3 ? '#f97316' : '#6ee7b7', boxShadow: `0 0 6px ${i < 3 ? 'rgba(249,115,22,.7)' : 'rgba(110,231,183,.7)'}` }} />
            </div>
          ))}
          <Link href="/trends" className="btn btn-s" style={{ justifyContent: 'center', fontSize: 13, marginTop: 4 }}>View All Trends →</Link>
        </div>
      </div>

      {/* Quick Launch Tools */}
      <div>
        <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>⚡ Quick Launch</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
              <div className="card card-h" style={{ padding: '18px 20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <span className={`tag ${t.tag}`} style={{ fontSize: 9 }}>AI</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade banner if free */}
      {user.plan === 'free' && (
        <div style={{ padding: '20px 24px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(59,130,246,.15))', border: '1px solid rgba(124,58,237,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🚀 Unlock the Full Power of CREOVA</div>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>You're on the free plan. Upgrade to Creator Pro for unlimited AI credits, Viral Engine, Brand Builder & more.</p>
          </div>
          <Link href="/billing" className="btn btn-p">Upgrade — 60% OFF →</Link>
        </div>
      )}
    </div>
  )
}
