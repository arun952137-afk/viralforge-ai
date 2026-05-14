'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

const TOOLS = [
  { id: 'script',    icon: '📝', name: 'Script Writer',    desc: 'Full YouTube/Shorts scripts', prompt: (t:string,n:string,p:string) => `Write a complete, engaging ${t}-style video script for the niche "${n}" with platform style "${p}". Include: a powerful hook (first 3 seconds), main content sections with storytelling, engagement prompts, and a strong CTA. Make it viral-ready.` },
  { id: 'hook',      icon: '🪝', name: 'Hook Generator',   desc: '10 viral scroll-stopping hooks', prompt: (t:string,n:string,p:string) => `Generate 10 different viral video hooks for a creator in the "${n}" niche making ${t} content for ${p}. Each hook should use different psychological triggers: curiosity gap, FOMO, controversy, shock, transformation, secret-reveal, and direct challenge. Format each clearly numbered.` },
  { id: 'caption',   icon: '💬', name: 'Caption AI',       desc: 'Platform-optimized captions', prompt: (t:string,n:string,p:string) => `Write 5 different high-engagement captions for a ${t} post in the "${n}" niche for ${p}. Each caption should: start with a hook, include storytelling, use strategic line breaks, add 15 niche-specific hashtags, and include a call-to-action. Vary the tone from conversational to authoritative.` },
  { id: 'seo',       icon: '🔍', name: 'SEO Optimizer',    desc: 'Titles, descriptions & tags', prompt: (t:string,n:string,p:string) => `Create a complete SEO package for a ${t} video in the "${n}" niche for ${p}. Include: 5 click-bait title variations (with emojis), a 300-word keyword-rich description, 30 trending tags, best thumbnail text suggestions, and a chapter breakdown.` },
  { id: 'thumbnail', icon: '🖼️', name: 'Thumbnail AI',     desc: 'CTR-optimized thumbnail concepts', prompt: (t:string,n:string,p:string) => `Design 5 high-CTR thumbnail concepts for a "${n}" niche ${t} video. For each concept describe: background style/color, main text (max 4 words), facial expression or visual element, color psychology rationale, and estimated CTR score. Think like a top-performing YouTube creator.` },
  { id: 'viral',     icon: '🔥', name: 'Viral Analyzer',   desc: 'What makes content go viral', prompt: (t:string,n:string,p:string) => `Analyze the viral potential of ${t} content for the "${n}" niche on ${p}. Provide: a viral score (0-100), 5 key viral elements to include, audience psychology breakdown, best emotional triggers for this niche, optimal video length and pacing, and 3 specific content angles guaranteed to get traction right now.` },
  { id: 'brand',     icon: '✦',  name: 'Brand Voice',      desc: 'Define your creator identity', prompt: (t:string,n:string,p:string) => `Create a complete brand voice guide for a creator in the "${n}" niche making ${t} content. Include: creator persona, brand voice (5 adjectives + descriptions), what to say/avoid, content pillars (5 themes), signature phrases, and how to differentiate from top competitors.` },
  { id: 'idea',      icon: '💡', name: 'Idea Generator',   desc: '20 high-potential video ideas', prompt: (t:string,n:string,p:string) => `Generate 20 viral video ideas for the "${n}" niche on ${p} for ${t} content. For each idea: title, hook line, why it will go viral, estimated views potential, and best time to post. Focus on trending angles, emerging opportunities, and underserved content gaps in this niche right now.` },
]

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'LinkedIn', 'X/Twitter']
const CONTENT_TYPES = ['Faceless', 'Talking Head', 'Tutorial', 'Vlog', 'Shorts/Reels', 'Podcast Clip']

export default function StudioPage() {
  const [activeTool, setActiveTool] = useState(TOOLS[0])
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState('YouTube')
  const [contentType, setContentType] = useState('Faceless')
  const [extra, setExtra] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await supabase.from('users').select('credits').eq('id', data.user.id).single()
        setCredits(p?.credits ?? 0)
      }
    })
  }, [])

  async function generate() {
    if (!niche.trim()) { toast.error('Enter your niche first'); return }
    if (credits === 0) { toast.error('No credits left. Upgrade your plan!'); return }
    setLoading(true); setOutput('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const prompt = activeTool.prompt(contentType, niche, platform) + (extra ? `\n\nAdditional context: ${extra}` : '')
      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setOutput(json.content)
      if (user && credits !== -1) {
        await supabase.from('users').update({ credits: credits - 1 }).eq('id', user.id)
        setCredits(c => c - 1)
      }
      await supabase.from('generations').insert({ user_id: user?.id, type: activeTool.id, prompt: `${niche} | ${platform} | ${contentType}`, output: json.content })
      toast.success('Generated!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function copy() { navigator.clipboard.writeText(output); toast.success('Copied!') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>⚡ AI Studio</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>8 AI tools. One powerful workspace.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{credits === -1 ? '∞' : credits} credits</span>
        </div>
      </div>

      {/* Tool selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10 }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => { setActiveTool(t); setOutput('') }}
            style={{
              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
              background: activeTool.id === t.id ? 'rgba(124,58,237,.18)' : 'var(--surface)',
              border: `1px solid ${activeTool.id === t.id ? 'rgba(124,58,237,.45)' : 'var(--border)'}`,
              textAlign: 'left', transition: 'all .2s',
            }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Config */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {activeTool.icon} {activeTool.name}
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>YOUR NICHE *</label>
            <input className="inp" placeholder="e.g. personal finance, fitness, AI tools…" value={niche} onChange={e => setNiche(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>PLATFORM</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${platform === p ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: platform === p ? 'rgba(124,58,237,.15)' : 'transparent', color: platform === p ? '#b47fff' : 'var(--text3)', fontWeight: platform === p ? 600 : 400, transition: 'all .15s' }}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CONTENT TYPE</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CONTENT_TYPES.map(ct => (
                <button key={ct} onClick={() => setContentType(ct)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${contentType === ct ? 'rgba(59,130,246,.5)' : 'var(--border)'}`, background: contentType === ct ? 'rgba(59,130,246,.15)' : 'transparent', color: contentType === ct ? '#93c5fd' : 'var(--text3)', fontWeight: contentType === ct ? 600 : 400, transition: 'all .15s' }}>{ct}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>EXTRA CONTEXT (optional)</label>
            <textarea className="inp" placeholder="Target audience, specific topic, tone, keywords…" value={extra} onChange={e => setExtra(e.target.value)} style={{ minHeight: 80 }} />
          </div>

          <button onClick={generate} disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
            {loading
              ? <><span className="a-sp" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Generating…</>
              : `✨ Generate with AI`
            }
          </button>
        </div>

        {/* Output */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>AI Output</div>
            {output && <button onClick={copy} className="btn btn-s" style={{ padding: '6px 14px', fontSize: 12 }}>📋 Copy</button>}
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[100,85,70,90,60].map((w,i) => <div key={i} className="sk" style={{ height: 18, width: `${w}%`, borderRadius: 6 }} />)}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)' }}>
                <div className="proc-dot" />
                <span style={{ fontSize: 13, color: '#b47fff' }}>CREOVA AI is generating your content…</span>
              </div>
            </div>
          ) : output ? (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <pre style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{output}</pre>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 56 }}>{activeTool.icon}</div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)' }}>Ready to generate</div>
              <p style={{ fontSize: 14, color: 'var(--text4)', textAlign: 'center', maxWidth: 280 }}>Enter your niche and click Generate. CREOVA will create professional content in seconds.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
