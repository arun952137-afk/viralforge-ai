"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip
} from "recharts";
import {
  Zap, TrendingUp, Eye, Clock, Flame, ArrowRight,
  Video, Mic, FileText, RefreshCw, Play, BarChart3,
  Target, Sparkles, Star
} from "lucide-react";
import { StatCard, Card, Badge, Button, Progress, Skeleton, ScoreRing } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ── CHART DATA ──────────────────────────────────────────────────────── */
function generateData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const base = 8000 + i * 400 + Math.random() * 4000;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(base),
      likes: Math.floor(base * 0.07),
    };
  });
}

const CHART_DATA = generateData(14);

/* ── CUSTOM TOOLTIP ──────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-canvas-200 border border-surface-border rounded-xl p-3 shadow-surface-md text-xs">
      <p className="text-ink-tertiary mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-ink-DEFAULT">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── RECENT VIDEOS ───────────────────────────────────────────────────── */
const RECENT = [
  { title: "Balloon Adventure Episode 3", platform: "YouTube Shorts", status: "PUBLISHED", views: 421000, score: 92 },
  { title: "Magic Garden 3D Rhyme", platform: "TikTok", status: "PUBLISHED", views: 183000, score: 85 },
  { title: "Cloud Kingdom Part 1", platform: "Instagram Reels", status: "RENDERING", views: 0, score: 88 },
  { title: "Rainbow Bus Adventure", platform: "YouTube Shorts", status: "DRAFT", views: 0, score: null },
];

const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  PUBLISHED: { label: "Published", variant: "success" },
  RENDERING: { label: "Rendering…", variant: "warning" },
  DRAFT: { label: "Draft", variant: "default" },
};

/* ── QUICK ACTIONS ───────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Create Video", desc: "Full AI pipeline", icon: Zap, href: "/dashboard/create", from: "#6E42F5", to: "#42B4F5" },
  { label: "Write Script", desc: "Hook + scenes + CTA", icon: FileText, href: "/dashboard/scripts", from: "#0DCCB5", to: "#42B4F5" },
  { label: "Find Trends", desc: "What's spiking now", icon: TrendingUp, href: "/dashboard/trends", from: "#F5426E", to: "#F5A623" },
  { label: "Analytics", desc: "Views, CTR, retention", icon: BarChart3, href: "/dashboard/analytics", from: "#F5A623", to: "#6E42F5" },
];

/* ── INSIGHTS ────────────────────────────────────────────────────────── */
const INSIGHTS = [
  { icon: "🔥", title: "Best time to post", desc: "Saturday 3–5 PM gives you 43% more initial views in your niche.", action: "Schedule now" },
  { icon: "💡", title: "Hook opportunity", desc: "\"AI reveals the truth about…\" format is up 340% this week.", action: "Use this hook" },
  { icon: "📈", title: "Channel momentum", desc: "Your retention rate improved 8.2% this month. Keep the 30s hook structure.", action: "See breakdown" },
];

