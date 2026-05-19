"use client";

// app/(dashboard)/dashboard/growth-agent/page.tsx
// INTERNAL — Creova Growth Agent control panel
// Only visible to admin users

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Zap, TrendingUp, CheckCircle,
  XCircle, Clock, RefreshCw, Eye, Heart, Share2, Bookmark,
  Play, Pause, Settings, BarChart3, Globe, Star, AlertCircle,
  ChevronRight, Activity, Radio, Camera
} from "lucide-react";
import { Card, Badge, Button, StatCard } from "@/components/ui";
import { cn, formatNumber } from "@/lib/utils";

const AGENTS = [
  { id: "trend-hunter", name: "Trend Hunter", icon: "🔍", desc: "Scans HN, Reddit, X, PH", color: "#42B4F5" },
  { id: "strategist", name: "Strategist", icon: "🧠", desc: "Decides content strategy", color: "#6E42F5" },
  { id: "copywriter", name: "Copywriter", icon: "✍️", desc: "Writes captions & hooks", color: "#0DCCB5" },
  { id: "designer", name: "Designer", icon: "🎨", desc: "DALL-E 3 visuals", color: "#F5A623" },
  { id: "reviewer", name: "QC Reviewer", icon: "🔍", desc: "Quality gates every post", color: "#F5426E" },
  { id: "publisher", name: "Publisher", icon: "📤", desc: "Posts to X + Instagram", color: "#6E42F5" },
  { id: "analytics", name: "Analytics AI", icon: "📊", desc: "Tracks & learns from data", color: "#0DCCB5" },
  { id: "github", name: "GitHub Detector", icon: "🚀", desc: "Auto-announces features", color: "#8B62FF" },
];

const MOCK_POSTS = [
  {
    id: "1", platform: "twitter", contentType: "ai_insight",
    hook: "Most creators waste 3 hours editing content that AI could handle in 60 seconds.",
    status: "published", qualityScore: 91, postedAt: "2h ago",
    engagement: { likes: 142, shares: 38, impressions: 4200 }
  },
  {
    id: "2", platform: "instagram", contentType: "feature_showcase",
    hook: "Generate a full AI reel script in 30 seconds with Creova.",
    status: "published", qualityScore: 88, postedAt: "8h ago",
    engagement: { likes: 94, shares: 12, saves: 67, impressions: 2800 }
  },
  {
    id: "3", platform: "twitter", contentType: "meme",
    hook: "Me: 'I'll just edit one quick clip'\nAlso me 3 hours later:",
    status: "rejected", qualityScore: 62, postedAt: "14h ago",
    engagement: {}
  },
  {
    id: "4", platform: "twitter", contentType: "founder_vibe",
    hook: "Building in public: Creova just crossed 500 beta signups.",
    status: "scheduled", qualityScore: 87, postedAt: "In 2h",
    engagement: {}
  },
];

const WEEKLY_CONTENT = [
  { day: "Mon", type: "AI Insight", done: true },
  { day: "Tue", type: "Feature Showcase", done: true },
  { day: "Wed", type: "Meme", done: false, active: true },
  { day: "Thu", type: "Tutorial", done: false },
  { day: "Fri", type: "Comparison", done: false },
  { day: "Sat", type: "Carousel", done: false },
  { day: "Sun", type: "Founder Vibe", done: false },
];

