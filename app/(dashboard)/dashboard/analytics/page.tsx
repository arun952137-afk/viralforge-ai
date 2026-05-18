"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie
} from "recharts";
import {
  Eye, Clock, MousePointer, Share2, Flame, ArrowRight,
  Filter, Download, ChevronUp, ChevronDown
} from "lucide-react";
import { Card, Button, Badge, Select, StatCard, Skeleton } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const genViews = (days: number) => Array.from({ length: days }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
  const t = 6000 + i * 450 + Math.sin(i * 0.8) * 2000 + Math.random() * 2500;
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: Math.floor(t), likes: Math.floor(t * 0.068), shares: Math.floor(t * 0.022),
  };
});

const RETENTION = [
  { s: "0s", r: 100 }, { s: "3s", r: 82 }, { s: "6s", r: 71 },
  { s: "10s", r: 63 }, { s: "15s", r: 57 }, { s: "20s", r: 52 },
  { s: "30s", r: 44 }, { s: "45s", r: 38 }, { s: "60s", r: 31 },
];
const PLATFORMS = [
  { name: "YouTube", value: 44, color: "#FF4444", views: "3.6M" },
  { name: "TikTok", value: 30, color: "#00F2EA", views: "2.5M" },
  { name: "Instagram", value: 17, color: "#E1306C", views: "1.4M" },
  { name: "Facebook", value: 9, color: "#1877F2", views: "740K" },
];
const HEATMAP_HOURS = ["12a","2a","4a","6a","8a","10a","12p","2p","4p","6p","8p","10p"];
const HEATMAP_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HEATMAP = HEATMAP_DAYS.map(d => HEATMAP_HOURS.map(h => {
  const base = (h === "4p" || h === "3p") ? 85 : (h === "8p" || h === "7p") ? 70 : (h === "12p") ? 55 : 15;
  return Math.min(100, Math.floor(base * ((d === "Sat" || d === "Sun") ? 1.3 : 1) + Math.random() * 20));
}));
const TOP_VIDEOS = [
  { title: "Balloon Adventure Ep.3", platform: "YT Shorts", views: 421000, ctr: 9.4, retention: 84, score: 92, trend: "up" },
  { title: "Rainbow Bus Rhyme 3D", platform: "TikTok", views: 183000, ctr: 7.8, retention: 79, score: 85, trend: "up" },
  { title: "Magic Garden Ep.4", platform: "Reels", views: 98000, ctr: 6.4, retention: 71, score: 78, trend: "stable" },
  { title: "Crayon World Story", platform: "YT Shorts", views: 67000, ctr: 5.9, retention: 68, score: 74, trend: "down" },
];
const VIRAL_DIMS = [
  { subject: "Hook", A: 94 }, { subject: "Retention", A: 87 }, { subject: "Emotion", A: 91 },
  { subject: "Trend", A: 88 }, { subject: "Thumbnail", A: 82 }, { subject: "CTA", A: 79 },
];
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0E0E1A] border border-white/10 rounded-xl p-3 text-xs backdrop-blur-xl shadow-2xl">
      <p className="text-[#8B8BA8] mb-2 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6 mb-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">{typeof p.value === "number" && p.value > 100 ? formatNumber(p.value) : `${p.value}${p.name === "Retention" ? "%" : ""}`}</span>
        </div>
      ))}
    </div>
  );
};

