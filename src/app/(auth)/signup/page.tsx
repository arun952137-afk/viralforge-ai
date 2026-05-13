'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Fill in all fields'); return }
    if (password.length < 6) { toast.error('Password must be 6+ characters'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      toast.success('Account created! 🎉')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-xl syne mx-auto mb-4">C</div>
        <h1 className="syne font-bold text-2xl mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm">Start with 10 free AI credits</p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Password</label>
          <input className="input" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary w-full justify-center py-3 mt-2" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>
      <p className="text-center text-xs text-slate-500 mt-4">By signing up you agree to our Terms & Privacy Policy</p>
      <p className="text-center text-sm text-slate-500 mt-3">
        Have an account? <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
      </p>
    </div>
  )
}
