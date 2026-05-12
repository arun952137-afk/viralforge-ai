'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PLAN_PRICES } from '@/lib/utils'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

const PLANS = [
  {
    id: 'free', name: 'Free', credits: 10, price: { monthly: 0, yearly: 0 },
    features: ['10 AI credits/month', 'Basic generation', 'Watermarked exports'],
    color: 'var(--border)',
  },
  {
    id: 'pro', name: 'Creator Pro', credits: 500, price: PLAN_PRICES.pro,
    features: ['500 AI credits/month', 'HD exports (no watermark)', 'All generation types', 'Trend Scanner', 'Analytics', 'Priority support'],
    color: '#7c3aed',
  },
  {
    id: 'studio', name: 'Studio', credits: -1, price: PLAN_PRICES.studio,
    features: ['Unlimited AI credits', 'Everything in Pro', 'Team workspaces', 'White-label exports', 'API access', 'Dedicated support'],
    color: '#06b6d4',
  },
]

export default function BillingPage() {
  const [yearly, setYearly] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [paying, setPaying] = useState<string | null>(null)
  const [subs, setSubs] = useState<{ plan: string; status: string; created_at: string; amount: number }[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('rzp-sdk')) {
      const s = document.createElement('script')
      s.id = 'rzp-sdk'; s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true
      document.body.appendChild(s)
    }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id); setUserEmail(data.user.email ?? '')
      const [{ data: p }, { data: subData }] = await Promise.all([
        supabase.from('users').select('plan').eq('id', data.user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(5),
      ])
      setCurrentPlan(p?.plan ?? 'free')
      setSubs(subData ?? [])
    })
  }, [])

  async function handleUpgrade(planId: string) {
    if (planId === 'free') return
    if (!userId) { toast.error('Please log in'); return }
    setPaying(planId)

    const amount = yearly ? PLAN_PRICES[planId as keyof typeof PLAN_PRICES]?.yearly : PLAN_PRICES[planId as keyof typeof PLAN_PRICES]?.monthly
    if (!amount) { setPaying(null); return }

    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, plan: planId, currency: 'INR' })
      })
      const { order, key_id, demo } = await res.json()

      if (demo) {
        await supabase.from('users').update({ plan: planId, credits: planId === 'pro' ? 500 : -1 }).eq('id', userId)
        await supabase.from('subscriptions').insert({ user_id: userId, plan: planId, status: 'active', amount, billing_cycle: yearly ? 'yearly' : 'monthly' })
        setCurrentPlan(planId)
        toast.success(`🎉 ${PLAN_PRICES[planId as keyof typeof PLAN_PRICES] ? planId : 'plan'} activated!`)
        setPaying(null)
        return
      }

      const options = {
        key: key_id, amount: order.amount, currency: order.currency,
        name: 'CREOVA Studio', description: `${planId} plan subscription`,
        order_id: order.id,
        handler: async (response: { razorpay_payment_id: string }) => {
          await supabase.from('users').update({ plan: planId, credits: planId === 'pro' ? 500 : -1 }).eq('id', userId)
          await supabase.from('subscriptions').insert({ user_id: userId, razorpay_order_id: order.id, razorpay_payment_id: response.razorpay_payment_id, plan: planId, status: 'active', amount, billing_cycle: yearly ? 'yearly' : 'monthly' })
          setCurrentPlan(planId)
          toast.success(`🎉 ${planId} plan activated!`)
          setPaying(null)
        },
        prefill: { email: userEmail },
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setPaying(null) }
      }
      if (window.Razorpay) { const rzp = new window.Razorpay(options); rzp.open() }
      else { toast.error('Razorpay not loaded. Refresh and try again.'); setPaying(null) }
    } catch {
      toast.error('Payment failed. Try again.'); setPaying(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="syne font-bold text-2xl">Billing & Plans</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your subscription · Powered by Razorpay</p>
      </div>

      {/* Current plan */}
      <div className="card p-5" style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.05))' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Current Plan</p>
            <p className="syne font-bold text-xl capitalize">{currentPlan}</p>
          </div>
          <span className="tag tag-purple text-sm capitalize">{currentPlan}</span>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">Billing:</span>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
          {['Monthly', 'Yearly (Save 30%)'].map((l, i) => (
            <button key={l} onClick={() => setYearly(i === 1)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${(yearly ? i === 1 : i === 0) ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(p => {
          const isActive = currentPlan === p.id
          const price = p.price ? (yearly ? p.price.yearly : p.price.monthly) : 0
          return (
            <div key={p.id} className={`card p-6 transition-all duration-300 ${isActive ? 'border-violet-500/50' : 'hover:border-white/20'}`}>
              {isActive && <div className="tag tag-green inline-flex mb-3">Current Plan ✓</div>}
              <div className="syne font-bold text-lg mb-1">{p.name}</div>
              <div className="syne font-black text-3xl mb-1">{price === 0 ? '₹0' : `₹${price.toLocaleString()}`}</div>
              <div className="text-slate-400 text-xs mb-5">{price === 0 ? 'forever' : yearly ? 'per month, billed annually' : 'per month'}</div>
              <div className="space-y-2 mb-6">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 flex-shrink-0">✓</span>{f}
                  </div>
                ))}
              </div>
              {p.id === 'free' ? (
                <button disabled className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed">Free Forever</button>
              ) : isActive ? (
                <button disabled className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed">Active Plan</button>
              ) : (
                <button onClick={() => handleUpgrade(p.id)} disabled={paying === p.id}
                  className="btn-primary w-full justify-center py-3">
                  {paying === p.id ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Processing...</span>
                  ) : `Upgrade to ${p.name} →`}
                </button>
              )}
              {p.id !== 'free' && !isActive && (
                <p className="text-center text-xs text-slate-500 mt-2">🔒 Secured by Razorpay</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment history */}
      {subs.length > 0 && (
        <div className="card p-5">
          <h2 className="syne font-bold text-base mb-4">Payment History</h2>
          <div className="space-y-2">
            {subs.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-sm font-medium capitalize">{s.plan} plan</span>
                  <span className="text-xs text-slate-500 ml-2">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  {s.amount && <span className="text-sm">₹{s.amount.toLocaleString()}</span>}
                  <span className={`tag ${s.status === 'active' ? 'tag-green' : 'tag-orange'} text-xs`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
