'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const STATS = [
  { n: '2.4M+', l: 'AI Assets Generated' },
  { n: '50K+',  l: 'Active Creators' },
  { n: '10×',   l: 'Faster Workflow' },
  { n: '98%',   l: 'Creator Satisfaction' },
]

const FEATURES = [
  { icon: '✂️', title: 'Viral Clip AI', desc: 'Upload any long video — AI auto-clips the most viral moments for Shorts, Reels & TikTok in seconds.', tag: 'Popular', tc: 'tv' },
  { icon: '📝', title: 'AI Script Writer', desc: 'Generate full YouTube scripts, podcast episodes & faceless video scripts with cinematic hooks.', tag: 'Claude AI', tc: 'tb' },
  { icon: '🪝', title: 'Hook Generator', desc: 'Stop-the-scroll hooks powered by emotional psychology & virality data. 50+ proven frameworks.', tag: null, tc: null },
  { icon: '🎯', title: 'Competitor AI', desc: 'Reverse-engineer any channel. See exactly what makes competitors go viral — then do it better.', tag: 'New', tc: 'tc' },
  { icon: '🔥', title: 'Viral Engine', desc: 'Get a viral score, retention prediction & AI recommendations before you publish anything.', tag: null, tc: null },
  { icon: '📡', title: 'Trend Intel', desc: 'Real-time trend scanner across YouTube, TikTok & Instagram. Catch trends 48 hours before they peak.', tag: 'Live', tc: 'tg' },
  { icon: '✦', title: 'Brand Builder', desc: 'AI generates your complete creator identity — name, palette, slogan, positioning & 30-day growth plan.', tag: null, tc: null },
  { icon: '🎬', title: 'Faceless AI', desc: 'Launch a fully automated faceless channel. AI handles scripts, voiceovers, thumbnails & SEO.', tag: 'V3', tc: 'tv' },
  { icon: '📅', title: 'Smart Scheduler', desc: 'AI predicts the exact time your audience is most active and schedules content for maximum reach.', tag: null, tc: null },
]

