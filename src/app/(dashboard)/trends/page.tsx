'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface Trend { id: string; platform: string; trend_title: string; trend_type: string; virality_score: number; growth_rate: string; description: string; opportunity: string }

const PLATFORM_COLORS: Record<string, string> = { TikTok: 'tp', YouTube: 'tr', Instagram: 'tv', Reddit: 'to', Twitter: 'tb' }
const ALL_PLATFORMS = ['All', 'YouTube', 'TikTok', 'Instagram', 'Reddit']

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [strategy, setStrategy] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('trend_alerts').select('*').order('virality_score', { ascending: false }).then(({ data }) => {
      setTrends(data ?? [])
      setLoading(false)
    })
  }, [])

  async function getStrategy(t: Trend) {
    setGenerating(t.id)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Create a specific, actionable content strategy for this trend: "${t.trend_title}" on ${t.platform}. Growing at ${t.growth_rate}. Opportunity: ${t.opportunity}. Give: 3 specific video ideas, best hook style, optimal posting time, and how to monetize this trend. Be specific and concise.` })
      })
      const json = await res.json()
      setStrategy(s => ({ ...s, [t.id]: json.content }))
    } catch { toast.error('Failed to generate strategy') }
    finally { setGenerating(null) }
  }

  const filtered = filter === 'All' ? trends : trends.filter(t => t.platform === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>📡 Trend Intelligence</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Real-time trend scanner. Catch viral waves 48 hours before they peak.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Live updates</span>
        </div>
      </div>

      {/* Platform filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {ALL_PLATFORMS.map(p => (
          <button key={p} onClick={() => setFilter(p)}
            style={{ padding: '7px 18px', borderRadius: 100, fontSize: 13, cursor: 'pointer', border: `1px solid ${filter === p ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: filter === p ? 'rgba(124,58,237,.15)' : 'transparent', color: filter === p ? '#b47fff' : 'var(--text3)', fontWeight: filter === p ? 700 : 400 }}>{p}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 100, borderRadius: 14 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`tag ${PLATFORM_COLORS[t.platform] ?? 'tb'}`}>{t.platform}</span>
                    <span className="tag tg">{t.trend_type}</span>
                    <span style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>{t.growth_rate}</span>
                  </div>
                  <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{t.trend_title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>{t.description}</p>
                  {t.opportunity && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', fontSize: 13, color: '#6ee7b7' }}>
                      💡 {t.opportunity}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="syne" style={{ fontSize: 28, fontWeight: 900, color: t.virality_score >= 90 ? '#34d399' : t.virality_score >= 75 ? '#fdba74' : '#f87171' }}>{t.virality_score}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>VIRAL SCORE</div>
                  </div>
                  <button onClick={() => getStrategy(t)} disabled={generating === t.id} className="btn btn-p" style={{ padding: '8px 16px', fontSize: 12 }}>
                    {generating === t.id ? '…' : '⚡ Get Strategy'}
                  </button>
                </div>
              </div>

              {strategy[t.id] && (
                <div style={{ marginTop: 16, padding: '16px', borderRadius: 10, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)' }}>
                  <div style={{ fontSize: 11, color: '#b47fff', fontWeight: 700, marginBottom: 8 }}>AI CONTENT STRATEGY</div>
                  <pre style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{strategy[t.id]}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
