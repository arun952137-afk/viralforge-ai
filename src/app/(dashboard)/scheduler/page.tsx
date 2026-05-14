'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface CalendarItem { day: number; title: string; platform: string; time: string; type: string; reason: string }
interface Schedule { summary: string; bestTimes: Record<string, string>; calendar: CalendarItem[] }

const PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'LinkedIn']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TYPE_COLORS: Record<string, string> = { 'Long-form': '#7C3AED', 'Short/Reel': '#EC4899', 'Story': '#F97316', 'Post': '#3B82F6', 'Live': '#10B981' }

export default function SchedulerPage() {
  const [niche, setNiche] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['YouTube'])
  const [timezone, setTimezone] = useState('IST')
  const [frequency, setFrequency] = useState('4x/week')
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!niche) { toast.error('Enter your niche'); return }
    setLoading(true)
    try {
      const prompt = `Create an AI-optimized 30-day content calendar for a creator. Niche: "${niche}", Platforms: ${platforms.join(', ')}, Timezone: ${timezone}, Frequency: ${frequency}.

Return ONLY JSON (no markdown):
{"summary":"2-sentence why this schedule works","bestTimes":{"YouTube":"specific best time","TikTok":"specific best time","Instagram":"specific best time","LinkedIn":"specific best time"},"calendar":[{"day":1,"title":"Video/Post Title","platform":"Platform","time":"HH:MM AM/PM IST","type":"Long-form|Short/Reel|Story|Post|Live","reason":"why this day/time"},{"day":3,"title":"...","platform":"...","time":"...","type":"...","reason":"..."}]}

Generate 12-16 calendar items across 30 days optimized for maximum engagement.`

      const res = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const json = await res.json()
      const parsed = JSON.parse(json.content.replace(/```json?|```/g, '').trim())
      setSchedule(parsed)

      const { data: { user } } = await supabase.auth.getUser()
      if (user && parsed.calendar) {
        await Promise.all(parsed.calendar.slice(0, 5).map((item: CalendarItem) =>
          supabase.from('scheduled_content').insert({ user_id: user.id, title: item.title, platform: item.platform, content_type: item.type, ai_best_time: item.time, status: 'scheduled' })
        ))
      }
      toast.success('30-day schedule created!')
    } catch { toast.error('Failed to generate schedule') }
    finally { setLoading(false) }
  }

  const togglePlatform = (p: string) => setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>📅 Smart Scheduler</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>AI predicts the exact times your audience is most active. Post at the right moment — every time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, height: 'fit-content' }}>
          <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Schedule Config</div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NICHE *</label>
            <input className="inp" placeholder="Your content niche" value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 8 }}>PLATFORMS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => togglePlatform(p)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: `1px solid ${platforms.includes(p) ? 'rgba(16,185,129,.5)' : 'var(--border)'}`, background: platforms.includes(p) ? 'rgba(16,185,129,.15)' : 'transparent', color: platforms.includes(p) ? '#6ee7b7' : 'var(--text3)', transition: 'all .15s' }}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>POSTING FREQUENCY</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Daily', '5x/week', '4x/week', '3x/week', '2x/week'].map(f => (
                <button key={f} onClick={() => setFrequency(f)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${frequency === f ? 'rgba(124,58,237,.5)' : 'var(--border)'}`, background: frequency === f ? 'rgba(124,58,237,.15)' : 'transparent', color: frequency === f ? '#b47fff' : 'var(--text3)', transition: 'all .15s' }}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>TIMEZONE</label>
            <select className="inp" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {['IST', 'EST', 'PST', 'GMT', 'CST', 'JST'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
            {loading ? '📅 Generating…' : '📅 Generate 30-Day Schedule'}
          </button>
        </div>

        <div>
          {schedule ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary */}
              <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}>
                <p style={{ fontSize: 14, color: '#6ee7b7', lineHeight: 1.6 }}>📡 {schedule.summary}</p>
              </div>

              {/* Best times */}
              <div className="card" style={{ padding: 20 }}>
                <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>⚡ AI-Optimized Best Times</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
                  {Object.entries(schedule.bestTimes).map(([plat, time]) => (
                    <div key={plat} style={{ padding: '12px', borderRadius: 10, background: 'var(--surface)', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 4 }}>{plat}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar grid */}
              <div className="card" style={{ padding: 20 }}>
                <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📅 30-Day Content Calendar</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 12 }}>
                  {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', fontWeight: 700, padding: '6px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i + 1
                    const item = schedule.calendar.find(c => c.day === day)
                    return (
                      <div key={i} title={item ? `${item.title}\n${item.time}` : ''} style={{
                        height: 56, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: item ? 'pointer' : 'default',
                        background: item ? `${TYPE_COLORS[item.type] ?? '#7C3AED'}18` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${item ? `${TYPE_COLORS[item.type] ?? '#7C3AED'}40` : 'var(--border)'}`,
                        transition: 'all .15s',
                      }}>
                        <div style={{ fontSize: 11, color: day > 30 ? 'var(--text4)' : item ? '#fff' : 'var(--text4)', fontWeight: item ? 700 : 400 }}>{day <= 30 ? day : ''}</div>
                        {item && <div style={{ width: 20, height: 3, borderRadius: 99, background: TYPE_COLORS[item.type] ?? '#7C3AED' }} />}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                  {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming posts */}
              <div className="card" style={{ padding: 20 }}>
                <div className="syne" style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Next Scheduled Posts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {schedule.calendar.slice(0, 6).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${TYPE_COLORS[item.type] ?? '#7C3AED'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: TYPE_COLORS[item.type] ?? '#7C3AED', flexShrink: 0 }}>D{item.day}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{item.platform} · {item.time}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: `${TYPE_COLORS[item.type] ?? '#7C3AED'}20`, color: TYPE_COLORS[item.type] ?? '#7C3AED', flexShrink: 0 }}>{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 400 }}>
              <div style={{ fontSize: 56 }}>📅</div>
              <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text3)' }}>Your calendar awaits</div>
              <p style={{ fontSize: 14, color: 'var(--text4)', textAlign: 'center', maxWidth: 300 }}>Configure your schedule and AI will generate the perfect 30-day content calendar optimized for your audience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
