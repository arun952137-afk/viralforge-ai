'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ username?: string; email?: string; plan?: string; credits?: number; created_at?: string } | null>(null)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('users').select('*').eq('id', data.user.id).single()
      setProfile({ ...p, email: data.user.email })
      setUsername(p?.username ?? '')
    })
  }, [])

  async function save() {
    if (!username.trim()) { toast.error('Enter a username'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('users').update({ username: username.trim() }).eq('id', user.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setProfile(p => p ? { ...p, username: username.trim() } : p)
    toast.success('Profile updated!')
  }

  if (!profile) return <div className="h-48 skeleton rounded-2xl" />

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="syne font-bold text-2xl">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-2xl syne">
            {(profile.username ?? profile.email ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="syne font-bold text-lg">{profile.username ?? profile.email?.split('@')[0]}</div>
            <div className="text-slate-400 text-sm">{profile.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag tag-purple capitalize">{profile.plan}</span>
              <span className="tag tag-green">{profile.credits === -1 ? '∞' : profile.credits} credits</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input className="input opacity-50" value={profile.email ?? ''} disabled />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Plan</label>
            <input className="input opacity-50 capitalize" value={profile.plan ?? 'free'} disabled />
          </div>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
        </div>
      </div>

      <div className="card p-6 border-red-500/20" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <h3 className="syne font-bold text-base text-red-400 mb-4">⚠️ Danger Zone</h3>
        <button onClick={() => toast.error('Contact support to delete your account')} className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all">Delete Account</button>
      </div>
    </div>
  )
}
