"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowRight, Zap, TrendingUp, Mic, Video, BarChart3,
  Play, Check, ChevronRight, Sparkles, Globe,
  Users, Star, Shield, Cpu, Hash, Layers,
  Clock, Target, Flame, Eye, MousePointer
} from "lucide-react";

/* ── DESIGN TOKENS ─────────────────────────────────────────────────── */
const brand = {
  primary: "#6E42F5",
  light: "#8B62FF",
  teal: "#0DCCB5",
  rose: "#F5426E",
  amber: "#F5A623",
  sky: "#42B4F5",
};

/* ── NAVBAR ─────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Product", "Pricing", "Creators", "Docs"];

  return (
    <motion.header
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled && "border-b border-white/[0.06] bg-canvas/85 backdrop-blur-2xl"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center shadow-brand-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-[17px] tracking-tight">
            <span className="text-gradient-brand">Viral</span>
            <span className="text-ink-DEFAULT">Forge</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href="#" className="text-[13px] font-medium text-ink-secondary hover:text-ink-DEFAULT transition-colors duration-200">
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden md:block text-[13px] font-medium text-ink-secondary hover:text-ink-DEFAULT transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-brand text-white text-[13px] font-semibold rounded-xl shadow-brand-sm hover:shadow-brand-md transition-shadow duration-200"
            >
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ── ANIMATED GRID BACKGROUND ────────────────────────────────────────── */
function GridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid opacity-100" />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand/8 rounded-full blur-[120px]" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-accent-teal/6 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-accent-rose/5 rounded-full blur-[100px]" />
      {/* Fade edges */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
    </div>
  );
}

