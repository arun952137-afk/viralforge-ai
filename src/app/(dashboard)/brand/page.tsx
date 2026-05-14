'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface BrandResult { brandName: string; tagline: string; personality: string; tone: string; colors: string[]; pillars: string[]; targetAudience: string; differentiator: string; contentPlan: string[]; growthStrategy: string }

export default function BrandPage() {
  const [niche, setNiche] = useState('')
  const [style, setStyle] = useState('Educational')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [result, setResult] = useState<BrandResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function build() {
    if (!niche || !audience) { toast.error('Fill in niche and target audience'); return }
    setLoading(true)
    try {
      const prompt = `Create a complete creator brand identity for: Niche: "${niche}", Style: "${style}", Audience: "${audience}", Goal: "${goal || 'grow a viral channel'}".

Return ONLY a JSON object (no markdown):
{"brandName":"CreativeName","tagline":"catchy brand tagline","personality":"3-word personality description","tone":"brand communication tone","colors":["#hex1","#hex2","#hex3"],"pillars":["content pillar 1","content pillar 2","content pillar 3","content pillar 4","content pillar 5"],"targetAudience":"detailed target audience description","differentiator":"what makes this creator unique in 1 sentence","contentPlan":["Week 1 focus","Week 2 focus","Week 3 focus","Week 4 focus"],"growthStrategy":"2-sentence growth strategy"}`

      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      const parsed = JSON.parse(json.content.replace(/```json?|```/g, '').trim())
      setResult(parsed)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('brand_profiles').upsert({ user_id: user.id, brand_name: parsed.brandName, niche, personality: parsed.personality, tone: parsed.tone, color_palette: parsed.colors, target_audience: { description: parsed.targetAudience }, creator_slogan: parsed.tagline, ai_positioning: parsed.differentiator })
      }
      toast.success('Brand identity created!')
    } catch { toast.error('Failed to create brand identity') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>✦ Brand Builder AI</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Generate your complete creator identity in 30 seconds. Stand out. Get sponsored. Build an empire.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Define Your Creator DNA</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>YOUR NICHE *</label>
            <input className="inp" placeholder="e.g. personal finance for millennials" value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CONTENT STYLE</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Educational', 'Entertainment', 'Motivational', 'Documentary', 'Comedy'].map(s => (
                <button key={s} onClick={() => setStyle(s)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: `1px solid ${style === s ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: style === s ? 'rgba(124,58,237,.15)' : 'transparent', color: style === s ? '#b47fff' : 'var(--text3)', transition: 'all .15s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TARGET AUDIENCE *</label>
            <input className="inp" placeholder="e.g. 18-35 year old students & early professionals" value={audience} onChange={e => setAudience(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CREATOR GOAL</label>
            <input className="inp" placeholder="e.g. reach 100K subs in 6 months, get brand deals" value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
          <button onClick={build} disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
            {loading ? <><span className="a-sp" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Building…</> : '✦ Build My Brand Identity'}
          </button>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {result ? (
            <>
              <div style={{ textAlign: 'center', padding: '20px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(59,130,246,.15))', border: '1px solid rgba(124,58,237,.3)' }}>
                <div className="syne" style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{result.brandName}</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 14 }}>"{result.tagline}"</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {result.colors?.map((c, i) => <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: '2px solid rgba(255,255,255,0.15)' }} />)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: '14px', borderRadius: 10, background: 'var(--surface)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 6 }}>PERSONALITY</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{result.personality}</div>
                </div>
                <div style={{ padding: '14px', borderRadius: 10, background: 'var(--surface)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 6 }}>TONE</div>
                  <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{result.tone}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 10 }}>CONTENT PILLARS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.pillars?.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.15)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i+1}</div>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}>
                <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, marginBottom: 6 }}>GROWTH STRATEGY</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{result.growthStrategy}</p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 52 }}>✦</div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)' }}>Your brand awaits</div>
              <p style={{ fontSize: 13, color: 'var(--text4)', textAlign: 'center' }}>Fill in your details and get a complete creator identity generated by AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
