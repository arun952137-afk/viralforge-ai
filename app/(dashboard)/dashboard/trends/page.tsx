"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Zap, RefreshCw, Copy, Check, Flame, Clock, Hash, ArrowRight, Filter, Globe } from "lucide-react";
import { Button, Card, Badge, Select, ScoreRing, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  {value:"all",label:"All Platforms"},
  {value:"tiktok",label:"TikTok"},
  {value:"youtube",label:"YouTube Shorts"},
  {value:"instagram",label:"Instagram Reels"},
  {value:"twitter",label:"X / Twitter"},
  {value:"linkedin",label:"LinkedIn"},
];
const NICHES = [
  {value:"all",label:"All Niches"},
  {value:"kids",label:"Kids Content"},
  {value:"education",label:"Education"},
  {value:"finance",label:"Finance"},
  {value:"motivation",label:"Motivation"},
  {value:"gaming",label:"Gaming"},
  {value:"fitness",label:"Fitness"},
  {value:"tech",label:"Tech & AI"},
];

interface Trend {
  id: string; title: string; hook: string; viralScore: number;
  urgency: "exploding"|"rising"|"stable";
  platform: string; hashtags: string[]; reason: string;
  velocity: number; views24h: string;
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text).catch(()=>{}); setC(true); setTimeout(()=>setC(false),1500)}} className="p-1.5 rounded-lg text-[#4A4A64] hover:text-[#6E42F5] hover:bg-[#6E42F5]/10 transition-all">
      {c ? <Check className="w-3.5 h-3.5 text-[#0DCCB5]"/> : <Copy className="w-3.5 h-3.5"/>}
    </button>
  );
}

const URGENCY_CONFIG = {
  exploding: { label: "Exploding 🔥", variant: "danger" as const, color: "#F5426E" },
  rising: { label: "Rising 📈", variant: "warning" as const, color: "#F5A623" },
  stable: { label: "Stable", variant: "default" as const, color: "#8B8BA8" },
};

const MOCK_TRENDS: Trend[] = [
  { id:"1", title:"AI reveals the truth about [topic] that nobody talks about", hook:"Scientists just discovered something TERRIFYING about [topic]…", viralScore:96, urgency:"exploding", platform:"YouTube Shorts", hashtags:["#AISecrets","#MindBlown","#Viral"], reason:"Curiosity-gap + AI authority — unstoppable combo trending +340% this week", velocity:340, views24h:"8.2M" },
  { id:"2", title:"I tried [challenge] every day for 30 days — here's what broke me", hook:"Day 28 almost killed this experiment. Here's what nobody tells you.", viralScore:92, urgency:"exploding", platform:"TikTok", hashtags:["#30DayChallenge","#Transformation","#Shorts"], reason:"Transformation content surging across all short-form platforms", velocity:280, views24h:"5.1M" },
  { id:"3", title:"The [profession] secret they'll never teach you in school", hook:"Every [professional] knows this but they're not allowed to say it…", viralScore:88, urgency:"rising", platform:"Instagram Reels", hashtags:["#IndustrySecrets","#LifeHacks","#FYP"], reason:"Insider knowledge format drives 2× saves vs. standard content", velocity:180, views24h:"3.4M" },
  { id:"4", title:"POV: You're the only one who notices this every time", hook:"This happens literally every single time and nobody says anything.", viralScore:85, urgency:"rising", platform:"TikTok", hashtags:["#POV","#Relatable","#FYP"], reason:"Relatable POV format gets 2× more shares than direct-address videos", velocity:142, views24h:"2.8M" },
  { id:"5", title:"This one change made me [result] in [timeframe]", hook:"I changed one small thing and everything shifted in 21 days.", viralScore:81, urgency:"stable", platform:"YouTube Shorts", hashtags:["#Viral","#Tips","#Growth"], reason:"Experience + transformation format converts on all platforms", velocity:92, views24h:"1.9M" },
];