function LiveNum({ value, color }: { value: string; color: string }) {
  const [disp, setDisp] = useState(value);
  useEffect(() => {
    const t = setInterval(() => {
      setDisp(prev => {
        const n = Math.max(0, parseInt(prev.replace(/\D/g,"")) + (Math.random()>0.5?1:-1)*Math.floor(Math.random()*30));
        return formatNumber(n);
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);
  return <span className="font-display text-2xl font-bold" style={{ color }}>{disp}</span>;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(genViews(30));
  const [tab, setTab] = useState<"overview"|"content"|"audience"|"intelligence">("overview");
  useEffect(() => {
    setLoading(true);
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    setTimeout(() => { setData(genViews(days)); setLoading(false); }, 400);
  }, [period]);
  const TABS = ["overview","content","audience","intelligence"] as const;
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Analytics</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0DCCB5]/12 border border-[#0DCCB5]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0DCCB5] animate-pulse" />
              <span className="text-[10px] font-bold text-[#0DCCB5] uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-[#8B8BA8] text-sm">Creator Analytics Terminal — real-time performance intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onChange={setPeriod} options={[{value:"7d",label:"7 days"},{value:"30d",label:"30 days"},{value:"90d",label:"90 days"}]} />
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>Export</Button>
        </div>
      </div>

      {/* Live tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: "8200000", color: "#6E42F5" },
          { label: "Total Likes", value: "583000", color: "#0DCCB5" },
          { label: "Watch Hours", value: "142000", color: "#F5A623" },
          { label: "New Followers", value: "12400", color: "#F5426E" },
        ].map(item => (
          <Card key={item.label} className="p-5">
            <p className="text-[10px] text-[#4A4A64] uppercase tracking-widest mb-2">{item.label}</p>
            <LiveNum value={item.value} color={item.color} />
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: item.color }} />
              <span className="text-[10px] text-[#4A4A64]">live</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-[#111120] border border-white/[0.06] rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize", tab===t?"bg-[#6E42F5] text-white shadow-[0_0_16px_rgba(110,66,245,0.35)]":"text-[#8B8BA8] hover:text-white")}>{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-28"/>)
                  : [
                    {label:"Avg Retention",value:"78.4%",delta:{value:5.2},variant:"brand" as const,icon:<Clock className="w-4 h-4"/>},
                    {label:"Click-Through Rate",value:"8.2%",delta:{value:1.1},variant:"teal" as const,icon:<MousePointer className="w-4 h-4"/>},
                    {label:"Viral Score Avg",value:"87.4",delta:{value:3.8},variant:"amber" as const,icon:<Flame className="w-4 h-4"/>},
                    {label:"Total Shares",value:"142K",delta:{value:18},variant:"rose" as const,icon:<Share2 className="w-4 h-4"/>},
                  ].map(s=><StatCard key={s.label} {...s}/>)
                }
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-bold text-base">Performance Over Time</h3>
                    <div className="flex gap-3 text-xs">
                      {[{l:"Views",c:"#6E42F5"},{l:"Likes",c:"#0DCCB5"},{l:"Shares",c:"#F5426E"}].map(i=>(
                        <div key={i.l} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:i.c}}/><span className="text-[#8B8BA8]">{i.l}</span></div>
                      ))}
                    </div>
                  </div>
                  {loading ? <Skeleton className="h-56"/> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={data} margin={{top:5,right:8,bottom:0,left:0}}>
                        <defs>
                          {[{id:"v",c:"#6E42F5"},{id:"l",c:"#0DCCB5"},{id:"s",c:"#F5426E"}].map(({id,c})=>(
                            <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={c} stopOpacity={0.25}/>
                              <stop offset="100%" stopColor={c} stopOpacity={0}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                        <XAxis dataKey="date" tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false} interval={Math.floor(data.length/5)}/>
                        <YAxis tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>formatNumber(v)}/>
                        <Tooltip content={<Tip/>}/>
                        <Area type="monotone" dataKey="views" name="Views" stroke="#6E42F5" strokeWidth={2} fill="url(#v)"/>
                        <Area type="monotone" dataKey="likes" name="Likes" stroke="#0DCCB5" strokeWidth={2} fill="url(#l)"/>
                        <Area type="monotone" dataKey="shares" name="Shares" stroke="#F5426E" strokeWidth={2} fill="url(#s)"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
                <Card className="p-6">
                  <h3 className="font-display font-bold text-base mb-5">Platform Split</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={PLATFORMS} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {PLATFORMS.map((e,i)=><Cell key={i} fill={e.color} opacity={0.85}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-4">
                    {PLATFORMS.map(p=>(
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:p.color}}/><span className="text-sm text-[#8B8BA8]">{p.name}</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs text-[#4A4A64]">{p.views}</span><span className="text-sm font-bold">{p.value}%</span></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="p-6">
                  <h3 className="font-display font-bold text-base mb-1">Avg Audience Retention</h3>
                  <p className="text-xs text-[#4A4A64] mb-4">When viewers drop off across all content</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={RETENTION} margin={{top:5,right:8,bottom:0,left:0}}>
                      <defs>
                        <linearGradient id="ret" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0DCCB5" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#0DCCB5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="s" tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
                      <Tooltip formatter={(v:any)=>[`${v}%`,"Retention"]} contentStyle={{background:"#0E0E1A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12}}/>
                      <Area type="monotone" dataKey="r" name="Retention" stroke="#0DCCB5" strokeWidth={2} fill="url(#ret)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-[#4A4A64] flex gap-4">
                    <span>🟢 Strong hook: 82% @ 3s</span><span>⚠️ Mid-content dip @ 10s</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-display font-bold text-base mb-4">Best Posting Times</h3>
                  <div className="space-y-1.5">
                    {HEATMAP_DAYS.map((day, di) => (
                      <div key={day} className="flex items-center gap-2">
                        <span className="text-[10px] text-[#4A4A64] w-7 shrink-0">{day}</span>
                        <div className="grid gap-0.5 flex-1" style={{gridTemplateColumns:`repeat(${HEATMAP_HOURS.length},1fr)`}}>
                          {HEATMAP[di].map((v, hi) => {
                            const opacity = 0.08 + (v/100)*0.92;
                            const color = v>70?"#6E42F5":v>40?"#0DCCB5":"#1C1C30";
                            return <div key={hi} className="h-5 rounded-sm hover:scale-110 transition-transform cursor-pointer" style={{background:color,opacity:v<10?0.1:opacity}} title={`${v}%`}/>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl bg-[#6E42F5]/8 border border-[#6E42F5]/20 text-xs text-[#8B8BA8]">
                    🎯 <span className="text-[#6E42F5] font-semibold">Saturday 3–5 PM</span> — your peak slot (+43% initial reach)
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "content" && (
            <div className="space-y-5">
              <Card padding={false}>
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="font-display font-bold text-base">Top Performing Videos</h3>
                  <Button variant="secondary" size="sm" icon={<Filter className="w-3.5 h-3.5"/>}>Filter</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/[0.04]">
                      {["Video","Platform","Views","CTR","Retention","Score","Trend"].map(h=>(
                        <th key={h} className="text-left px-6 py-3 text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {TOP_VIDEOS.map((v,i)=>(
                        <motion.tr key={v.title} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.06}} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#6E42F5]/15 border border-[#6E42F5]/20 flex items-center justify-center text-xs font-bold text-[#6E42F5]">#{i+1}</div>
                              <span className="font-semibold truncate max-w-[160px]">{v.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><Badge variant="sky">{v.platform}</Badge></td>
                          <td className="px-6 py-4 font-bold text-[#0DCCB5]">{formatNumber(v.views)}</td>
                          <td className="px-6 py-4 font-semibold">{v.ctr}%</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#0DCCB5]" style={{width:`${v.retention}%`}}/></div>
                              <span className="text-xs">{v.retention}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="font-bold" style={{color:v.score>=90?"#0DCCB5":v.score>=80?"#6E42F5":"#F5A623"}}>{v.score}</span></td>
                          <td className="px-6 py-4">{v.trend==="up"?<ChevronUp className="w-4 h-4 text-[#0DCCB5]"/>:v.trend==="down"?<ChevronDown className="w-4 h-4 text-[#F5426E]"/>:<span className="text-[#4A4A64]">—</span>}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {tab === "audience" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-6">
                <h3 className="font-display font-bold text-base mb-5">Audience Age Groups</h3>
                <div className="space-y-3">
                  {[{l:"13–17",p:31,c:"#6E42F5"},{l:"18–24",p:28,c:"#0DCCB5"},{l:"25–34",p:22,c:"#F5A623"},{l:"35–44",p:12,c:"#F5426E"},{l:"45+",p:7,c:"#42B4F5"}].map(item=>(
                    <div key={item.l}>
                      <div className="flex justify-between text-xs mb-1.5"><span className="text-[#8B8BA8]">Ages {item.l}</span><span className="font-bold" style={{color:item.c}}>{item.p}%</span></div>
                      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{background:item.c}} initial={{width:0}} animate={{width:`${item.p}%`}} transition={{duration:0.9}}/></div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-display font-bold text-base mb-5">Growth Forecast</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={[
                    {m:"Jan",a:12000,f:null},{m:"Feb",a:18000,f:null},{m:"Mar",a:31000,f:null},
                    {m:"Apr",a:48000,f:null},{m:"May",a:67000,f:67000},{m:"Jun",a:null,f:89000},
                    {m:"Jul",a:null,f:118000},{m:"Aug",a:null,f:152000},
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="m" tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#4A4A64",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>formatNumber(v)}/>
                    <Tooltip contentStyle={{background:"#0E0E1A",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12}}/>
                    <Line type="monotone" dataKey="a" name="Actual" stroke="#6E42F5" strokeWidth={2} dot={{fill:"#6E42F5",r:3}} connectNulls={false}/>
                    <Line type="monotone" dataKey="f" name="AI Forecast" stroke="#0DCCB5" strokeWidth={2} strokeDasharray="5 5" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {tab === "intelligence" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="p-6">
                  <h3 className="font-display font-bold text-base mb-1">Viral Intelligence Radar</h3>
                  <p className="text-xs text-[#4A4A64] mb-4">Composite score across 6 viral dimensions</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={VIRAL_DIMS}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)"/>
                      <PolarAngleAxis dataKey="subject" tick={{fill:"#8B8BA8",fontSize:11}}/>
                      <Radar name="Score" dataKey="A" stroke="#6E42F5" fill="#6E42F5" fillOpacity={0.15} strokeWidth={2}/>
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 rounded-xl bg-[#6E42F5]/8 border border-[#6E42F5]/20 text-xs text-[#8B8BA8]">
                    <span className="text-[#6E42F5] font-bold">💡 Opportunity:</span> CTA (79) is weakest. Add verbal + visual CTA in final 3s to push above 90.
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-display font-bold text-base mb-5">Viral Probability Scores</h3>
                  <div className="space-y-4">
                    {[
                      {l:"Viral Probability",v:89,c:"#6E42F5",e:"🎯"},
                      {l:"Hook Strength",v:94,c:"#0DCCB5",e:"🪝"},
                      {l:"Emotional Impact",v:91,c:"#F5426E",e:"❤️"},
                      {l:"Swipe-Stop Score",v:82,c:"#F5A623",e:"🛑"},
                      {l:"Replay Probability",v:74,c:"#42B4F5",e:"🔁"},
                      {l:"Curiosity Rating",v:87,c:"#0DCCB5",e:"🤔"},
                    ].map(item=>(
                      <div key={item.l}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-[#8B8BA8]">{item.e} {item.l}</span>
                          <span className="font-bold text-sm" style={{color:item.c}}>{item.v}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{background:item.c}} initial={{width:0}} animate={{width:`${item.v}%`}} transition={{duration:0.9,ease:[0.25,0.46,0.45,0.94]}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card className="p-6">
                <h3 className="font-display font-bold text-base mb-4">AI Creator Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {e:"🔥",t:"Peak Performance Window",b:'Post Saturday 3–5 PM. Your last 3 videos missed this by 6+ hours — costing ~43% initial reach.',a:"Schedule next post",c:"#F5A623"},
                    {e:"🎯",t:"Hook Formula Working",b:'"What if…" format drives 2.3× more 3s retention than other hooks. Use it in your next 5 videos.',a:"Open Hook Lab",c:"#6E42F5"},
                    {e:"📈",t:"Niche Trend Detected",b:"3D animation kids content is up 340% on Shorts this week. Your existing style fits perfectly.",a:"See Trends",c:"#0DCCB5"},
                  ].map((item,i)=>(
                    <motion.div key={item.t} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="p-4 rounded-xl border hover:border-white/[0.12] transition-all cursor-pointer" style={{background:`${item.c}08`,borderColor:`${item.c}20`}}>
                      <span className="text-2xl block mb-3">{item.e}</span>
                      <h4 className="font-semibold text-sm mb-1.5">{item.t}</h4>
                      <p className="text-xs text-[#8B8BA8] leading-relaxed mb-3">{item.b}</p>
                      <button className="text-xs font-semibold flex items-center gap-1" style={{color:item.c}}>{item.a} <ArrowRight className="w-3 h-3"/></button>
                    </motion.div>
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
