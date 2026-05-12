'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { toast.error('Enter your email'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    setSent(true)
    toast.success('Reset link sent!')
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-xl syne mx-auto mb-4">C</div>
        <h1 className="syne font-bold text-2xl mb-2">Reset Password</h1>
        <p className="text-slate-400 text-sm">We'll send you a reset link</p>
      </div>
      {sent ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-slate-300 mb-2">Check your email!</p>
          <p className="text-slate-500 text-sm">We sent a reset link to <strong className="text-slate-300">{email}</strong></p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn-primary w-full justify-center py-3" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p className="text-center text-sm text-slate-500 mt-6">
        <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">← Back to login</Link>
      </p>
    </div>
  )
}