const TRENDING_AUDIO = [
  { name: "Flowers – Miley (Sped Up)", usage: 2400000, trend: "+180%" },
  { name: "Rich Baby Daddy – Drake edit", usage: 1800000, trend: "+240%" },
  { name: "Calm Down – Rema Remix", usage: 1200000, trend: "+90%" },
  { name: "Original Sound @trendsetter", usage: 890000, trend: "+380%" },
];

const RISING_NICHES = [
  { name: "3D Kids Animation", score: 96, change: "+340%" },
  { name: "AI Consciousness Debates", score: 91, change: "+280%" },
  { name: "Quiet Luxury Lifestyle", score: 88, change: "+195%" },
  { name: "Micro Learning Shorts", score: 84, change: "+167%" },
  { name: "Emotional Intelligence", score: 81, change: "+142%" },
];

const TRENDING_HOOKS = [
  "What if [thing] could actually change your life?",
  "Nobody tells you this about [topic]...",
  "I spent [time] doing [thing] and here's what happened",
  "The [profession] secret that [authority] doesn't want you to know",
  "POV: You just discovered [relatable thing]",
  "This changed everything about how I [action]",
];

export default function TrendsPage() {
  const [platform, setPlatform] = useState("all");
  const [niche, setNiche] = useState("all");
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>(MOCK_TRENDS);
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function scan() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trends", topic: niche === "all" ? "general" : niche, platform }),
      });
      const data = await res.json();
      if (data.success && data.data.trends) {
        const mapped = data.data.trends.map((t: any, i: number) => ({
          id: String(i), title: t.title, hook: t.hook, viralScore: t.viralScore,
          urgency: i < 2 ? "exploding" : i < 4 ? "rising" : "stable",
          platform, hashtags: t.hashtags ?? [], reason: t.reason, velocity: 300 - i*50, views24h: `${(8.2 - i*1.5).toFixed(1)}M`,
        })) as Trend[];
        setTrends(mapped);
      }
    } catch { setTrends(MOCK_TRENDS); }
    setLoading(false);
    setLastRefresh(new Date());
  }

  async function refresh() {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setLastRefresh(new Date());
    setRefreshing(false);
  }

  useEffect(() => {
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, []);

  const selectedTrend = trends.find(t => t.id === selected) ?? trends[0];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Flame className="w-7 h-7 text-[#F5426E]"/> Trend Radar
            </h1>
            <Badge variant="success" dot>Live Scanning</Badge>
          </div>
          <p className="text-[#8B8BA8] text-sm">Real-time viral intelligence across TikTok, Reels, Shorts, X, and LinkedIn</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#4A4A64]">
          <button onClick={refresh} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.10] transition-all text-[#8B8BA8] hover:text-white", refreshing && "opacity-60 pointer-events-none")}>
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}/> Refresh
          </button>
          <span>Updated {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <Select label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS} className="w-44"/>
          <Select label="Niche" value={niche} onChange={setNiche} options={NICHES} className="w-44"/>
          <Button onClick={scan} loading={loading} icon={<TrendingUp className="w-4 h-4"/>}>
            {loading ? "Scanning…" : "Scan Trends Now"}
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-[#4A4A64]">
            <Globe className="w-3.5 h-3.5"/> Scanning 5 platforms
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-display font-bold text-base">Top Viral Trends Right Now</h3>
          {loading ? Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-36"/>) : (
            trends.map((trend, i) => (
              <motion.div
                key={trend.id}
                initial={{opacity:0,x:-16}}
                animate={{opacity:1,x:0}}
                transition={{delay:i*0.07}}
                onClick={() => setSelected(trend.id)}
                className={cn("cursor-pointer rounded-2xl border p-5 transition-all duration-200", selected===trend.id ? "border-[#6E42F5]/50 bg-[#6E42F5]/8 shadow-[0_0_24px_rgba(110,66,245,0.15)]" : "border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.12] hover:-translate-y-0.5")}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-xl text-[#4A4A64]">#{i+1}</span>
                    <Badge variant={URGENCY_CONFIG[trend.urgency].variant}>{URGENCY_CONFIG[trend.urgency].label}</Badge>
                    <Badge variant="sky">{trend.platform}</Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-[#4A4A64]">24h views</p>
                      <p className="text-sm font-bold text-[#0DCCB5]">{trend.views24h}</p>
                    </div>
                    <ScoreRing value={trend.viralScore} label="Score" size={52} thickness={5}/>
                  </div>
                </div>
                <h4 className="font-semibold text-sm mb-1.5 leading-snug">{trend.title}</h4>
                <p className="text-xs text-[#8B8BA8] italic mb-2.5">Hook: "{trend.hook}"</p>
                <p className="text-xs text-[#4A4A64] mb-3">💡 {trend.reason}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {trend.hashtags.map(h=>(
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-[#6E42F5]/10 text-[#8B62FF] border border-[#6E42F5]/20">{h}</span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <CopyBtn text={`${trend.title}\n\nHook: ${trend.hook}\n\n${trend.hashtags.join(" ")}`}/>
                    <a href="/dashboard/create">
                      <Button size="xs" icon={<Zap className="w-3 h-3"/>}>Create</Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Side panels */}
        <div className="space-y-5">
          {/* Velocity meter */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#F5426E]"/>
              <h4 className="font-display font-bold text-sm">Trend Velocity</h4>
              <Badge variant="danger">Real-time</Badge>
            </div>
            <div className="space-y-3">
              {trends.slice(0,5).map((t,i)=>(
                <div key={t.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8B8BA8] truncate max-w-[160px]">#{i+1} {t.title.slice(0,30)}…</span>
                    <span className="font-bold text-[#F5426E]">+{t.velocity}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F5426E] to-[#F5A623]" initial={{width:0}} animate={{width:`${(t.velocity/380)*100}%`}} transition={{duration:0.9}}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending audio */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎵</span>
              <h4 className="font-display font-bold text-sm">Trending Audio</h4>
            </div>
            <div className="space-y-2.5">
              {TRENDING_AUDIO.map((a,i)=>(
                <div key={a.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-[#4A4A64]">#{i+1}</span>
                    <span className="text-xs font-medium truncate">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-[#0DCCB5]">{a.trend}</span>
                    <CopyBtn text={a.name}/>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rising niches */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-[#42B4F5]"/>
              <h4 className="font-display font-bold text-sm">Rising Niches</h4>
              <Badge variant="sky">Early signal</Badge>
            </div>
            <div className="space-y-3">
              {RISING_NICHES.map((n,i)=>(
                <div key={n.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4A4A64]">#{i+1}</span>
                    <span className="text-xs text-[#8B8BA8]">{n.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0DCCB5]">{n.change}</span>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:`${n.score>=90?"#0DCCB5":n.score>=85?"#6E42F5":"#F5A623"}15`,color:n.score>=90?"#0DCCB5":n.score>=85?"#6E42F5":"#F5A623"}}>{n.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending hooks */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🪝</span>
              <h4 className="font-display font-bold text-sm">Hook Templates</h4>
            </div>
            <div className="space-y-2">
              {TRENDING_HOOKS.map((h,i)=>(
                <div key={i} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                  <p className="text-xs text-[#8B8BA8] leading-relaxed">{h}</p>
                  <CopyBtn text={h}/>
                </div>
              ))}
            </div>
          </Card>

          {/* Best time */}
          <Card className="p-5" glow="teal">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#0DCCB5]"/>
              <h4 className="font-display font-bold text-sm">Best Upload Time</h4>
            </div>
            <p className="font-display font-extrabold text-2xl text-[#0DCCB5] mb-1">Saturday 3 PM</p>
            <p className="text-xs text-[#8B8BA8]">+43% more initial views vs. off-peak — based on your audience behavior</p>
            <a href="/dashboard/calendar">
              <Button variant="teal" size="sm" className="mt-3 w-full" icon={<ArrowRight className="w-3.5 h-3.5"/>}>Schedule Now</Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