function AgentStatusDot({ active }: { active?: boolean }) {
  return (
    <div className="relative flex-shrink-0">
      <div className={cn("w-2 h-2 rounded-full", active ? "bg-[#0DCCB5]" : "bg-[#4A4A64]")} />
      {active && <div className="absolute inset-0 rounded-full bg-[#0DCCB5] animate-ping opacity-60" />}
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  return platform === "twitter"
    ? <span className="text-[10px] font-black text-[#1DA1F2]">𝕏</span>
    : <Camera className="w-3.5 h-3.5 text-[#E1306C]" />;
}

export default function GrowthAgentPage() {
  const [agentRunning, setAgentRunning] = useState(true);
  const [lastPipeline, setLastPipeline] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>("copywriter");
  const [triggering, setTriggering] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "posts" | "learnings" | "settings">("overview");

  // Simulate agent activity
  useEffect(() => {
    if (!agentRunning) return;
    const agents = AGENTS.map(a => a.id);
    let i = 0;
    const t = setInterval(() => {
      setActiveAgentId(agents[i % agents.length]);
      i++;
    }, 3000);
    return () => clearInterval(t);
  }, [agentRunning]);

  async function triggerPost(platform: string) {
    setTriggering(platform);
    await new Promise(r => setTimeout(r, 2000));
    setLastPipeline(`${platform} — ${new Date().toLocaleTimeString()}`);
    setTriggering(null);
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#6E42F5]/15 border border-[#6E42F5]/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#6E42F5]" />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Growth Agent</h1>
            <Badge variant={agentRunning ? "success" : "default"} dot>
              {agentRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
          <p className="text-[#8B8BA8] text-sm">Autonomous social growth operating system — internal only</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary" size="sm"
            icon={agentRunning ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
            onClick={() => setAgentRunning(!agentRunning)}
          >
            {agentRunning ? "Pause" : "Resume"}
          </Button>
          <Button
            size="sm"
            icon={<Zap className="w-4 h-4"/>}
            loading={!!triggering}
            onClick={() => triggerPost("twitter")}
          >
            {triggering ? "Posting…" : "Post Now"}
          </Button>
        </div>
      </div>

      {/* Last pipeline ran */}
      {lastPipeline && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="flex items-center gap-2 p-3 rounded-xl bg-[#0DCCB5]/8 border border-[#0DCCB5]/20 text-xs">
          <CheckCircle className="w-4 h-4 text-[#0DCCB5]"/>
          <span className="text-[#0DCCB5] font-semibold">Pipeline completed:</span>
          <span className="text-[#8B8BA8]">{lastPipeline}</span>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Posts Published" value="47" icon={<Globe className="w-4 h-4"/>} variant="brand" delta={{value:8,label:"this week"}}/>
        <StatCard label="Total Impressions" value="182K" icon={<Eye className="w-4 h-4"/>} variant="teal" delta={{value:24,label:"growth"}}/>
        <StatCard label="Avg Quality Score" value="84/100" icon={<Star className="w-4 h-4"/>} variant="amber"/>
        <StatCard label="Posts Rejected" value="12" icon={<AlertCircle className="w-4 h-4"/>} variant="rose" delta={{value:-3,label:"fewer this week"}}/>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-[#111120] border border-white/[0.06] rounded-xl w-fit">
        {(["overview","posts","learnings","settings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all", tab===t?"bg-[#6E42F5] text-white":"text-[#8B8BA8] hover:text-white")}>{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>

          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent grid */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-display font-bold text-base">Agent Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AGENTS.map(agent => {
                    const isActive = activeAgentId === agent.id && agentRunning;
                    return (
                      <motion.div key={agent.id} animate={isActive ? {scale:[1,1.01,1]} : {}} transition={{duration:1,repeat:Infinity}}
                        className={cn("p-4 rounded-2xl border transition-all", isActive ? "border-[#6E42F5]/40 bg-[#6E42F5]/8 shadow-[0_0_20px_rgba(110,66,245,0.12)]" : "border-white/[0.06] bg-[#0E0E1A]")}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{agent.icon}</span>
                          <AgentStatusDot active={isActive} />
                        </div>
                        <p className="text-sm font-semibold mb-0.5">{agent.name}</p>
                        <p className="text-[10px] text-[#4A4A64]">{agent.desc}</p>
                        {isActive && (
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-2 flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1,2,3].map(i => <motion.div key={i} className="w-1 h-3 rounded-full" style={{background:agent.color}} animate={{scaleY:[0.4,1,0.4]}} transition={{duration:0.8,repeat:Infinity,delay:i*0.15}}/>)}
                            </div>
                            <span className="text-[10px]" style={{color:agent.color}}>processing</span>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Weekly calendar */}
                <Card className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Content Calendar — This Week</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKLY_CONTENT.map((day, i) => (
                      <div key={day.day} className={cn("p-2 rounded-xl text-center border transition-all", day.done ? "border-[#0DCCB5]/30 bg-[#0DCCB5]/8" : day.active ? "border-[#6E42F5]/40 bg-[#6E42F5]/8 shadow-[0_0_12px_rgba(110,66,245,0.15)]" : "border-white/[0.04] bg-white/[0.01]")}>
                        <p className="text-[10px] font-bold text-[#4A4A64] mb-1">{day.day}</p>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1" style={{background: day.done ? "#0DCCB515" : day.active ? "#6E42F515" : "transparent"}}>
                          {day.done ? <CheckCircle className="w-3 h-3 text-[#0DCCB5]"/> : day.active ? <RefreshCw className="w-3 h-3 text-[#6E42F5] animate-spin"/> : <Clock className="w-3 h-3 text-[#4A4A64]"/>}
                        </div>
                        <p className="text-[9px] text-[#8B8BA8] leading-tight">{day.type}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar: manual controls + stats */}
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Manual Controls</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Post to X now", platform: "twitter", icon: <span className="text-sm font-black text-[#1DA1F2]">𝕏</span> },
                      { label: "Post to Instagram now", platform: "instagram", icon: <Camera className="w-4 h-4 text-[#E1306C]"/> },
                    ].map(item => (
                      <Button key={item.platform} variant="secondary" size="sm" className="w-full justify-start"
                        icon={item.icon} loading={triggering === item.platform}
                        onClick={() => triggerPost(item.platform)}>
                        {item.label}
                      </Button>
                    ))}
                    <div className="h-px bg-white/[0.06] my-1"/>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-[#4A4A64]" icon={<RefreshCw className="w-3.5 h-3.5"/>}>
                      Refresh trends
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-[#4A4A64]" icon={<BarChart3 className="w-3.5 h-3.5"/>}>
                      Run learning cycle
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-[#4A4A64]" icon={<Globe className="w-3.5 h-3.5"/>}>
                      Check GitHub features
                    </Button>
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="font-display font-bold text-sm mb-4">Today's Schedule</h3>
                  <div className="space-y-2.5">
                    {[
                      { time: "8:30 AM", platform: "twitter", status: "done" },
                      { time: "1:00 PM", platform: "twitter", status: "done" },
                      { time: "3:30 PM", platform: "instagram", status: "pending" },
                      { time: "8:00 PM", platform: "twitter", status: "pending" },
                      { time: "9:00 PM", platform: "instagram", status: "pending" },
                    ].map((slot, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={slot.platform}/>
                          <span className="text-xs text-[#8B8BA8]">{slot.time}</span>
                        </div>
                        {slot.status === "done"
                          ? <CheckCircle className="w-3.5 h-3.5 text-[#0DCCB5]"/>
                          : <Clock className="w-3.5 h-3.5 text-[#4A4A64]"/>}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <h3 className="font-display font-bold text-sm mb-3">Competitor Intel</h3>
                  <div className="space-y-2 text-xs text-[#8B8BA8]">
                    <p>📌 Canva trending: <span className="text-white">AI template reels</span></p>
                    <p>📌 Notion trending: <span className="text-white">AI docs + wikis</span></p>
                    <p>📌 Gap: <span className="text-[#0DCCB5]">No one owns short-form AI editor space</span></p>
                  </div>
                  <Badge variant="brand" className="mt-3">Updated 6h ago</Badge>
                </Card>
              </div>
            </div>
          )}

          {tab === "posts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base">Post History</h3>
                <div className="flex gap-2">
                  {["all","published","scheduled","rejected"].map(f => (
                    <button key={f} className="text-xs px-3 py-1.5 rounded-xl border border-white/[0.06] text-[#8B8BA8] hover:text-white capitalize transition-all">{f}</button>
                  ))}
                </div>
              </div>
              {MOCK_POSTS.map((post, i) => (
                <motion.div key={post.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.10] transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: post.platform === "twitter" ? "#1DA1F215" : "#E1306C15"}}>
                    <PlatformIcon platform={post.platform}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant={post.status === "published" ? "success" : post.status === "rejected" ? "danger" : "brand"}>{post.status}</Badge>
                      <Badge variant="default">{post.contentType}</Badge>
                      <span className="text-xs text-[#4A4A64]">{post.postedAt}</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-2">"{post.hook}"</p>
                    {Object.keys(post.engagement).length > 0 && (
                      <div className="flex gap-4 text-xs text-[#4A4A64]">
                        {post.engagement.impressions && <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{formatNumber(post.engagement.impressions)}</span>}
                        {post.engagement.likes && <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#F5426E]"/>{formatNumber(post.engagement.likes)}</span>}
                        {post.engagement.shares && <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-[#6E42F5]"/>{formatNumber(post.engagement.shares)}</span>}
                        {post.engagement.saves && <span className="flex items-center gap-1"><Bookmark className="w-3 h-3 text-[#F5A623]"/>{formatNumber(post.engagement.saves)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-[#4A4A64] mb-1">QC Score</p>
                    <p className="font-bold text-sm" style={{color: post.qualityScore >= 85 ? "#0DCCB5" : post.qualityScore >= 70 ? "#6E42F5" : "#F5426E"}}>{post.qualityScore}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "learnings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-6">
                <h3 className="font-display font-bold text-base mb-4">What's Working</h3>
                <div className="space-y-3">
                  {[
                    { insight: "Curiosity-gap hooks with a data point perform 2.3× better on X", score: 92 },
                    { insight: "Saturday 3–5 PM posts get +43% more initial reach", score: 89 },
                    { insight: '"Build in public" content drives most website clicks', score: 86 },
                    { insight: "Feature showcase posts get 2× more saves on Instagram", score: 84 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#0DCCB5]/5 border border-[#0DCCB5]/15">
                      <span className="text-[#0DCCB5] text-base">✦</span>
                      <p className="text-sm text-[#8B8BA8] flex-1">{item.insight}</p>
                      <span className="text-xs font-bold text-[#0DCCB5] flex-shrink-0">{item.score}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-display font-bold text-base mb-4">What to Avoid</h3>
                <div className="space-y-3">
                  {[
                    "Generic motivational content — 0 saves, low engagement",
                    "Posting memes on Monday — audience in work mode",
                    "Hooks starting with 'Introducing' or 'Excited to share'",
                    "3+ hashtags in Twitter posts — feels spammy to algorithm",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F5426E]/5 border border-[#F5426E]/15">
                      <XCircle className="w-4 h-4 text-[#F5426E] flex-shrink-0 mt-0.5"/>
                      <p className="text-sm text-[#8B8BA8]">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 lg:col-span-2">
                <h3 className="font-display font-bold text-base mb-3">This Week's AI Brief</h3>
                <div className="p-4 rounded-xl bg-[#6E42F5]/8 border border-[#6E42F5]/20 text-sm text-[#8B8BA8] leading-relaxed">
                  Creova's top-performing content is curiosity-driven insights about AI + creators (not generic "AI is the future" posts). Feature showcases work best on Instagram (visual, save-worthy). Twitter performs best with sharp contrarian takes or specific data points. The audience responds to founder authenticity — "build in public" style content drives 3× more profile clicks than promotional posts.
                </div>
                <p className="text-xs text-[#4A4A64] mt-2">Last learning cycle: Today 06:00 AM</p>
              </Card>
            </div>
          )}

          {tab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-3xl">
              <Card className="p-6">
                <h3 className="font-display font-bold text-sm mb-4">Agent Configuration</h3>
                <div className="space-y-3">
                  {[
                    { l: "Brand Name", v: "Creova Studio" },
                    { l: "Daily Post Limit", v: "6 (3 X + 3 IG)" },
                    { l: "Min Quality Score", v: "75/100" },
                    { l: "Timezone", v: "Asia/Kolkata (IST)" },
                    { l: "Learning Cycle", v: "Every Monday 6 AM" },
                    { l: "Trend Refresh", v: "Every 3 hours" },
                    { l: "GitHub Scan", v: "Every 6 hours" },
                  ].map(item => (
                    <div key={item.l} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-xs text-[#8B8BA8]">{item.l}</span>
                      <span className="text-xs font-semibold text-[#6E42F5]">{item.v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-display font-bold text-sm mb-4">Platform Status</h3>
                <div className="space-y-3">
                  {[
                    { n: "Twitter/X", connected: true, icon: <span className="text-sm font-black text-[#1DA1F2]">𝕏</span> },
                    { n: "Instagram", connected: false, icon: <Camera className="w-4 h-4 text-[#E1306C]"/> },
                    { n: "Supabase DB", connected: true, icon: <Activity className="w-4 h-4 text-[#0DCCB5]"/> },
                    { n: "OpenAI GPT-4o", connected: true, icon: <Cpu className="w-4 h-4 text-[#6E42F5]"/> },
                    { n: "Telegram Alerts", connected: false, icon: <Globe className="w-4 h-4 text-[#42B4F5]"/> },
                    { n: "GitHub Watcher", connected: true, icon: <Globe className="w-4 h-4 text-[#8B8BA8]"/> },
                  ].map(item => (
                    <div key={item.n} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{item.icon}<span className="text-sm text-[#8B8BA8]">{item.n}</span></div>
                      <Badge variant={item.connected ? "success" : "default"}>{item.connected ? "Connected" : "Setup needed"}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
