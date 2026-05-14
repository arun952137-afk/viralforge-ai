'use client'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface Msg { role: 'user' | 'assistant'; content: string; ts: number }

const QUICK = [
  'Give me 5 viral video ideas for a finance niche',
  'Write a hook that stops the scroll instantly',
  'How do I grow from 0 to 10K subscribers fast?',
  'Analyze why faceless channels are so profitable',
  'What posting time gets maximum engagement?',
  'Create a 30-day content strategy for YouTube',
]

export default function CopilotPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'assistant',
    content: "Hi! I'm your CREOVA AI Copilot. I know everything about growing YouTube, TikTok, Instagram channels — viral hooks, competitor strategies, trend forecasting, monetization, and more. What are we working on today?",
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(text?: string) {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')
    const userMsg: Msg = { role: 'user', content, ts: Date.now() }
    setMsgs(m => [...m, userMsg])
    setLoading(true)
    try {
      const history = msgs.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMsgs(m => [...m, { role: 'assistant', content: json.content, ts: Date.now() }])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
      setMsgs(m => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>🤖 AI Copilot</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Your 24/7 AI content strategist. Ask anything.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Online</span>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                background: m.role === 'assistant' ? 'var(--grad2)' : 'rgba(255,255,255,0.1)',
                border: m.role === 'assistant' ? 'none' : '1px solid var(--border)',
              }}>
                {m.role === 'assistant' ? 'C' : '👤'}
              </div>
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'user' ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,.3)' : 'var(--border)'}`,
                fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>C</div>
              <div style={{ padding: '12px 16px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} className="proc-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {msgs.length <= 2 && (
          <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text2)', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,.4)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            className="inp" placeholder="Ask about growth strategy, viral hooks, competitor analysis…"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            style={{ flex: 1, minHeight: 44, maxHeight: 120, resize: 'none', borderRadius: 12, padding: '11px 14px' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn btn-p" style={{ padding: '12px 20px', flexShrink: 0 }}>
            {loading ? '…' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
