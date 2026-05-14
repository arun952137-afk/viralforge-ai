'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
      if (error) throw error
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error sending reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Reset Password</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>We'll send a reset link to your email</p>
      </div>
      <div className="card" style={{ padding: '36px 32px' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Check your inbox for the reset link.</p>
            <Link href="/login" className="btn btn-p" style={{ justifyContent: 'center', width: '100%', padding: 13 }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Email address</label>
              <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <Link href="/login" style={{ textAlign: 'center', fontSize: 14, color: 'var(--text3)', textDecoration: 'none' }}>← Back to login</Link>
          </form>
        )}
      </div>
    </div>
  )
}
