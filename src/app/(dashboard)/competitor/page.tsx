'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Analysis { channelName: string; platform: string; followers: string; avgViews: string; postFreq: string; topCategories: string[]; viralPatterns: string[]; weaknesses: string[]; opportunities: string[]; strategy: string; copyThis: string; avoidThis: string }

export default function CompetitorPage() {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('YouTube')
  const [result, setResult] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Analysis[]>([])

  async function analyze() {
    if (!url.trim()) { toast.error('Enter a channel URL or username'); return }
    setLoading(true)
    try {
      const prompt = `Perform a detailed competitor analysis for this ${platform} channel/account: "${url}"

Return ONLY a JSON object with this exact structure (no markdown):
{"channelName":"estimated name from URL","platform":"${platform}","followers":"estimated range","avgViews":"estimated range","postFreq":"estimated frequency","topCategories":["cat1","cat2","cat3"],"viralPatterns":["pattern1","pattern2","pattern3","pattern4"],"weaknesses":["weakness1","weakness2","weakness3"],"opportunities":["opportunity1","opportunity2","opportunity3"],"strategy":"2-3 sentence overall strategy summary","copyThis":"What you should copy/improve from them in 2 sentences","avoidThis":"What mistakes/gaps they have in 1 sentence"}

Be specific and realistic. Base estimates on the URL/handle provided and typical patterns for that type of creator.`

      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      const parsed = JSON.parse(json.content.replace(/```json?|```/g, '').trim())
      setResult(parsed)
      setHistory(h => [parsed, ...h.slice(0, 4)])

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('competitor_analyses').insert({ user_id: user.id, channel_url: url, platform, channel_name: parsed.channelName, ai_insights: parsed, status: 'complete' })
      }
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>🎯 Competitor AI</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Reverse-engineer any creator's success. See exactly what makes them go viral — then do it better.</p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {['YouTube', 'TikTok', 'Instagram'].map(p => (
            <button key={p} onClick={() => setPlatform(p)}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${platform === p ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: platform === p ? 'rgba(124,58,237,.15)' : 'transparent', color: platform === p ? '#b47fff' : 'var(--text3)', fontWeight: platform === p ? 600 : 400 }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="inp" placeholder="Paste channel URL or @username (e.g. @mkbhd or youtube.com/c/mkbhd)" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()} style={{ flex: 1 }} />
          <button onClick={analyze} disabled={loading} className="btn btn-p" style={{ flexShrink: 0, padding: '11px 22px' }}>
            {loading ? '…' : '🎯 Analyze'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[90,70,85,60,75].map((w,i) => <div key={i} className="sk" style={{ height: 16, width: `${w}%`, borderRadius: 6 }} />)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div className="proc-dot" />
            <span style={{ fontSize: 13, color: '#b47fff' }}>CREOVA AI is analyzing this channel…</span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>
                {result.channelName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div className="syne" style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{result.channelName}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{result.platform} · {result.followers} followers · {result.avgViews} avg views</div>
              </div>
              <div style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 10, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>
                Posts {result.postFreq}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Viral Patterns */}
            <div className="card" style={{ padding: 22 }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>🔥 What Makes Them Viral</div>
              {result.viralPatterns?.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.15)' }}>
                  <span style={{ color: '#b47fff', flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            <div className="card" style={{ padding: 22 }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>⚠️ Their Weaknesses</div>
              {result.weaknesses?.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)' }}>
                  <span style={{ color: '#f87171', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{w}</span>
                </div>
              ))}
            </div>

            {/* Opportunities */}
            <div className="card" style={{ padding: 22 }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>💡 Your Opportunities</div>
              {result.opportunities?.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.15)' }}>
                  <span style={{ color: '#6ee7b7', flexShrink: 0 }}>↗</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{o}</span>
                </div>
              ))}
            </div>

            {/* Action Plan */}
            <div className="card" style={{ padding: 22 }}>
              <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>🚀 Your Action Plan</div>
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, marginBottom: 4 }}>COPY THIS</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{result.copyThis}</p>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)' }}>
                <div style={{ fontSize: 11, color: '#fdba74', fontWeight: 700, marginBottom: 4 }}>AVOID THIS</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{result.avoidThis}</p>
              </div>
            </div>
          </div>

          {/* Strategy summary */}
          <div style={{ padding: '18px 22px', borderRadius: 14, background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)' }}>
            <div style={{ fontSize: 12, color: '#b47fff', fontWeight: 700, marginBottom: 6 }}>AI STRATEGY SUMMARY</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{result.strategy}</p>
          </div>
        </div>
      )}
    </div>
  )
}
