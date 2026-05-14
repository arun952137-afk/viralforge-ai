'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Scores { viral: number; hook: number; retention: number; emotional: number; ctr: number; tips: string[] }

function ScoreMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <span className="syne" style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(.4,0,.2,1)', boxShadow: `0 0 12px ${color}60` }} />
      </div>
    </div>
  )
}

export default function ViralEnginePage() {
  const [title, setTitle] = useState('')
  const [hook, setHook] = useState('')
  const [niche, setNiche] = useState('')
  const [scores, setScores] = useState<Scores | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyze() {
    if (!title || !hook) { toast.error('Fill in title and hook'); return }
    setLoading(true)
    try {
      const prompt = `Analyze this content for viral potential and return ONLY a JSON object (no markdown, no explanation, pure JSON):
Title: "${title}"
Hook: "${hook}"
Niche: "${niche || 'general'}"

Return this exact JSON structure:
{"viral":85,"hook":72,"retention":68,"emotional":79,"ctr":81,"tips":["tip 1","tip 2","tip 3","tip 4","tip 5"]}

Score each 0-100. Tips should be specific, actionable improvements.`

      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      const parsed = JSON.parse(json.content.replace(/```json?|```/g, '').trim())
      setScores(parsed)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('viral_scores').insert({ user_id: user.id, content_type: 'video', title, hook, viral_score: parsed.viral, engagement_score: parsed.hook, retention_score: parsed.retention, emotional_score: parsed.emotional, ctr_score: parsed.ctr, ai_recommendations: parsed.tips })
      }
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const overallColor = !scores ? '#fff' : scores.viral >= 80 ? '#34d399' : scores.viral >= 60 ? '#fdba74' : '#f87171'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>🔥 Viral Engine</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Know your viral probability before you publish. Get AI-powered scores on every metric.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Input */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Analyze Your Content</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>VIDEO TITLE *</label>
            <input className="inp" placeholder="e.g. I Made $10,000 in 30 Days Using AI" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>OPENING HOOK *</label>
            <textarea className="inp" placeholder="Your first 3-5 seconds / intro hook…" value={hook} onChange={e => setHook(e.target.value)} style={{ minHeight: 80 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NICHE (optional)</label>
            <input className="inp" placeholder="e.g. personal finance, fitness, AI tools" value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <button onClick={analyze} disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
            {loading
              ? <><span className="a-sp" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Analyzing…</>
              : '🔥 Run Viral Analysis'
            }
          </button>
        </div>

        {/* Scores */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {scores ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>OVERALL VIRAL SCORE</div>
                <div className="syne" style={{ fontSize: 72, fontWeight: 900, color: overallColor, lineHeight: 1, textShadow: `0 0 40px ${overallColor}60` }}>{scores.viral}</div>
                <div style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>
                  {scores.viral >= 80 ? '🚀 High Viral Potential' : scores.viral >= 60 ? '📈 Good — Needs Polish' : '⚠️ Needs Improvement'}
                </div>
              </div>
              <ScoreMeter label="Hook Strength" value={scores.hook} color="#7C3AED" />
              <ScoreMeter label="Retention Probability" value={scores.retention} color="#3B82F6" />
              <ScoreMeter label="Emotional Impact" value={scores.emotional} color="#EC4899" />
              <ScoreMeter label="CTR Potential" value={scores.ctr} color="#10B981" />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 52 }}>🔥</div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)' }}>Scores appear here</div>
              <p style={{ fontSize: 13, color: 'var(--text4)', textAlign: 'center' }}>Enter your title and hook to get instant viral predictions.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Tips */}
      {scores?.tips && (
        <div className="card" style={{ padding: 24 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>🎯 AI Recommendations</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {scores.tips.map((tip, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, color: '#b47fff', flexShrink: 0 }}>→</span>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
