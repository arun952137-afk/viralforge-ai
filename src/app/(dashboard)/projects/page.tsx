'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<{ id: string; name: string; niche: string; created_at: string; status: string }[]>([])
  const [newName, setNewName] = useState('')
  const [newNiche, setNewNiche] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await supabase.from('ai_workflows').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false })
        setProjects(p ?? [])
      }
    })
  }, [])

  async function create() {
    if (!newName.trim()) { toast.error('Enter project name'); return }
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('ai_workflows').insert({ user_id: user.id, name: newName, niche: newNiche, status: 'active' }).select().single()
      if (!error && data) {
        setProjects(p => [data, ...p])
        setNewName(''); setNewNiche('')
        toast.success('Project created!')
      }
    }
    setCreating(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>📁 Projects</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Organize your content workflows and AI projects.</p>
      </div>

      <div className="card" style={{ padding: 24, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>PROJECT NAME</label>
          <input className="inp" placeholder="My Viral Channel Strategy" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NICHE</label>
          <input className="inp" placeholder="Finance, AI, Lifestyle…" value={newNiche} onChange={e => setNewNiche(e.target.value)} />
        </div>
        <button onClick={create} disabled={creating} className="btn btn-p" style={{ padding: '11px 22px', flexShrink: 0 }}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <div className="syne" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text3)' }}>No projects yet</div>
          <p style={{ fontSize: 14, color: 'var(--text4)', marginTop: 8 }}>Create your first project to organize your content workflow.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p.id} className="card card-h" style={{ padding: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14, border: '1px solid rgba(124,58,237,.2)' }}>📁</div>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{p.niche || 'General'}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="live-dot" />
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.status}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