const PLANS = [
  {
    name: 'Starter',
    old: '₹1,999',
    price: '₹799',
    period: '/mo',
    tag: 'Best to start',
    tc: 'tb',
    features: ['50 AI Credits/month', 'Script & Hook Generator', 'Basic Trend Scanner', '5 Competitor analyses', 'Standard exports', 'Email support'],
    locked: ['Viral Engine', 'Brand Builder', 'Faceless AI', 'Advanced Analytics'],
    cta: '/signup?plan=starter',
    ctaLabel: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Creator Pro',
    old: '₹3,999',
    price: '₹1,799',
    period: '/mo',
    tag: 'Most Popular',
    tc: 'tv',
    features: ['Unlimited AI Credits', 'All AI Tools Unlocked', 'Viral Engine + Scores', 'Brand Builder AI', 'Faceless Channel AI', 'Competitor Intelligence', 'Advanced Analytics', 'HD exports (no watermark)', 'Priority support'],
    locked: [],
    cta: '/signup?plan=pro',
    ctaLabel: 'Get Creator Pro →',
    highlight: true,
  },
  {
    name: 'Studio',
    old: '₹9,999',
    price: '₹4,499',
    period: '/mo',
    tag: 'Agency Power',
    tc: 'tc',
    features: ['Everything in Creator Pro', 'AI Copilot (24/7)', '5-seat team workspace', 'White-label exports', 'API access', 'Dedicated success manager', 'Custom brand kits', 'Bulk content generation'],
    locked: [],
    cta: '/signup?plan=studio',
    ctaLabel: 'Get Studio →',
    highlight: false,
  },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', handle: '@priyacreates', avatar: 'PS', niche: 'Finance Creator', growth: '+820K followers in 4 months', quote: 'CREOVA changed my life. I went from 2K to 820K subs using the Faceless AI + Trend Intel combo. Nothing else comes close.' },
  { name: 'Rahul Verma', handle: '@rahultech', avatar: 'RV', niche: 'Tech Reviewer', growth: '+1.2M views first month', quote: 'The Viral Engine predicted my video would hit 1M views. It hit 1.4M. The AI recommendations are genuinely insane.' },
  { name: 'Sneha Kapoor', handle: '@snehalifestyle', avatar: 'SK', niche: 'Lifestyle Creator', growth: '₹4.2L revenue in 60 days', quote: 'Brand Builder gave me a complete creator identity in 10 minutes. My sponsorship rates tripled because I looked so professional.' },
  { name: 'Arjun Mehta', handle: '@arjunedits', avatar: 'AM', niche: 'Video Editor', growth: '15 clients in 30 days', quote: 'I built an agency using CREOVA. The Competitor AI alone is worth 10× the price. I know exactly what every big creator is doing.' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [countdown, setCountdown] = useState({ h: 11, m: 47, s: 23 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        let { h, m, s } = c
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: scrolled ? 56 : 68,
        background: scrolled ? 'rgba(5,8,22,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all .35s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: 14, boxShadow: '0 0 20px rgba(124,58,237,.55)' }}>C</div>
            <span className="syne" style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>CREOVA</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(124,58,237,.2)', color: '#b47fff', border: '1px solid rgba(124,58,237,.3)', fontWeight: 700 }}>v3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
            {['#features', '#pricing', '#testimonials'].map((h, i) => (
              <a key={h} href={h} style={{ fontSize: 14, color: 'var(--text2)', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text2)'}
              >{['Features', 'Pricing', 'Creators'][i]}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" className="btn btn-g" style={{ fontSize: 13 }}>Sign in</Link>
            <Link href="/signup" className="btn btn-p" style={{ fontSize: 13 }}>Start Free →</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Aurora background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '15%', left: '20%', width: 700, height: 700,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
            transform: `translate(${(mousePos.x - 640) * 0.02}px, ${(mousePos.y - 400) * 0.02}px)`,
            transition: 'transform 0.8s ease',
          }} />
          <div style={{
            position: 'absolute', top: '30%', right: '15%', width: 500, height: 500,
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
            transform: `translate(${(mousePos.x - 1200) * 0.015}px, ${(mousePos.y - 350) * 0.015}px)`,
            transition: 'transform 0.9s ease',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', left: '40%', width: 400, height: 400,
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
          }} />
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.025,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Flash sale banner */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 100, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.3)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 8px rgba(249,115,22,.8)', display: 'inline-block', animation: 'pdot 1s infinite' }} />
            <span style={{ fontSize: 13, color: '#fdba74', fontWeight: 600 }}>⚡ Flash Sale — 60% OFF ends in {fmt(countdown.h)}:{fmt(countdown.m)}:{fmt(countdown.s)}</span>
          </div>

          <h1 className="syne" style={{ fontSize: 'clamp(42px,7vw,88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em' }}>
            <span style={{ color: '#fff', display: 'block' }}>The AI That Turns</span>
            <span className="gt" style={{ display: 'block' }}>Ideas Into Viral</span>
            <span style={{ color: '#fff', display: 'block' }}>Content — Instantly</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'var(--text2)', maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Stop wasting 40+ hours/week on content. CREOVA's 14 AI systems write your scripts, predict your virality, outsmart your competitors, and schedule everything — while you sleep.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 20 }}>
            <Link href="/signup" className="btn btn-p a-gp" style={{ fontSize: 15, padding: '13px 30px' }}>
              🚀 Start Creating Free — No Card Needed
            </Link>
            <a href="#features" className="btn btn-s" style={{ fontSize: 15, padding: '13px 28px' }}>
              See All 14 Features →
            </a>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 48 }}>
            ✓ No credit card required &nbsp;&nbsp; ✓ 10 free AI credits &nbsp;&nbsp; ✓ Cancel anytime
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, maxWidth: 700, margin: '0 auto', background: 'var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {STATS.map(s => (
              <div key={s.n} style={{ background: 'var(--bg2)', padding: '20px 16px', textAlign: 'center' }}>
                <div className="syne" style={{ fontSize: 28, fontWeight: 800, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── URGENCY STRIP ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(59,130,246,.15))', borderTop: '1px solid rgba(124,58,237,.25)', borderBottom: '1px solid rgba(59,130,246,.2)', padding: '14px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--text2)' }}>
          🔥 <strong style={{ color: '#fff' }}>Limited Time:</strong> Prices slashed by 60% for early adopters. &nbsp;
          <strong style={{ color: '#b47fff' }}>Starter from ₹799</strong> (was ₹1,999). &nbsp;
          <a href="#pricing" style={{ color: '#67e8f9', fontWeight: 600, textDecoration: 'none' }}>Lock in your rate before it's gone →</a>
        </span>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="tag tc" style={{ marginBottom: 16 }}>14 AI-Powered Tools</div>
          <h2 className="syne" style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Everything Your Channel Needs<br /><span className="gt">In One Unfair Advantage</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 580, margin: '0 auto' }}>
            While your competitors are using 8 different tools, you'll run everything from one AI command center — faster, smarter, cheaper.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card card-h" style={{ padding: '28px', animationDelay: `${i * 0.06}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(124,58,237,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid rgba(124,58,237,.18)' }}>{f.icon}</div>
                {f.tag && <span className={`tag ${f.tc}`}>{f.tag}</span>}
              </div>
              <div className="syne" style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.05), transparent)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="tag tv" style={{ marginBottom: 16 }}>⚡ 60% OFF — Limited Time</div>
            <h2 className="syne" style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, marginBottom: 14, letterSpacing: '-0.02em' }}>
              Invest ₹799. Earn Thousands.
            </h2>
            <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 12px' }}>
              Every plan comes with a 7-day free trial. Most creators earn back their investment in the first week.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(249,115,22,.12)', border: '1px solid rgba(249,115,22,.25)' }}>
              <span style={{ fontSize: 12, color: '#fdba74', fontWeight: 600 }}>🔒 Secured by Razorpay · 256-bit SSL encrypted</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 24, alignItems: 'center' }}>
            {PLANS.map((plan, i) => (
              <div key={plan.name} style={{
                background: 'var(--bg2)', borderRadius: 20, padding: '32px',
                border: plan.highlight ? '1px solid rgba(124,58,237,.5)' : '1px solid var(--border)',
                boxShadow: plan.highlight ? '0 0 40px rgba(124,58,237,.2), 0 0 80px rgba(124,58,237,.08)' : 'none',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad2)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 18px', borderRadius: 100, whiteSpace: 'nowrap', boxShadow: '0 0 16px rgba(124,58,237,.5)' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span className={`tag ${plan.tc}`}>{plan.tag}</span>
                </div>
                <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '10px 0 4px' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: 'Syne' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--text3)' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <span style={{ fontSize: 14, color: 'var(--text3)', textDecoration: 'line-through' }}>{plan.old}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,.25)', fontWeight: 700 }}>60% OFF</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
                      <span style={{ color: '#34d399', flexShrink: 0, fontSize: 16 }}>✓</span>{f}
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text4)' }}>
                      <span style={{ flexShrink: 0 }}>✕</span>{f}
                    </div>
                  ))}
                </div>
                <Link href={plan.cta} className={`btn ${plan.highlight ? 'btn-p a-gp' : 'btn-s'}`} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                  {plan.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '100px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="tag tg" style={{ marginBottom: 16 }}>Real Results</div>
          <h2 className="syne" style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Creators Are <span className="gt">Winning With CREOVA</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.handle} · {t.niche}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, background: 'rgba(16,185,129,.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,.2)', marginBottom: 14, display: 'inline-block', fontWeight: 600 }}>
                📈 {t.growth}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
                {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 14 }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '64px 40px', position: 'relative', overflow: 'hidden', background: 'var(--bg2)', border: '1px solid rgba(124,58,237,.3)', boxShadow: '0 0 60px rgba(124,58,237,.15)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="tag tp" style={{ marginBottom: 20 }}>🚀 Your Creator Empire Starts Now</div>
            <h2 className="syne" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: '-0.02em' }}>
              Stop Watching Others Go Viral.<br /><span className="gt">It's Your Turn.</span>
            </h2>
            <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.65 }}>
              Join 50,000+ creators already using CREOVA to dominate their niche. First 10 credits are free. No card. No risk. Just results.
            </p>
            <Link href="/signup" className="btn btn-p a-gp" style={{ fontSize: 16, padding: '15px 40px' }}>
              Create Your Free Account → 
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 16 }}>⚡ Takes 30 seconds · 60% OFF for the next {fmt(countdown.h)}:{fmt(countdown.m)}:{fmt(countdown.s)}</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--grad2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Syne', fontWeight: 900, fontSize: 12 }}>C</div>
            <span className="syne" style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>CREOVA</span>
            <span style={{ color: 'var(--text3)', fontSize: 12 }}>© 2025 · AI Creator Operating System</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Privacy','/privacy'],['Terms','/terms'],['Dashboard','/dashboard'],['Login','/login']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
