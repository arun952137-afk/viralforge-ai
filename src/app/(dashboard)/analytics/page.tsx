'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
export const dynamic = 'force-dynamic'

const WEEKLY = [
  { d: 'Mon', v: 2400, r: 68, c: 4.2 }, { d: 'Tue', v: 3800, r: 72, c: 5.1 },
  { d: 'Wed', v: 2900, r: 65, c: 3.8 }, { d: 'Thu', v: 5200, r: 81, c: 6.4 },
  { d: 'Fri', v: 6100, r: 85, c: 7.2 }, { d: 'Sat', v: 4800, r: 79, c: 5.8 },
  { d: 'Sun', v: 7300, r: 88, c: 8.1 },
]
const PLATFORMS = [
  { name: 'YouTube', value: 45, color: '#EF4444' },
  { name: 'TikTok', value: 30, color: '#EC4899' },
  { name: 'Instagram', value: 20, color: '#7C3AED' },
  { name: 'Twitter', value: 5, color: '#3B82F6' },
]
const TOP_CONTENT = [
  { title: 'I Made ₹1L with AI in 30 Days', views: '124K', ctr: '8.2%', ret: '72%', score: 94 },
  { title: '5 AI Tools That Will Replace Your Job', views: '89K', ctr: '7.1%', ret: '68%', score: 88 },
  { title: 'How I Grew 0→10K Subs in 30 Days', views: '67K', ctr: '6.8%', ret: '81%', score: 91 },
  { title: 'ChatGPT Prompts That Went Viral', views: '54K', ctr: '5.9%', ret: '65%', score: 79 },
]

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>◈ Analytics Command</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Your complete creator intelligence dashboard.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        {[
          { label: 'Total Views', value: '32.8K', delta: '+24%', color: '#b47fff', icon: '👁️' },
          { label: 'Avg Watch Time', value: '4:32', delta: '+12%', color: '#93c5fd', icon: '⏱️' },
          { label: 'Avg CTR', value: '6.4%', delta: '+0.8%', color: '#6ee7b7', icon: '🎯' },
          { label: 'Avg Retention', value: '74%', delta: '+5%', color: '#fdba74', icon: '📊' },
          { label: 'Viral Score', value: '88', delta: '+6pts', color: '#f9a8d4', icon: '🔥' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase' }}>{k.label}</span>
              <span>{k.icon}</span>
            </div>
            <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6ee7b7', marginTop: 4 }}>↑ {k.delta} this week</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Views This Week</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={WEEKLY}>
              <defs>
                <linearGradient id="gv2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0b1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gv2)" name="Views" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Platform Split</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PLATFORMS} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {PLATFORMS.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0b1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retention + CTR charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Retention Rate</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEKLY}>
              <XAxis dataKey="d" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: '#0b1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              <Line type="monotone" dataKey="r" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="Retention %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Click-Through Rate</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={WEEKLY}>
              <XAxis dataKey="d" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0b1023', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
              <Line type="monotone" dataKey="c" stroke="#10B981" strokeWidth={2.5} dot={false} name="CTR %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top content */}
      <div className="card" style={{ padding: 24 }}>
        <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Top Performing Content</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {['Title', 'Views', 'CTR', 'Retention', 'Viral Score'].map((h, i) => (
            i === 0 ? null : null
          ))}
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 100px 110px', gap: 12, padding: '8px 12px', borderRadius: 8 }}>
            {['Content', 'Views', 'CTR', 'Retention', 'Viral Score'].map(h => <div key={h} style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {TOP_CONTENT.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 100px 110px', gap: 12, padding: '12px', borderRadius: 8, background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', alignItems: 'center' }}>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.views}</div>
              <div style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>{c.ctr}</div>
              <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600 }}>{c.ret}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 5, flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.score}%`, background: 'var(--grad2)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#b47fff', fontWeight: 700 }}>{c.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
