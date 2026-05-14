'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface Gen { id: string; type: string; prompt: string; output: string; created_at: string }

const TYPE_ICONS: Record<string, string> = { script: '📝', hook: '🪝', caption: '💬', seo: '🔍', thumbnail: '🖼️', viral: '🔥', brand: '✦', idea: '💡' }

export default function HistoryPage() {
  const [gens, setGens] = useState<Gen[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: g } = await supabase.from('generations').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(50)
        setGens(g ?? [])
      }
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? gens : gens.filter(g => g.type === filter)
  const types = ['all', ...Array.from(new Set(gens.map(g => g.type)))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>🕐 Generation History</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>All your AI-generated content in one place.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 16px', borderRadius: 100, fontSize: 12, cursor: 'pointer', border: `1px solid ${filter === t ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: filter === t ? 'rgba(124,58,237,.15)' : 'transparent', color: filter === t ? '#b47fff' : 'var(--text3)', fontWeight: filter === t ? 700 : 400, textTransform: 'capitalize' }}>
            {t === 'all' ? 'All' : `${TYPE_ICONS[t] ?? '◆'} ${t}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 72, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text3)' }}>No generations yet</div>
          <p style={{ fontSize: 14, color: 'var(--text4)', marginTop: 8 }}>Go to AI Studio and start creating content!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(g => (
            <div key={g.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[g.type] ?? '◆'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#b47fff', textTransform: 'uppercase' }}>{g.type}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>· {new Date(g.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.prompt}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(g.output); toast.success('Copied!') }}
                    style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text3)' }}>📋</button>
                  <span style={{ fontSize: 18, color: 'var(--text3)', display: 'flex', alignItems: 'center' }}>{expanded === g.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === g.id && (
                <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <pre style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{g.output}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
