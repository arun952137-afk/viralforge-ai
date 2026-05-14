'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

declare global { interface Window { Razorpay: new (opts: unknown) => { open: () => void } } }

const PLANS = [
  { id: 'starter', name: 'Starter', old: '₹1,999', price: 799, display: '₹799', period: '/mo', credits: 50, tag: 'tb', color: '#3B82F6', features: ['50 AI Credits/month', 'Script & Hook Generator', 'Basic Trend Scanner', '5 Competitor Analyses', 'Standard Exports', 'Email Support'] },
  { id: 'pro',     name: 'Creator Pro', old: '₹3,999', price: 1799, display: '₹1,799', period: '/mo', credits: 500, tag: 'tv', color: '#7C3AED', highlight: true, features: ['Unlimited AI Credits', 'All 8 AI Studio Tools', 'Viral Engine + Scores', 'Brand Builder AI', 'Faceless Channel AI', 'Competitor Intelligence', 'Advanced Analytics', 'HD Exports (No Watermark)', 'Priority Support'] },
  { id: 'studio',  name: 'Studio', old: '₹9,999', price: 4499, display: '₹4,499', period: '/mo', credits: -1, tag: 'tc', color: '#06B6D4', features: ['Everything in Creator Pro', 'AI Copilot (24/7)', '5-Seat Team Workspace', 'White-Label Exports', 'API Access', 'Dedicated Success Manager', 'Custom Brand Kits', 'Bulk Content Generation'] },
]

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        const { data: p } = await supabase.from('users').select('plan').eq('id', data.user.id).single()
        setCurrentPlan(p?.plan ?? 'free')
      }
    })
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.head.appendChild(script)
  }, [])

  async function checkout(plan: typeof PLANS[0]) {
    if (currentPlan === plan.id) { toast('You are already on this plan'); return }
    setLoading(plan.id)
    try {
      const res = await fetch('/api/razorpay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: plan.price * 100, plan: plan.id }) })
      const { orderId, keyId } = await res.json()

      const rzp = new window.Razorpay({
        key: keyId,
        amount: plan.price * 100,
        currency: 'INR',
        name: 'CREOVA Studio',
        description: `${plan.name} Plan`,
        order_id: orderId,
        theme: { color: plan.color },
        handler: async (response: { razorpay_payment_id: string }) => {
          if (userId) {
            await supabase.from('users').update({ plan: plan.id, credits: plan.credits }).eq('id', userId)
            setCurrentPlan(plan.id)
            toast.success(`🎉 Welcome to ${plan.name}!`)
          }
        },
        prefill: {},
      })
      rzp.open()
    } catch {
      toast.error('Payment failed. Try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>💎 Upgrade Plan</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Prices slashed 60% — limited time only. Lock in your rate before it ends.</p>
      </div>

      {/* Flash sale banner */}
      <div style={{ padding: '16px 22px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(249,115,22,.15), rgba(239,68,68,.12))', border: '1px solid rgba(249,115,22,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <div className="syne" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Flash Sale — 60% OFF All Plans</div>
            <p style={{ fontSize: 13, color: '#fdba74' }}>Prices go back up soon. Thousands of creators already locked in their rate.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="proc-dot" />
          <span style={{ fontSize: 13, color: '#fdba74', fontWeight: 600 }}>Limited time offer</span>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20, alignItems: 'start' }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            borderRadius: 20, padding: '28px',
            background: 'var(--bg2)',
            border: plan.highlight ? `1px solid ${plan.color}60` : '1px solid var(--border)',
            boxShadow: plan.highlight ? `0 0 40px ${plan.color}20` : 'none',
            transform: plan.highlight ? 'scale(1.02)' : 'scale(1)',
            position: 'relative',
          }}>
            {plan.highlight && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad2)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 18px', borderRadius: 100, whiteSpace: 'nowrap', boxShadow: '0 0 16px rgba(124,58,237,.5)' }}>
                ⭐ MOST POPULAR
              </div>
            )}

            {currentPlan === plan.id && (
              <div style={{ position: 'absolute', top: plan.highlight ? 24 : 16, right: 20, padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', fontSize: 11, color: '#6ee7b7', fontWeight: 700 }}>CURRENT</div>
            )}

            <span className={`tag ${plan.tag}`}>{plan.name}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '14px 0 6px' }}>
              <span className="syne" style={{ fontSize: 38, fontWeight: 900, color: '#fff' }}>{plan.display}</span>
              <span style={{ fontSize: 14, color: 'var(--text3)' }}>{plan.period}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <span style={{ fontSize: 13, color: 'var(--text4)', textDecoration: 'line-through' }}>{plan.old}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,.25)', fontWeight: 700 }}>60% OFF</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
                  <span style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                </div>
              ))}
            </div>

            <button onClick={() => checkout(plan)} disabled={loading === plan.id || currentPlan === plan.id}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: currentPlan === plan.id ? 'default' : 'pointer',
                border: 'none', background: currentPlan === plan.id ? 'rgba(255,255,255,0.05)' : plan.highlight ? 'var(--grad2)' : 'rgba(255,255,255,0.08)',
                color: currentPlan === plan.id ? 'var(--text3)' : '#fff',
                boxShadow: plan.highlight && currentPlan !== plan.id ? '0 0 24px rgba(124,58,237,.5)' : 'none',
                transition: 'all .2s',
              }}>
              {loading === plan.id ? 'Opening payment…' : currentPlan === plan.id ? '✓ Current Plan' : `Upgrade to ${plan.name} →`}
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
        🔒 All payments secured by <strong style={{ color: '#fff' }}>Razorpay</strong> · 256-bit SSL · 7-day money-back guarantee
      </div>
    </div>
  )
}
