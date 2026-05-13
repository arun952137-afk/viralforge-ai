'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { GENERATION_TYPES } from '@/lib/utils'

const TEMPLATES: Record<string, string[]> = {
  script:    ['YouTube long-form tutorial', 'YouTube Shorts script', 'Faceless AI video', 'Podcast episode intro', 'Storytelling reel'],
  hook:      ['Curiosity hook', 'Fear/FOMO hook', 'Emotional hook', 'Controversial hook', 'Story hook'],
  caption:   ['Neon style captions', 'Karaoke word-by-word', 'Emoji captions', 'Minimal clean', 'Fire gradient'],
  thumbnail: ['Cinematic YouTube', 'Anime style', 'Reaction face', 'Minimal text', 'Neon glitch'],
  hashtag:   ['YouTube hashtags', 'TikTok hashtags', 'Instagram hashtags', 'Trending topics', 'Niche-specific'],
  reel_idea: ['Trending concept', 'Tutorial hook', 'Day-in-life', 'Controversial take', 'Story arc'],
  seo:       ['YouTube SEO package', 'TikTok SEO', 'Instagram SEO', 'Full metadata', 'Title variations'],
}

const PLATFORM_OPTS = ['TikTok', 'YouTube Shorts', 'Instagram Reels', 'YouTube', 'LinkedIn']