/* ── LIVE DEMO TERMINAL ─────────────────────────────────────────────── */
function LiveDemoTerminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const inputText = "viral kids balloon animation";
  const pipeline = [
    { icon: "🎯", label: "Analyzing viral potential…", color: brand.primary, done: false },
    { icon: "✍️", label: "Script generated with 3 hooks", color: brand.sky, done: false },
    { icon: "🎙️", label: "Voiceover: Kids Friendly • EN", color: brand.teal, done: false },
    { icon: "🎬", label: "3 scenes queued for generation", color: brand.amber, done: false },
    { icon: "✂️", label: "Auto-edit + captions applied", color: brand.rose, done: false },
    { icon: "🚀", label: "Ready to publish · Viral Score 91", color: brand.teal, done: false },
  ];

  useEffect(() => {
    // Type the input
    let i = 0;
    const t = setInterval(() => {
      setTyped(inputText.slice(0, ++i));
      if (i >= inputText.length) {
        clearInterval(t);
        setTimeout(() => setShowOutput(true), 400);
        setTimeout(() => runPipeline(), 800);
      }
    }, 55);
    return () => clearInterval(t);
  }, []);

  function runPipeline() {
    let s = 0;
    const iv = setInterval(() => {
      setStep(++s);
      if (s >= pipeline.length) clearInterval(iv);
    }, 750);
  }

  return (
    <div className="relative">
      {/* Glow behind */}
      <div className="absolute -inset-8 bg-brand/8 rounded-3xl blur-2xl" />
      <div className="relative bg-canvas-100 border border-surface-border-strong rounded-2xl overflow-hidden shadow-surface-lg">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-border bg-canvas-200">
          {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
          <div className="flex-1 mx-4 h-6 bg-canvas-300 rounded-md flex items-center px-3">
            <span className="text-[11px] text-ink-tertiary font-mono">viralforge.ai/create</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Input */}
          <div>
            <p className="text-[11px] text-ink-tertiary font-mono mb-2 uppercase tracking-widest">Your idea</p>
            <div className="flex items-center gap-3 bg-canvas-200 border border-surface-border rounded-xl px-4 py-3">
              <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
              <span className="text-sm text-ink-DEFAULT font-mono">
                {typed}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-brand ml-0.5 align-middle"
                />
              </span>
            </div>
          </div>

          {/* Pipeline steps */}
          <AnimatePresence>
            {showOutput && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <p className="text-[11px] text-ink-tertiary font-mono uppercase tracking-widest mb-3">AI Pipeline</p>
                {pipeline.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: i < step ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-500",
                      i < step
                        ? "bg-surface-DEFAULT border-surface-border"
                        : "bg-transparent border-transparent"
                    )}
                  >
                    <span className="text-base">{i < step - 1 ? "✓" : p.icon}</span>
                    <span className={i < step ? "text-ink-DEFAULT" : "text-ink-tertiary"}>
                      {p.label}
                    </span>
                    {i === step - 1 && i < pipeline.length - 1 && (
                      <div className="ml-auto w-3 h-3 rounded-full border border-brand border-t-transparent animate-spin" />
                    )}
                    {i === pipeline.length - 1 && step >= pipeline.length && (
                      <Link href="/sign-up" className="ml-auto">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs font-semibold text-accent-teal flex items-center gap-1"
                        >
                          Try yours <ArrowRight className="w-3 h-3" />
                        </motion.span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Viral score bar */}
          {step >= pipeline.length && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-accent-teal/8 border border-accent-teal/20"
            >
              <div className="flex justify-between text-xs mb-2">
                <span className="text-ink-secondary font-semibold">Viral Probability Score</span>
                <span className="text-accent-teal font-bold">91 / 100</span>
              </div>
              <div className="h-2 bg-surface-DEFAULT rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-teal to-accent-sky"
                  initial={{ width: 0 }}
                  animate={{ width: "91%" }}
                  transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
              <p className="text-[11px] text-ink-tertiary mt-2">Top 8% of kids content this week · Best upload: Sat 3–5 PM</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── HERO ────────────────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const staggerChild = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-24 pb-20 px-6 overflow-hidden">
      <GridBg />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Live badge */}
            <motion.div variants={staggerChild}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-DEFAULT border border-surface-border-strong text-xs font-semibold text-ink-secondary">
                <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse-slow" />
                Trusted by 180,000+ creators worldwide
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={staggerChild} className="space-y-2">
              <h1 className="font-display text-[3.75rem] leading-[1.04] font-extrabold tracking-tight">
                <span className="text-ink-DEFAULT">Build viral content</span>
                <br />
                <span className="text-gradient-brand">before trends</span>
                <br />
                <span className="text-ink-DEFAULT">explode.</span>
              </h1>
            </motion.div>

            {/* Sub */}
            <motion.p variants={staggerChild} className="text-lg text-ink-secondary leading-relaxed max-w-lg">
              The AI operating system for modern creators. Script → Voice → Video → Publish.
              From idea to viral content in under 10 minutes — with intelligence that learns your style.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={staggerChild} className="flex flex-wrap items-center gap-4">
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(110,66,245,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-brand text-white text-[15px] font-semibold rounded-xl shadow-brand-md transition-all duration-200"
                >
                  <Zap className="w-4 h-4" /> Start free today
                </motion.button>
              </Link>
              <button className="inline-flex items-center gap-2.5 px-5 py-3.5 text-[15px] font-medium text-ink-secondary hover:text-ink-DEFAULT border border-surface-border hover:border-surface-border-strong rounded-xl transition-all duration-200">
                <div className="w-8 h-8 rounded-full bg-surface-DEFAULT border border-surface-border flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                Watch 90s demo
              </button>
            </motion.div>

            {/* Social proof row */}
            <motion.div variants={staggerChild} className="flex items-center gap-5 pt-2">
              <div className="flex -space-x-2">
                {["VK", "SR", "MP", "AJ", "TC"].map((n, i) => (
                  <div
                    key={n}
                    className="w-8 h-8 rounded-full border-2 border-canvas bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${["#6E42F5","#0DCCB5","#F5426E","#F5A623","#42B4F5"][i]} 0%, ${["#42B4F5","#6E42F5","#F5A623","#0DCCB5","#F5426E"][i]} 100%)` }}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {Array.from({length: 5}).map((_,i) => <Star key={i} className="w-3 h-3 fill-accent-amber text-accent-amber" />)}
                  <span className="text-[11px] text-ink-secondary ml-1 font-semibold">4.9/5</span>
                </div>
                <p className="text-[11px] text-ink-tertiary">from 6,400+ creator reviews</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: live demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
          >
            <LiveDemoTerminal />
          </motion.div>
        </div>

        {/* Stats ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-0.5"
        >
          {[
            { value: "8.2B+", label: "Views driven by creators" },
            { value: "2.4M+", label: "Videos generated" },
            { value: "10 min", label: "Avg. time to first video" },
            { value: "94%", label: "Creator satisfaction" },
          ].map((s, i) => (
            <div key={s.label} className={cn(
              "text-center py-8 px-6 border border-surface-border",
              i === 0 && "rounded-l-2xl",
              i === 3 && "rounded-r-2xl",
            )}>
              <p className="font-display text-3xl font-bold text-gradient-brand mb-1">{s.value}</p>
              <p className="text-xs text-ink-tertiary">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── SECTION: ECOSYSTEM ──────────────────────────────────────────────── */
const MODULES = [
  { icon: Flame, name: "Hook Lab", desc: "10 hook types. A/B scoring. CTR prediction trained on 100M+ short-form videos.", color: brand.rose, tag: "Intelligence" },
  { icon: TrendingUp, name: "Trend Radar", desc: "Real-time scanning across TikTok, Reels, Shorts, X, and LinkedIn before trends peak.", color: brand.teal, tag: "Data" },
  { icon: Sparkles, name: "Script Engine", desc: "Retention-optimized scripts with pacing, hooks, CTAs, and scene breakdowns.", color: brand.primary, tag: "Creation" },
  { icon: Mic, name: "Voice Studio", desc: "50+ ElevenLabs voices with emotional control, cloning, and multilingual support.", color: brand.sky, tag: "Audio" },
  { icon: Video, name: "Video Generator", desc: "Text-to-video via Runway & Kling. Scene-by-scene generation with motion control.", color: brand.amber, tag: "Video" },
  { icon: Layers, name: "Repurpose Studio", desc: "One idea → TikTok, Reels, thread, newsletter, blog, LinkedIn — all at once.", color: brand.teal, tag: "Automation" },
  { icon: BarChart3, name: "Viral Analytics", desc: "Retention graphs, audience emotion scoring, CTR analysis, and viral probability.", color: brand.primary, tag: "Insights" },
  { icon: Hash, name: "AI Brand Memory", desc: "Learns your voice, pacing, and style. Improves with every piece of content.", color: brand.rose, tag: "AI" },
  { icon: Clock, name: "Content Calendar", desc: "Drag-and-drop scheduling with AI-suggested optimal posting times.", color: brand.amber, tag: "Planning" },
];

function Ecosystem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
            <span className="inline-block text-[11px] font-bold text-brand-light uppercase tracking-widest bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full mb-5">
              The Platform
            </span>
            <h2 className="font-display text-5xl font-extrabold tracking-tight mb-5">
              Not one tool.<br />
              <span className="text-gradient-brand">Nine integrated modules.</span>
            </h2>
            <p className="text-lg text-ink-secondary max-w-xl mx-auto leading-relaxed">
              ViralForge isn't an AI generator. It's a complete creator operating system — built for people who create at scale.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <div className="group relative bg-canvas-50 border border-surface-border hover:border-surface-border-strong rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 overflow-hidden h-full">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${m.color}08, transparent)` }} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}>
                      <m.icon className="w-5 h-5" style={{ color: m.color }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border"
                      style={{ color: m.color, background: `${m.color}12`, borderColor: `${m.color}20` }}>
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white transition-colors">{m.name}</h3>
                  <p className="text-sm text-ink-tertiary leading-relaxed group-hover:text-ink-secondary transition-colors">{m.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SECTION: WORKFLOW ───────────────────────────────────────────────── */
function Workflow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { n: "01", title: "Idea & Trend", desc: "Type any niche. Trend Radar shows you what's about to explode. Hook Lab generates 10 opening hooks.", icon: Target },
    { n: "02", title: "Script & Voice", desc: "Script Engine writes a retention-optimized script. Voice Studio narrates it in your style.", icon: Mic },
    { n: "03", title: "Generate & Edit", desc: "AI builds each scene. Auto-editor adds captions, transitions, and beat-sync cuts.", icon: Video },
    { n: "04", title: "Score & Optimize", desc: "Viral Intelligence scores your content across 7 dimensions and suggests precise improvements.", icon: BarChart3 },
    { n: "05", title: "Publish & Grow", desc: "Schedule across YouTube, TikTok, and Instagram at the optimal time. Analytics track everything.", icon: TrendingUp },
  ];

  return (
    <section ref={ref} className="relative py-32 px-6 border-y border-surface-border overflow-hidden">
      <div className="absolute inset-0 bg-dot opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/5 rounded-full blur-[80px]" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center mb-20"
        >
          <span className="inline-block text-[11px] font-bold text-accent-teal uppercase tracking-widest bg-accent-teal/10 border border-accent-teal/20 px-3 py-1.5 rounded-full mb-5">
            The Workflow
          </span>
          <h2 className="font-display text-5xl font-extrabold tracking-tight mb-4">
            Idea to published video.<br />
            <span className="text-gradient-teal">In 10 minutes.</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[88px] top-8 bottom-8 w-px bg-gradient-to-b from-brand/50 via-accent-teal/50 to-transparent hidden lg:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-8 lg:pl-0"
              >
                {/* Step number / icon */}
                <div className="relative flex-shrink-0 z-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-canvas-200 border border-surface-border-strong flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-brand-light" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6 border-b border-surface-border last:border-0 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-brand font-bold uppercase tracking-widest">{step.n}</span>
                    <h3 className="font-display text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-ink-secondary text-[15px] leading-relaxed max-w-xl">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── SECTION: VIRAL INTELLIGENCE ─────────────────────────────────────── */
function ViralIntelligence() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const metrics = [
    { label: "Hook Strength", value: 94, color: brand.primary },
    { label: "Retention", value: 87, color: brand.teal },
    { label: "Emotional Pull", value: 91, color: brand.rose },
    { label: "Trend Alignment", value: 88, color: brand.amber },
    { label: "Thumbnail CTR", value: 82, color: brand.sky },
    { label: "Shareability", value: 89, color: brand.teal },
  ];

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="space-y-8"
          >
            <div>
              <span className="inline-block text-[11px] font-bold text-brand-light uppercase tracking-widest bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full mb-5">
                Viral Intelligence Engine
              </span>
              <h2 className="font-display text-4xl font-extrabold tracking-tight mb-5 leading-tight">
                AI that predicts virality
                <br />
                <span className="text-gradient-brand">before you publish.</span>
              </h2>
              <p className="text-[15px] text-ink-secondary leading-relaxed">
                Every piece of content you create is scored across 7 proprietary dimensions trained on 100M+ short-form videos. Know your video's potential before it goes live.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Hook strength prediction with rewrite suggestions",
                "Audience emotion arc analysis",
                "Platform-specific optimization scores",
                "Trending sound & format alignment",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-light" />
                  </div>
                  <span className="text-[15px] text-ink-secondary">{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white text-sm font-semibold rounded-xl shadow-brand-sm hover:shadow-brand-md transition-all duration-200">
                Analyze my content <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          {/* Right: score visualization */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15 }}
          >
            <div className="bg-canvas-100 border border-surface-border rounded-2xl p-8 shadow-surface-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[11px] text-ink-tertiary uppercase tracking-widest mb-1">Overall Viral Score</p>
                  <p className="font-display text-5xl font-bold text-gradient-brand">89</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-teal/10 border border-accent-teal/20 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                    <span className="text-xs font-semibold text-accent-teal">Top 11% this week</span>
                  </div>
                  <p className="text-[11px] text-ink-tertiary mt-2">Best post: Sat 3–5 PM</p>
                </div>
              </div>

              {/* Metric bars */}
              <div className="space-y-4">
                {metrics.map((m, i) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-ink-secondary font-medium">{m.label}</span>
                      <span className="font-bold" style={{ color: m.color }}>{m.value}</span>
                    </div>
                    <div className="h-2 bg-surface-DEFAULT rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${m.value}%` } : {}}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom suggestion */}
              <div className="mt-6 p-4 bg-brand/8 border border-brand/20 rounded-xl">
                <p className="text-xs text-brand-light font-semibold mb-1">💡 AI Suggestion</p>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Strengthen the 3s hook — replace "What if…" with a direct shock statement to push score to 94+.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── SECTION: TESTIMONIALS ───────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Aisha Patel", handle: "@aishacreates", role: "Kids Animation Channel", avatar: "AP", plan: "Pro", quote: "I went from 2K to 280K subscribers in 4 months using ViralForge. The Hook Lab alone changed how I approach every video.", views: "12M views/mo", color: brand.primary },
  { name: "Marcus Thompson", handle: "@marcusbuilds", role: "Finance Creator", avatar: "MT", plan: "Agency", quote: "Managing 6 client channels. The Repurpose Studio saves us 30+ hours/week. ROI is insane — we 4x'd client revenue.", views: "48M views/mo", color: brand.teal },
  { name: "Yuki Tanaka", handle: "@yukishorts", role: "Education Creator", avatar: "YT", plan: "Pro", quote: "The Viral Intelligence score is genuinely predictive. My last 8 videos all hit 1M+ views after following its recommendations.", views: "8.4M views/mo", color: brand.rose },
];

function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-32 px-6 border-y border-surface-border bg-canvas-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold text-accent-amber uppercase tracking-widest bg-accent-amber/10 border border-accent-amber/20 px-3 py-1.5 rounded-full mb-5">
            Creator Stories
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-tight">
            Creators using ViralForge
            <br />
            <span className="text-gradient-warm">are building media companies.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="relative bg-canvas-100 border border-surface-border rounded-2xl p-7 group hover:border-surface-border-strong transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({length: 5}).map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" />)}
              </div>
              <p className="text-[15px] text-ink-secondary leading-relaxed mb-7">"{t.quote}"</p>

              <div className="flex items-center justify-between pt-5 border-t border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${brand.sky})` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-ink-tertiary">{t.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-accent-teal">{t.views}</p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-md">
                    <span className="text-[9px] font-bold text-brand-light uppercase">{t.plan}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SECTION: PRICING ───────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Free", price: 0, desc: "Start exploring", color: "#4A4A64",
    features: ["3 videos/day", "720p export", "Basic script AI", "5 voice presets", "Watermarked"],
    cta: "Get started", highlight: false,
  },
  {
    name: "Starter", price: 19, desc: "For serious creators", color: brand.sky,
    features: ["10 videos/day", "1080p export", "Advanced scripts", "25 voice presets", "No watermark", "Trend Radar"],
    cta: "Start Starter", highlight: false,
  },
  {
    name: "Pro", price: 49, desc: "For creators who scale", color: brand.primary, badge: "Most popular",
    features: ["Unlimited videos", "4K export", "Voice cloning", "Auto-publish", "Hook Lab", "AI Brand Memory", "Timeline editor", "Repurpose Studio"],
    cta: "Go Pro", highlight: true,
  },
  {
    name: "Agency", price: 199, desc: "For teams and agencies", color: brand.rose,
    features: ["Everything in Pro", "10 team seats", "Client dashboards", "White-label", "API access", "Custom AI training", "Dedicated support"],
    cta: "Contact us", highlight: false,
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} id="pricing" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold text-brand-light uppercase tracking-widest bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full mb-5">
            Pricing
          </span>
          <h2 className="font-display text-5xl font-extrabold tracking-tight mb-5">
            Grow faster,<br />
            <span className="text-gradient-brand">not just bigger.</span>
          </h2>
          <p className="text-ink-secondary mb-8 text-[15px]">Start free. Upgrade when you're ready to build seriously.</p>

          <div className="inline-flex items-center gap-1 p-1 bg-canvas-100 border border-surface-border rounded-xl">
            {["Monthly", "Annual"].map(b => (
              <button
                key={b}
                onClick={() => setAnnual(b === "Annual")}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  (b === "Annual") === annual ? "bg-brand text-white shadow-brand-sm" : "text-ink-tertiary hover:text-ink-DEFAULT"
                )}
              >
                {b}
                {b === "Annual" && (
                  <span className="ml-2 text-[10px] bg-accent-teal text-canvas font-bold px-1.5 py-0.5 rounded-full">
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => {
            const price = plan.price === 0 ? 0 : annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.07 }}
                className="relative"
              >
                {plan.badge && (
                  <div className="absolute -top-3 inset-x-4 flex justify-center">
                    <span className="px-3 py-1 bg-brand text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className={cn(
                  "h-full flex flex-col bg-canvas-100 border rounded-2xl p-7 transition-all duration-300",
                  plan.highlight
                    ? "border-brand/40 shadow-brand-sm"
                    : "border-surface-border hover:border-surface-border-strong"
                )}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: plan.color }}>{plan.name}</p>
                  <p className="text-xs text-ink-tertiary mb-4">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold">
                      {plan.price === 0 ? "Free" : `$${price}`}
                    </span>
                    {plan.price > 0 && <span className="text-ink-tertiary text-sm ml-1">/mo</span>}
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                        <Check className="w-3.5 h-3.5 text-accent-teal flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/sign-up">
                    <button
                      className={cn(
                        "w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                        plan.highlight
                          ? "bg-brand text-white shadow-brand-sm hover:shadow-brand-md"
                          : "bg-surface-DEFAULT border border-surface-border text-ink-secondary hover:text-ink-DEFAULT hover:border-surface-border-strong"
                      )}
                      style={!plan.highlight ? { color: plan.color, borderColor: `${plan.color}30` } : undefined}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── SECTION: FINAL CTA ──────────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-40 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="relative max-w-3xl mx-auto text-center"
      >
        <p className="text-[11px] font-bold text-brand-light uppercase tracking-widest mb-6">Ready to start?</p>
        <h2 className="font-display text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          This is where creators<br />
          <span className="text-gradient-brand">build their future.</span>
        </h2>
        <p className="text-lg text-ink-secondary mb-12 leading-relaxed max-w-xl mx-auto">
          Join 180,000+ creators who stopped waiting for trends and started building them — with AI that actually understands content.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 60px rgba(110,66,245,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-9 py-4 bg-brand text-white text-[16px] font-semibold rounded-xl shadow-brand-md"
            >
              <Zap className="w-5 h-5" /> Start building for free
            </motion.button>
          </Link>
          <button className="inline-flex items-center gap-2.5 px-7 py-4 text-[16px] font-medium text-ink-secondary hover:text-ink-DEFAULT border border-surface-border hover:border-surface-border-strong rounded-xl transition-all duration-200">
            Book a demo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-5 text-xs text-ink-tertiary">No credit card. 3 free videos/day. Cancel anytime.</p>
      </motion.div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { title: "Product", links: ["Hook Lab", "Trend Radar", "Script Engine", "Voice Studio", "Viral Intelligence", "Repurpose Studio"] },
    { title: "Resources", links: ["Documentation", "Changelog", "Roadmap", "Creator Blog", "Case Studies", "Status"] },
    { title: "Company", links: ["About", "Careers", "Press", "Investors", "Affiliate Program", "Community"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Settings", "GDPR", "Security"] },
  ];

  return (
    <footer className="border-t border-surface-border bg-canvas-50/60 px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-[17px]">
                <span className="text-gradient-brand">Viral</span>Forge
              </span>
            </div>
            <p className="text-sm text-ink-tertiary leading-relaxed">
              The AI operating system for creators who build at scale.
            </p>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <p className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-ink-tertiary hover:text-ink-DEFAULT transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-surface-border">
          <p className="text-xs text-ink-disabled">© 2025 ViralForge AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {["Twitter", "LinkedIn", "Discord", "YouTube"].map(s => (
              <a key={s} href="#" className="text-xs text-ink-tertiary hover:text-ink-DEFAULT transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── PAGE ────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="bg-canvas min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Ecosystem />
      <Workflow />
      <ViralIntelligence />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
