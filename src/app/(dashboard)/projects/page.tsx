'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export default function ProjectsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [assets, setAssets] = useState<{ id: string; file_name: string; file_type: string; file_url: string; file_size: number; created_at: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: a } = await supabase.from('assets').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false })
      setAssets(a ?? [])
    })
  }, [])

  const onDrop = useCallback(async (files: File[]) => {
    if (!userId) return
    for (const file of files) {
      const allowed = ['video/mp4', 'video/quicktime', 'image/png', 'image/jpeg', 'image/webp']
      if (!allowed.includes(file.type)) { toast.error(`${file.name} type not supported`); continue }
      setUploading(true); setProgress(20)
      const path = `${userId}/${Date.now()}-${file.name}`
      const { data: up, error } = await supabase.storage.from('uploads').upload(path, file)
      setProgress(80)
      if (error) { toast.error(`Upload failed: ${error.message}`); setUploading(false); setProgress(0); continue }
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      await supabase.from('assets').insert({ user_id: userId, file_name: file.name, file_type: file.type, file_url: publicUrl, file_size: file.size })
      const { data: a } = await supabase.from('assets').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setAssets(a ?? [])
      setProgress(100)
      setTimeout(() => { setUploading(false); setProgress(0) }, 500)
      toast.success(`${file.name} uploaded!`)
    }
  }, [userId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'video/*': ['.mp4', '.mov'], 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] } })

  async function deleteAsset(id: string, url: string) {
    await supabase.from('assets').delete().eq('id', id)
    setAssets(a => a.filter(x => x.id !== id))
    toast.success('Deleted')
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="syne font-bold text-2xl">Projects & Assets</h1>
        <p className="text-slate-400 text-sm mt-1">Upload and manage your videos & images</p>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} className={`card p-12 text-center cursor-pointer transition-all duration-200 border-dashed ${isDragActive ? 'border-violet-500/60 bg-violet-500/5' : 'hover:border-violet-500/30 hover:bg-white/2'}`} style={{ border: '2px dashed var(--border2)' }}>
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <div className="text-4xl mb-4">⬆️</div>
            <p className="text-slate-300 font-medium mb-3">Uploading...</p>
            <div className="w-48 mx-auto h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-4">{isDragActive ? '⬇️' : '📁'}</div>
            <p className="syne font-bold text-lg mb-2">{isDragActive ? 'Drop files here' : 'Drop files to upload'}</p>
            <p className="text-slate-400 text-sm mb-4">MP4, MOV, PNG, JPG, WEBP supported</p>
            <span className="btn-primary text-sm px-6 py-2">Browse Files</span>
          </div>
        )}
      </div>

      {/* Assets grid */}
      {assets.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-4 opacity-40">📂</div>
          <p>No assets uploaded yet. Drop your first file above!</p>
        </div>
      ) : (
        <div>
          <h2 className="syne font-bold text-base mb-4">Your Assets ({assets.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map(a => (
              <div key={a.id} className="card p-3 group relative">
                <div className="aspect-video bg-white/5 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {a.file_type.startsWith('image') ? (
                    <img src={a.file_url} alt={a.file_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-4xl">🎬</div>
                  )}
                </div>
                <p className="text-xs font-medium truncate text-slate-200">{a.file_name}</p>
                <p className="text-xs text-slate-500">{formatSize(a.file_size)} · {formatDate(a.created_at)}</p>
                <button onClick={() => deleteAsset(a.id, a.file_url)} className="absolute top-2 right-2 w-6 h-6 rounded-md bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