function StudioInner() {
  const params = useSearchParams()
  const [type, setType] = useState(params.get('type') ?? 'script')
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [history, setHistory] = useState<{ id: string; prompt: string; result: string; generation_type: string }[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: p } = await supabase.from('users').select('credits').eq('id', data.user.id).single()
      setCredits(p?.credits ?? 0)
      const { data: h } = await supabase.from('generations').select('id,prompt,result,generation_type').eq('user_id', data.user.id).eq('generation_type', type).order('created_at', { ascending: false }).limit(5)
      setHistory(h ?? [])
    })
  }, [type])

  async function generate() {
    if (!prompt.trim()) { toast.error('Enter a prompt'); return }
    if (credits !== null && credits !== -1 && credits < 1) { toast.error('Not enough credits. Upgrade your plan!'); return }
    setLoading(true); setResult('')

    const credCost = GENERATION_TYPES.find(g => g.id === type)?.credits ?? 1

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: buildPrompt(type, prompt, platform)
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text ?? 'Generation failed. Please try again.'
      setResult(text)

      if (userId) {
        await supabase.from('generations').insert({ user_id: userId, generation_type: type, prompt: prompt.trim(), result: text, credits_used: credCost })
        if (credits !== null && credits !== -1) {
          const newCredits = Math.max(0, credits - credCost)
          await supabase.from('users').update({ credits: newCredits }).eq('id', userId)
          setCredits(newCredits)
        }
      }
      toast.success('Generated! ✨')
    } catch {
      toast.error('Generation failed. Check your connection.')
    }
    setLoading(false)
  }

  function buildPrompt(t: string, p: string, plat: string): string {
    const base = `You are a world-class viral content expert for ${plat}.\n\n`
    const prompts: Record<string, string> = {
      script: `${base}Write a complete viral video script about: "${p}".\n\nFormat with sections:\n[HOOK] — Opening 3-5 seconds\n[INTRO] — What viewer will learn\n[MAIN CONTENT] — Core points\n[STORY] — Relatable example\n[CTA] — Call to action\n\nMake it punchy, retention-optimised, include [B-ROLL] cues.`,
      hook: `${base}Generate 7 different viral hooks for a video about: "${p}".\n\nReturn as JSON array (no markdown): [{"type":"curiosity","hook":"...","score":95,"tip":"..."}]\n\nTypes: curiosity, emotional, fear, story, controversial. Score 70-99. Tip under 10 words.`,
      caption: `${base}Generate animated caption text for: "${p}".\n\nFormat as timestamped lines:\n0:00 — Opening line\n0:03 — Next line\n...\n\nMake it punchy, add relevant emojis, optimise for ${plat}.`,
      thumbnail: `${base}Design 4 thumbnail concepts for: "${p}".\n\nFor each: Title text, background style, colour palette, emotion, CTR prediction (%). Make them click-bait but authentic.`,
      hashtag: `${base}Generate a complete SEO package for: "${p}" on ${plat}.\n\nReturn as JSON (no markdown): {"titles":["...x5"],"description":"150 words with CTA","tags":["...x20"],"hashtags":["#...x20"]}`,
      reel_idea: `${base}Generate 5 viral reel ideas about: "${p}" for ${plat}.\n\nFor each: Hook, concept, format, why it works, estimated views potential.`,
      seo: `${base}Create a full SEO package for: "${p}" on ${plat}.\n\nInclude: 5 optimised titles, 200-word description with keywords, 20 tags, 20 hashtags. Return as JSON (no markdown).`,
    }
    return prompts[t] ?? `${base}Help with: "${p}"`
  }

  const typeInfo = GENERATION_TYPES.find(g => g.id === type)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="syne font-bold text-2xl">AI Studio ✨</h1>
          <p className="text-slate-400 text-sm mt-1">Generate viral content with Claude AI</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <span className="text-sm text-slate-400">Credits:</span>
            <span className="font-bold text-violet-300">{credits === -1 ? '∞' : credits}</span>
          </div>
        )}
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {GENERATION_TYPES.map(g => (
          <button key={g.id} onClick={() => { setType(g.id); setResult(''); setPrompt(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${type === g.id ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-200'}`}>
            <span>{g.icon}</span>{g.label}
            <span className="text-xs opacity-60">{g.credits}cr</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h3 className="syne font-bold text-sm mb-4">{typeInfo?.icon} {typeInfo?.label} Settings</h3>

            {/* Templates */}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Template</label>
              <div className="flex flex-wrap gap-2">
                {(TEMPLATES[type] ?? []).map(t => (
                  <button key={t} onClick={() => setPrompt(t)} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-violet-500/30 transition-all">{t}</button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Platform</label>
              <select className="input text-sm" value={platform} onChange={e => setPlatform(e.target.value)}>
                {PLATFORM_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Your Prompt</label>
              <textarea className="input text-sm" style={{ minHeight: 100, resize: 'vertical' }} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={`Describe your ${typeInfo?.label} topic...`} />
            </div>

            <button className="btn-primary w-full justify-center py-3" onClick={generate} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Generating...
                </span>
              ) : `✨ Generate ${typeInfo?.label}`}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="card p-4">
              <h3 className="syne font-bold text-sm mb-3">Recent {typeInfo?.label}s</h3>
              <div className="space-y-2">
                {history.map(h => (
                  <button key={h.id} onClick={() => { setPrompt(h.prompt); setResult(h.result ?? '') }} className="w-full text-left p-2 rounded-lg text-xs text-slate-400 hover:bg-white/5 transition-colors truncate">{h.prompt}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output panel */}
        <div className="lg:col-span-2">
          <div className="card p-5 h-full flex flex-col" style={{ minHeight: 400 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="syne font-bold text-sm">Generated Output</h3>
              {result && (
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(result).then(() => toast.success('Copied!'))} className="btn-ghost text-xs py-1.5 px-3">📋 Copy</button>
                  <button onClick={() => { const b = new Blob([result], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `creova-${type}.txt`; a.click() }} className="btn-ghost text-xs py-1.5 px-3">⬇️ Export</button>
                </div>
              )}
            </div>
            <div className={`flex-1 rounded-xl p-4 text-sm leading-relaxed overflow-y-auto ${loading ? 'ai-loading' : ''}`} style={{ background: 'var(--bg3, #111128)', border: '1px solid var(--border2)', color: result ? 'var(--text2)' : 'var(--text3)', whiteSpace: 'pre-wrap', position: 'relative' }}>
              {loading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Claude AI is generating your content...
                </div>
              ) : result || 'Your AI-generated content will appear here. Choose a type, enter your topic, and click Generate.'}
            </div>
            {result && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="text-emerald-400">✓</span> Generated with Claude AI · @CREOVASTUDIO
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudioPage() {
  return <Suspense fallback={<div className="animate-fade-in-up h-96 skeleton rounded-2xl" />}><StudioInner /></Suspense>
}
