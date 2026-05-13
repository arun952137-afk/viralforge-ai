'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Welcome back! 👋')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-xl syne mx-auto mb-4">C</div>
        <h1 className="syne font-bold text-2xl mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to your CREOVA account</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot?</Link>
          </div>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn-primary w-full justify-center py-3 mt-2" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        No account? <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">Sign up free</Link>
      </p>
    </div>
  )
}
