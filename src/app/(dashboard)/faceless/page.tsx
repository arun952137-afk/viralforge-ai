'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface ChannelStrategy { channelName: string; niche: string; monetizationPath: string; contentPillars: string[]; uploadSchedule: string; videoFormula: string; voiceDirection: string; thumbnailStyle: string; seoStrategy: string; monthOneGoal: string; scripts: string[] }

const VOICE_STYLES = ['Professional Narrator', 'Conversational AI', 'News Anchor', 'Motivational Coach', 'Documentary Style']
const VISUAL_STYLES = ['Dark Cinematic', 'Minimal Corporate', 'Animated Infographic', 'Stock Footage Mix', 'Text-Heavy Educational']

export default function FacelessPage() {
  const [niche, setNiche] = useState('')
  const [voice, setVoice] = useState('Professional Narrator')
  const [visual, setVisual] = useState('Dark Cinematic')
  const [monetization, setMonetization] = useState('')
  const [strategy, setStrategy] = useState<ChannelStrategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [channels, setChannels] = useState<{ channel_name: string; niche: string; videos_generated: number; status: string }[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: c } = await supabase.from('faceless_channels').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false })
        setChannels(c ?? [])
      }
    })
  }, [])

  async function generate() {
    if (!niche) { toast.error('Enter your channel niche'); return }
    setLoading(true)
    try {
      const prompt = `Design a complete faceless YouTube channel strategy. Niche: "${niche}", Voice: "${voice}", Visual: "${visual}", Monetization goal: "${monetization || 'AdSense + sponsorships'}".

Return ONLY JSON (no markdown):
{"channelName":"SuggestedName","niche":"${niche}","monetizationPath":"specific monetization timeline","contentPillars":["pillar1","pillar2","pillar3","pillar4"],"uploadSchedule":"optimal posting frequency","videoFormula":"exact video structure formula","voiceDirection":"specific narration direction","thumbnailStyle":"thumbnail design direction","seoStrategy":"keyword and SEO approach","monthOneGoal":"realistic 30-day target","scripts":["Video Idea 1: hook + outline","Video Idea 2: hook + outline","Video Idea 3: hook + outline"]}`

      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      const parsed = JSON.parse(json.content.replace(/```json?|```/g, '').trim())
      setStrategy(parsed)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('faceless_channels').insert({ user_id: user.id, channel_name: parsed.channelName, niche, voice_style: voice, visual_style: visual, auto_mode: false })
        setChannels(c => [{ channel_name: parsed.channelName, niche, videos_generated: 0, status: 'active' }, ...c])
      }
      toast.success('Channel strategy created!')
    } catch { toast.error('Failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>🎬 Faceless AI</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Launch a fully automated faceless channel. AI handles everything — scripts, voice, thumbnails, SEO.</p>
        </div>
        <div className="tag tv">V3 Feature</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Configure Your Channel</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CHANNEL NICHE *</label>
            <input className="inp" placeholder="e.g. AI & automation, finance, mystery stories" value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 8 }}>VOICE STYLE</label>
            {VOICE_STYLES.map(v => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${voice === v ? '#7C3AED' : 'var(--border2)'}`, background: voice === v ? '#7C3AED' : 'transparent', flexShrink: 0, cursor: 'pointer' }} onClick={() => setVoice(v)} />
                <span style={{ fontSize: 13, color: voice === v ? '#fff' : 'var(--text2)' }}>{v}</span>
              </label>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>VISUAL STYLE</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {VISUAL_STYLES.map(s => (
                <button key={s} onClick={() => setVisual(s)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${visual === s ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: visual === s ? 'rgba(124,58,237,.15)' : 'transparent', color: visual === s ? '#b47fff' : 'var(--text3)', transition: 'all .15s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>MONETIZATION GOAL</label>
            <input className="inp" placeholder="e.g. ₹1L/month via AdSense in 6 months" value={monetization} onChange={e => setMonetization(e.target.value)} />
          </div>
          <button onClick={generate} disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
            {loading ? '🤖 Generating Strategy…' : '🎬 Generate Channel Strategy'}
          </button>
        </div>

        <div className="card" style={{ padding: 24, overflowY: 'auto' }}>
          {strategy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ padding: '18px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(236,72,153,.15))', border: '1px solid rgba(124,58,237,.3)', textAlign: 'center' }}>
                <div className="syne" style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{strategy.channelName}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{strategy.niche}</div>
              </div>

              {[
                { label: 'Upload Schedule', val: strategy.uploadSchedule, color: '#93c5fd' },
                { label: 'Video Formula', val: strategy.videoFormula, color: '#b47fff' },
                { label: 'SEO Strategy', val: strategy.seoStrategy, color: '#6ee7b7' },
                { label: 'Month 1 Goal', val: strategy.monthOneGoal, color: '#fdba74' },
                { label: 'Monetization Path', val: strategy.monetizationPath, color: '#f9a8d4' },
              ].map(i => (
                <div key={i.label} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, color: i.color, fontWeight: 700, minWidth: 130 }}>{i.label.toUpperCase()}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{i.val}</span>
                </div>
              ))}

              <div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 10 }}>FIRST 3 VIDEO IDEAS + SCRIPTS</div>
                {strategy.scripts?.map((s, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.15)', marginBottom: 10 }}>
                    <pre style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>{s}</pre>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 52 }}>🎬</div>
              <div className="syne" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)' }}>Your channel blueprint awaits</div>
              <p style={{ fontSize: 13, color: 'var(--text4)', textAlign: 'center' }}>Configure your channel and generate a complete automated content strategy.</p>
            </div>
          )}
        </div>
      </div>

      {channels.length > 0 && (
        <div className="card" style={{ padding: 22 }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Your Faceless Channels</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
            {channels.map((c, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎬</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{c.channel_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.niche}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="live-dot" />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{c.videos_generated} videos generated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
