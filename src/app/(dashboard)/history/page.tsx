'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const TYPE_ICONS: Record<string, string> = { script:'📝', caption:'💬', thumbnail:'🖼️', hook:'🪝', hashtag:'🔍', reel_idea:'🎬', seo:'📈', voiceover:'🎙️' }

export default function HistoryPage() {
  const [gens, setGens] = useState<{ id: string; generation_type: string; prompt: string; result: string; credits_used: number; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: g } = await supabase.from('generations').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(50)
      setGens(g ?? [])
      setLoading(false)
    })
  }, [])

  const sel = gens.find(g => g.id === selected)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="syne font-bold text-2xl">Generation History</h1>
        <p className="text-slate-400 text-sm mt-1">All your AI-generated content</p>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : gens.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4 opacity-40">📜</div>
          <p>No generations yet. Visit the AI Studio to create content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            {gens.map(g => (
              <div key={g.id} onClick={() => setSelected(g.id === selected ? null : g.id)}
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${g.id === selected ? 'border-violet-500/40 bg-violet-500/5' : 'hover:bg-white/5'}`} style={{ border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-lg flex-shrink-0">{TYPE_ICONS[g.generation_type] ?? '✨'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.prompt}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{g.generation_type} · {formatDate(g.created_at)} · {g.credits_used} credit{g.credits_used !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
          {sel && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TYPE_ICONS[sel.generation_type] ?? '✨'}</span>
                  <span className="syne font-bold text-sm capitalize">{sel.generation_type}</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(sel.result ?? '').then(() => toast.success('Copied!'))} className="btn-ghost text-xs py-1 px-2">📋 Copy</button>
              </div>
              <div className="text-xs text-slate-500 mb-3 p-2 rounded-lg bg-white/5">Prompt: {sel.prompt}</div>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto" style={{ maxHeight: 400 }}>{sel.result}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
