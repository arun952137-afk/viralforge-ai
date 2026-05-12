'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const NAV = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Studio', href: '/studio' },
]

const FEATURES = [
  { icon: '✂️', title: 'Viral Clip Generator', desc: 'Upload long videos — AI auto-clips the most viral moments for Shorts, Reels & TikTok.', tag: 'Popular', color: '#7c3aed' },
  { icon: '📝', title: 'AI Script Writer', desc: 'Generate full YouTube, Shorts, Podcast and Faceless scripts with hooks, arcs and CTAs.', tag: 'Claude AI', color: '#2563eb' },
  { icon: '🪝', title: 'Hook Generator', desc: 'Stop the scroll with curiosity, emotional and FOMO hooks scored for viral potential.', tag: '', color: '#06b6d4' },
  { icon: '💬', title: 'Auto Captions', desc: 'Neon, Fire, Ice, Karaoke, Emoji — 6 animated caption styles that drive engagement.', tag: 'New', color: '#ec4899' },
  { icon: '🖼️', title: 'Thumbnail AI', desc: 'Cinematic & anime thumbnails with CTR score prediction powered by AI vision.', tag: '', color: '#f97316' },
  { icon: '🔍', title: 'SEO + Hashtags', desc: 'Dominate platform search with AI-optimised titles, descriptions, tags and hashtags.', tag: '', color: '#10b981' },
]

const STATS = [
  { value: '2.4M+', label: 'Reels Created' },
  { value: '98%', label: 'Creator Satisfaction' },
  { value: '10×', label: 'Faster Workflow' },
  { value: '50K+', label: 'Active Creators' },
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: { monthly: 0, yearly: 0 }, credits: 10,
    features: ['10 AI credits/month', '5 clip generations', 'Basic caption styles', 'Watermarked exports'],
    missing: ['HD exports', 'Trend Scanner', 'Analytics', 'Priority support'],
    cta: 'Start Free', featured: false,
  },
  {
    id: 'pro', name: 'Creator Pro', price: { monthly: 2399, yearly: 1679 }, credits: 500,
    features: ['500 AI credits/month', 'Unlimited clip generations', 'All caption styles', 'HD exports (no watermark)', 'Trend Scanner', 'Analytics Dashboard', 'Priority support'],
    missing: [],
    cta: 'Get Pro →', featured: true,
  },
  {
    id: 'studio', name: 'Studio', price: { monthly: 5999, yearly: 4199 }, credits: -1,
    features: ['Unlimited AI credits', 'Everything in Pro', 'Team workspaces (5 seats)', 'White-label exports', 'API access', 'Dedicated support', 'Custom branding'],
    missing: [],
    cta: 'Get Studio →', featured: false,
  },
]

export default function LandingPage() {
  const [yearly, setYearly] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#070711]/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-sm syne">C</div>
            <span className="syne font-bold text-lg">CREOVA</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV.map(n => (
              <Link key={n.label} href={n.href} className="text-sm text-slate-400 hover:text-white transition-colors">{n.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Start Free →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 tag-purple">
            🔥 The AI Creator Operating System
          </div>
          <h1 className="syne font-black text-5xl md:text-7xl leading-tight mb-6">
            Create Viral Content<br/>
            <span className="gradient-text">10× Faster with AI</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            From idea to published reel in minutes. AI scripts, auto-captions, viral clips,
            thumbnails, SEO and hooks — everything your channel needs in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-base px-8 py-3 animate-glow">
              Start Creating Free →
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-3">
              See All Features
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No credit card required · 10 free credits on signup</p>
        </div>

        {/* Stats */}
        <div className="relative max-w-3xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="syne font-black text-3xl gradient-text">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag tag-blue inline-flex mb-4">AI-Powered Tools</div>
            <h2 className="syne font-bold text-4xl md:text-5xl mb-4">Everything You Need to Go Viral</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">One platform. All the AI tools your channel needs to grow from 0 to millions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card-hover p-6 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: `${f.color}20` }}>{f.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="syne font-bold text-base">{f.title}</h3>
                  {f.tag && <span className="tag tag-purple text-xs">{f.tag}</span>}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="tag tag-green inline-flex mb-4">Simple Pricing</div>
            <h2 className="syne font-bold text-4xl md:text-5xl mb-4">Invest in Your Growth</h2>
            <p className="text-slate-400 text-lg mb-8">All plans include a 7-day free trial. Cancel anytime.</p>
            <div className="inline-flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1">
              {['Monthly', 'Yearly (Save 30%)'].map((l, i) => (
                <button key={l} onClick={() => setYearly(i === 1)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${(yearly ? i === 1 : i === 0) ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(p => (
              <div key={p.id} className={`card p-6 relative transition-all duration-300 ${p.featured ? 'border-violet-500/50 shadow-xl shadow-violet-500/15' : 'hover:border-white/20'}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>
                )}
                <div className="tag tag-purple inline-flex mb-4 mt-2">{p.name}</div>
                <div className="syne font-black text-4xl mb-1">
                  {p.price.monthly === 0 ? '₹0' : `₹${(yearly ? p.price.yearly : p.price.monthly).toLocaleString()}`}
                </div>
                <div className="text-slate-400 text-sm mb-6">{p.price.monthly === 0 ? 'forever' : yearly ? 'per month, billed annually' : 'per month'}</div>
                <div className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 flex-shrink-0">✓</span>{f}
                    </div>
                  ))}
                  {p.missing.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="flex-shrink-0">✗</span>{f}
                    </div>
                  ))}
                </div>
                <Link href={p.id === 'free' ? '/signup' : `/signup?plan=${p.id}`}
                  className={p.featured ? 'btn-primary w-full justify-center py-3' : 'btn-secondary w-full justify-center py-3'}>
                  {p.cta}
                </Link>
                {p.id !== 'free' && (
                  <p className="text-center text-xs text-slate-500 mt-3">🔒 Secured by Razorpay</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10" />
            <div className="relative">
              <h2 className="syne font-black text-4xl mb-4">Ready to Go Viral?</h2>
              <p className="text-slate-400 mb-8">Join 50,000+ creators already using CREOVA to grow their channels.</p>
              <Link href="/signup" className="btn-primary text-base px-10 py-3 animate-glow">
                Start Creating Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-xs syne">C</div>
            <span className="syne font-bold">CREOVA</span>
            <span className="text-slate-600 text-sm ml-2">© 2025 All rights reserved</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