/* ── PAGE ────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
    item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight mb-1">
            Good morning ☀️
          </h2>
          <p className="text-ink-secondary text-sm">Your creator workspace is ready. Here's what matters today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-tertiary hover:text-ink-DEFAULT hover:bg-surface-DEFAULT transition-colors border border-surface-border">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/dashboard/create">
            <Button icon={<Zap className="w-4 h-4" />} glow>Create Video</Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger.container}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading
          ? Array.from({length: 4}).map((_,i) => <Skeleton key={i} className="h-28" />)
          : [
            { label: "Total Views", value: "8.2M", delta: { value: 24, label: "this week" }, icon: <Eye className="w-4 h-4" />, variant: "brand" as const },
            { label: "Videos Made", value: "247", delta: { value: 12, label: "this month" }, icon: <Video className="w-4 h-4" />, variant: "teal" as const },
            { label: "Avg Retention", value: "78%", delta: { value: 5.2, label: "improvement" }, icon: <Clock className="w-4 h-4" />, variant: "amber" as const },
            { label: "Viral Score", value: "87", delta: { value: 3, label: "vs last week" }, icon: <Flame className="w-4 h-4" />, variant: "rose" as const },
          ].map((s, i) => (
            <motion.div key={s.label} variants={stagger.item}>
              <StatCard {...s} />
            </motion.div>
          ))
        }
      </motion.div>

      {/* Quick Actions */}
      <div>
        <p className="text-[11px] font-bold text-ink-tertiary uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link href={a.href}>
                <div className="group relative bg-canvas-50 border border-surface-border rounded-2xl p-5 cursor-pointer hover:border-surface-border-strong hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${a.from}08, transparent)` }} />
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${a.from}20, ${a.to}15)`, border: `1px solid ${a.from}25` }}>
                      <a.icon className="w-4 h-4" style={{ color: a.from }} />
                    </div>
                    <p className="text-sm font-semibold mb-0.5">{a.label}</p>
                    <p className="text-[11px] text-ink-tertiary">{a.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views chart */}
        <div className="lg:col-span-2">
          <Card className="p-6" padding={false}>
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-bold text-base">Views — Last 14 Days</h3>
                  <p className="text-xs text-ink-tertiary mt-0.5">Across all platforms</p>
                </div>
                <div className="flex gap-3 text-xs">
                  {[{ label: "Views", color: "#6E42F5" }, { label: "Likes", color: "#0DCCB5" }].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-ink-tertiary">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-2">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={CHART_DATA} margin={{ top: 5, right: 16, bottom: 0, left: 0 }}>
                  <defs>
                    {[{id:"views",c:"#6E42F5"},{id:"likes",c:"#0DCCB5"}].map(({id,c})=>(
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#4A4A64", fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: "#4A4A64", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#6E42F5" strokeWidth={2} fill="url(#views)" />
                  <Area type="monotone" dataKey="likes" name="Likes" stroke="#0DCCB5" strokeWidth={2} fill="url(#likes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Viral Score Breakdown */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm">Viral Intelligence</h3>
              <Badge variant="brand">Live</Badge>
            </div>
            <div className="flex justify-around mb-4">
              <ScoreRing value={92} label="Hook" size={64} />
              <ScoreRing value={87} label="Retention" size={64} />
              <ScoreRing value={89} label="Overall" size={64} />
            </div>
            <div className="p-3 bg-brand/6 border border-brand/15 rounded-xl">
              <p className="text-[11px] text-brand-light font-semibold mb-1">💡 AI Insight</p>
              <p className="text-xs text-ink-tertiary leading-relaxed">Strengthen your 3s hook to push overall score above 94.</p>
            </div>
          </Card>

          {/* AI Insights */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <h3 className="font-display font-bold text-sm">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {INSIGHTS.map((ins, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface-DEFAULT hover:bg-surface-hover transition-colors cursor-pointer group">
                  <span className="text-lg flex-shrink-0">{ins.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold mb-0.5">{ins.title}</p>
                    <p className="text-[11px] text-ink-tertiary leading-relaxed mb-1.5">{ins.desc}</p>
                    <span className="text-[10px] text-brand-light font-semibold group-hover:underline">{ins.action} →</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Videos */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="font-display font-bold text-base">Recent Videos</h3>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>View all</Button>
          </Link>
        </div>
        <div>
          {RECENT.map((v, i) => (
            <div
              key={v.title}
              className={cn(
                "flex items-center gap-4 px-6 py-4 hover:bg-surface-DEFAULT transition-colors",
                i < RECENT.length - 1 && "border-b border-surface-border"
              )}
            >
              {/* Thumbnail placeholder */}
              <div className="w-14 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(110,66,245,0.2), rgba(66,180,245,0.15))" }}>
                <Play className="w-3.5 h-3.5 text-brand-light" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{v.title}</p>
                <p className="text-xs text-ink-tertiary">{v.platform}</p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {v.views > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent-teal">{formatNumber(v.views)}</p>
                    <p className="text-[10px] text-ink-tertiary">views</p>
                  </div>
                )}
                {v.score && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      color: v.score >= 90 ? "#0DCCB5" : v.score >= 75 ? "#6E42F5" : "#F5A623",
                      background: v.score >= 90 ? "#0DCCB515" : v.score >= 75 ? "#6E42F515" : "#F5A62315",
                      border: `1px solid ${v.score >= 90 ? "#0DCCB525" : v.score >= 75 ? "#6E42F525" : "#F5A62325"}`,
                    }}>
                    {v.score}
                  </div>
                )}
                <Badge variant={STATUS_BADGE[v.status]?.variant}>{STATUS_BADGE[v.status]?.label}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
