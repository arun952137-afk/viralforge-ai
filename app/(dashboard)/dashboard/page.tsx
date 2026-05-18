"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import {
  Sparkles, TrendingUp, Zap, ArrowRight, Plus, Flame,
  Eye, Clock, Share2, BarChart3, Mic, Layers, Video,
  Target, Hash, CheckCircle, Calendar, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion as m } from "framer-motion";
import { Card, Button, Badge, ScoreRing, StatCard } from "@/components/ui";
import { formatNumber, cn } from "@/lib/utils";

/* ── DATA ─────────────────────────────────────────────────────────── */
const genSparkline = (n: number, base: number) =>
  Array.from({ length: n }, (_, i) => ({
    d: i, v: Math.floor(base + i * 120 + Math.sin(i * 0.9) * 800 + Math.random() * 600),
  }));

const SPARKLINE = genSparkline(14, 4000);

const QUICK_ACTIONS = [
  { label: "Write Script", icon: Sparkles, href: "/dashboard/scripts", color: "#6E42F5", desc: "AI viral script in 30s" },
  { label: "Scan Trends", icon: TrendingUp, href: "/dashboard/trends", color: "#F5426E", desc: "Live trend radar" },
  { label: "Repurpose", icon: Layers, href: "/dashboard/repurpose", color: "#0DCCB5", desc: "1 post → 10 formats" },
  { label: "Schedule", icon: Calendar, href: "/dashboard/calendar", color: "#F5A623", desc: "Optimal time posting" },
  { label: "Voice Studio", icon: Mic, href: "/dashboard/voice", color: "#42B4F5", desc: "AI voiceover" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", color: "#8B62FF", desc: "Bloomberg terminal" },
];

const RECENT_VIDEOS = [
  { title: "Balloon Adventure Ep.3", platform: "YouTube Shorts", views: 421000, score: 92, delta: "+31%" },
  { title: "Rainbow Bus Rhyme 3D", platform: "TikTok", views: 183000, score: 85, delta: "+18%" },
  { title: "Magic Garden Ep.4", platform: "Reels", views: 98000, score: 78, delta: "+9%" },
];

const LIVE_INSIGHTS = [
  { icon: "🔥", text: "Sat 3–5 PM = +43% reach. Next slot in 2d 4h.", action: "Schedule Now", href: "/dashboard/calendar", color: "#F5A623" },
  { icon: "🎯", text: '"What if…" hook drove 82% 3s retention vs 61% avg.', action: "Use in Hook Lab", href: "/dashboard/scripts", color: "#6E42F5" },
  { icon: "📈", text: "3D animation niches up +340% this week on Shorts.", action: "See Trends", href: "/dashboard/trends", color: "#0DCCB5" },
];

const AI_TASKS = [
  { label: "Analyze last 5 videos for hook patterns", done: true },
  { label: "Generate 10 hooks for your next Balloon ep.", done: true },
  { label: "Detect best posting windows", done: true },
  { label: "Optimize captions for 9:16 reformat", done: false, active: true },
  { label: "Predict viral score for Magic Garden Ep.5", done: false },
];

/* ── LIVE COUNTER ─────────────────────────────────────────────────── */
function LiveCounter({ value, color }: { value: string; color: string }) {
  const [disp, setDisp] = useState(value);
  useEffect(() => {
    const t = setInterval(() => {
      setDisp(prev => {
        const n = parseInt(prev.replace(/,/g, "")) + Math.floor(Math.random() * 18) - 4;
        return n > 0 ? n.toLocaleString() : prev;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);
  return <span style={{ color }} className="font-display text-3xl font-extrabold">{disp}</span>;
}

/* ── TYPING EFFECT ────────────────────────────────────────────────── */
function TypingText({ texts }: { texts: string[] }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    const target = texts[i % texts.length];
    if (typing) {
      if (text.length < target.length) {
        const t = setTimeout(() => setText(target.slice(0, text.length + 1)), 55);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 30);
        return () => clearTimeout(t);
      } else {
        setI(n => n + 1);
        setTyping(true);
      }
    }
  }, [text, typing, i, texts]);
  return (
    <span className="text-[#6E42F5]">
      {text}<span className="animate-pulse ml-0.5 border-r-2 border-[#6E42F5]" />
    </span>
  );
}

/* ── TOOLTIP ─────────────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0E0E1A] border border-white/10 rounded-xl p-2.5 text-xs backdrop-blur-xl shadow-xl">
      <p className="text-[#8B8BA8] mb-1">Day {label}</p>
      <p className="font-bold text-[#6E42F5]">{formatNumber(payload[0].value)} views</p>
    </div>
  );
};

/* ── PAGE ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const [credits] = useState(287);
  const [creditsPct] = useState(287 / 300);
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setInsightIdx(i => (i + 1) % LIVE_INSIGHTS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const insight = LIVE_INSIGHTS[insightIdx];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── GREETING HERO ── */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/[0.06]" style={{ background: "linear-gradient(135deg,rgba(110,66,245,0.15) 0%,rgba(7,7,15,0.9) 50%,rgba(13,204,181,0.08) 100%)" }}>
        {/* Background orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#6E42F5,transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[#8B8BA8] text-sm mb-1">{greeting}, {user?.firstName ?? "Creator"} 👋</p>
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
              Ready to{" "}
              <TypingText texts={["go viral today?", "dominate Shorts?", "10× your reach?", "crush the algorithm?"]} />
            </h1>
            <p className="text-[#8B8BA8] text-sm max-w-lg">Your AI is actively scanning trends, analyzing your audience, and preparing your next viral opportunity.</p>
          </div>

          <div className="flex flex-col items-end gap-4">
            {/* Credits widget */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 min-w-[180px]">
              <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-1">AI Credits</p>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl font-bold text-[#0DCCB5]">{credits}</span>
                <span className="text-xs text-[#4A4A64]">/ 300</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6E42F5] to-[#0DCCB5]" initial={{ width: 0 }} animate={{ width: `${creditsPct * 100}%` }} transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }} />
              </div>
              <p className="text-[10px] text-[#4A4A64] mt-1.5">Resets in 13 days</p>
            </div>

            <Link href="/dashboard/create">
              <Button glow size="lg" icon={<Plus className="w-5 h-5" />}>Create New Video</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── LIVE INSIGHT BANNER ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={insightIdx}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="flex items-center justify-between p-4 rounded-2xl border"
          style={{ background: `${insight.color}08`, borderColor: `${insight.color}25` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{insight.icon}</span>
            <div>
              <p className="text-xs text-[#4A4A64] font-semibold uppercase tracking-widest mb-0.5">AI Insight</p>
              <p className="text-sm text-[#8B8BA8]">{insight.text}</p>
            </div>
          </div>
          <Link href={insight.href}>
            <Button size="sm" style={{ background: insight.color }} className="text-white hover:opacity-90 shrink-0" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              {insight.action}
            </Button>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-2">Total Views</p>
          <LiveCounter value="8,241,000" color="#6E42F5" />
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3 text-[#0DCCB5]" />
            <span className="text-xs text-[#0DCCB5] font-semibold">+22% this month</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-2">Avg Viral Score</p>
          <span className="font-display text-3xl font-extrabold text-[#F5A623]">87.4</span>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3 text-[#0DCCB5]" />
            <span className="text-xs text-[#0DCCB5] font-semibold">+3.8 pts</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-2">Avg Retention</p>
          <span className="font-display text-3xl font-extrabold text-[#0DCCB5]">78.4%</span>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3 text-[#0DCCB5]" />
            <span className="text-xs text-[#0DCCB5] font-semibold">+5.2%</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-2">New Followers</p>
          <LiveCounter value="12,400" color="#F5426E" />
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="w-3 h-3 text-[#0DCCB5]" />
            <span className="text-xs text-[#0DCCB5] font-semibold">+18%</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── MAIN: chart + recent + quick actions ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Performance chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-base">Views — Last 14 Days</h3>
                <p className="text-xs text-[#4A4A64] mt-0.5">Across all platforms combined</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0DCCB5]/10 border border-[#0DCCB5]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0DCCB5] animate-pulse" />
                <span className="text-[10px] font-bold text-[#0DCCB5] uppercase tracking-widest">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SPARKLINE} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6E42F5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6E42F5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "#4A4A64", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `D${v + 1}`} />
                <YAxis tick={{ fill: "#4A4A64", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="v" stroke="#6E42F5" strokeWidth={2} fill="url(#dg)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick actions */}
          <div>
            <h3 className="font-display font-bold text-sm mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action, i) => (
                <Link href={action.href} key={action.label}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="p-4 rounded-2xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.14] transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${action.color}18` }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <p className="text-sm font-semibold mb-0.5">{action.label}</p>
                    <p className="text-[10px] text-[#4A4A64]">{action.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent videos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm">Recent Performance</h3>
              <Link href="/dashboard/analytics" className="text-xs text-[#6E42F5] font-semibold hover:text-[#8B62FF] flex items-center gap-1">All videos <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-2">
              {RECENT_VIDEOS.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.10] transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#6E42F5]/12 flex items-center justify-center text-[#6E42F5] font-bold text-sm flex-shrink-0">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{v.title}</p>
                    <p className="text-xs text-[#4A4A64]">{v.platform}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div>
                      <p className="text-sm font-bold text-[#0DCCB5]">{formatNumber(v.views)}</p>
                      <p className="text-[10px] text-[#4A4A64]">views</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#F5A623]">{v.delta}</p>
                      <p className="text-[10px] text-[#4A4A64]">growth</p>
                    </div>
                    <ScoreRing value={v.score} size={44} label="" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SIDEBAR: AI agent + trending ── */}
        <div className="space-y-5">
          {/* AI working state */}
          <Card className="p-5" style={{ background: "linear-gradient(135deg,rgba(110,66,245,0.1),rgba(7,7,15,0.95))", border: "1px solid rgba(110,66,245,0.2)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#6E42F5]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#6E42F5] animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold">ViralForge AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0DCCB5] animate-pulse" />
                  <span className="text-[10px] text-[#0DCCB5]">Working for you</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {AI_TASKS.map((task, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {task.done ? (
                    <CheckCircle className="w-4 h-4 text-[#0DCCB5] flex-shrink-0 mt-0.5" />
                  ) : task.active ? (
                    <RefreshCw className="w-4 h-4 text-[#6E42F5] flex-shrink-0 mt-0.5 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/[0.12] flex-shrink-0 mt-0.5" />
                  )}
                  <p className={cn("text-xs leading-relaxed", task.done ? "text-[#4A4A64] line-through" : task.active ? "text-white" : "text-[#8B8BA8]")}>
                    {task.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending now */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F5426E]" />
                <h3 className="font-display font-bold text-sm">Trending Now</h3>
              </div>
              <Badge variant="danger" dot>Live</Badge>
            </div>
            <div className="space-y-3">
              {[
                { topic: "AI reveals hidden truth…", velocity: "+340%", color: "#F5426E" },
                { topic: "I tried [thing] for 30 days", velocity: "+280%", color: "#F5A623" },
                { topic: "POV: only you notice this", velocity: "+190%", color: "#0DCCB5" },
                { topic: "The [profession] secret", velocity: "+156%", color: "#6E42F5" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#4A4A64]">#{i + 1}</span>
                    <p className="text-xs text-[#8B8BA8] truncate max-w-[140px]">{t.topic}</p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: t.color }}>{t.velocity}</span>
                </div>
              ))}
              <Link href="/dashboard/trends">
                <Button variant="secondary" size="sm" className="w-full mt-2" icon={<ArrowRight className="w-3.5 h-3.5" />}>Full Trend Radar</Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming posts */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm">Scheduled</h3>
              <Link href="/dashboard/calendar" className="text-xs text-[#6E42F5] font-semibold hover:text-[#8B62FF]">See all</Link>
            </div>
            <div className="space-y-2.5">
              {[
                { title: "Balloon Ep.4", platform: "YT Shorts", time: "Sat 3:00 PM", color: "#FF4444" },
                { title: "Rainbow Bus Dance", platform: "TikTok", time: "Sun 5:00 PM", color: "#00F2EA" },
                { title: "Cloud Kingdom BTS", platform: "Reels", time: "Mon 12:00 PM", color: "#E1306C" },
              ].map((post, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: post.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{post.title}</p>
                    <p className="text-[10px] text-[#4A4A64]">{post.platform}</p>
                  </div>
                  <p className="text-[10px] text-[#4A4A64] flex-shrink-0">{post.time}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Upgrade CTA */}
          <div className="p-5 rounded-2xl" style={{ background: "linear-gradient(135deg,rgba(245,66,110,0.15),rgba(110,66,245,0.15))", border: "1px solid rgba(245,66,110,0.2)" }}>
            <p className="font-display font-bold text-base mb-1">Go Studio Plan 🚀</p>
            <p className="text-xs text-[#8B8BA8] mb-4">1,000 credits/mo · Team seats · Priority rendering · Custom voice clone</p>
            <Link href="/dashboard/billing">
              <Button size="sm" className="w-full" style={{ background: "linear-gradient(135deg,#F5426E,#6E42F5)" }}>Upgrade Now — ₹4,999/mo</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
