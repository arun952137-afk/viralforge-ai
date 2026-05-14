'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [profile, setProfile] = useState({ username: '', plan: 'free', credits: 0 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        const { data: p } = await supabase.from('users').select('*').eq('id', data.user.id).single()
        if (p) setProfile({ username: p.username ?? '', plan: p.plan ?? 'free', credits: p.credits ?? 0 })
        setLoading(false)
      }
    })
  }, [])

  async function save() {
    if (!user?.id) return
    setSaving(true)
    const { error } = await supabase.from('users').update({ username: profile.username }).eq('id', user.id)
    if (error) toast.error('Save failed')
    else toast.success('Profile saved!')
    setSaving(false)
  }

  const PLAN_COLOR: Record<string, string> = { free: '#3B82F6', starter: '#06B6D4', pro: '#7C3AED', studio: '#EC4899' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>👤 Profile</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Manage your creator account</p>
      </div>

      {/* Avatar + plan */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', boxShadow: '0 0 24px rgba(124,58,237,.4)' }}>
            {profile.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="syne" style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{profile.username || 'Creator'}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ padding: '2px 10px', borderRadius: 5, background: `${PLAN_COLOR[profile.plan]}20`, border: `1px solid ${PLAN_COLOR[profile.plan]}40`, fontSize: 11, fontWeight: 700, color: PLAN_COLOR[profile.plan], textTransform: 'uppercase' }}>{profile.plan}</div>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{profile.credits === -1 ? '∞ credits' : `${profile.credits} credits left`}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>CREATOR HANDLE</label>
            <input className="inp" placeholder="@yourchannel" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input className="inp" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <button onClick={save} disabled={saving} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 24 }}>
        <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Account Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Plan', value: profile.plan.toUpperCase(), color: PLAN_COLOR[profile.plan] },
            { label: 'Credits Left', value: profile.credits === -1 ? '∞' : profile.credits, color: '#b47fff' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px', borderRadius: 10, background: 'var(--surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
              <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
