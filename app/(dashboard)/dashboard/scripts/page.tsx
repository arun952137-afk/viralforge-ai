"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, RefreshCw, Copy, Check, Wand2, Hash, TrendingUp, Zap, Target } from "lucide-react";
import { Button, Card, Input, Textarea, Select, Badge, ScoreRing, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  {value:"YouTube Shorts",label:"YouTube Shorts"},
  {value:"TikTok",label:"TikTok"},
  {value:"Instagram Reels",label:"Instagram Reels"},
  {value:"LinkedIn",label:"LinkedIn"},
  {value:"X / Twitter",label:"X / Twitter"},
];
const TONES = [
  {value:"energetic",label:"Energetic 🔥"},
  {value:"dramatic",label:"Dramatic 🎭"},
  {value:"educational",label:"Educational 📚"},
  {value:"funny",label:"Comedy 😂"},
  {value:"inspiring",label:"Inspiring ✨"},
  {value:"controversial",label:"Controversial ⚡"},
];
const DURATIONS = [
  {value:"30",label:"30 seconds"},
  {value:"60",label:"60 seconds"},
  {value:"90",label:"90 seconds"},
  {value:"180",label:"3 minutes"},
];
const HOOK_TYPES = ["curiosity","authority","emotional","controversy","dopamine","urgency","storytelling"] as const;
type HookType = typeof HOOK_TYPES[number];
const HOOK_COLORS: Record<HookType, string> = {
  curiosity: "#6E42F5", authority: "#42B4F5", emotional: "#F5426E",
  controversy: "#F5A623", dopamine: "#0DCCB5", urgency: "#F5426E", storytelling: "#8B62FF",
};

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text).catch(()=>{}); setC(true); setTimeout(()=>setC(false),1500)}} className="p-1.5 rounded-lg text-[#4A4A64] hover:text-[#6E42F5] hover:bg-[#6E42F5]/10 transition-all">
      {c?<Check className="w-3.5 h-3.5 text-[#0DCCB5]"/>:<Copy className="w-3.5 h-3.5"/>}
    </button>
  );
}

export default function ScriptsPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [tone, setTone] = useState("energetic");
  const [duration, setDuration] = useState("60");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hashResult, setHashResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"script"|"hooks"|"hashtags">("script");
  const [selectedHookType, setSelectedHookType] = useState<HookType>("curiosity");
  const [hookLoading, setHookLoading] = useState(false);
  const [hooks, setHooks] = useState<any[]>([]);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setResult(null); setHashResult(null);
    try {
      const [scriptRes, hashRes] = await Promise.all([
        fetch("/api/scripts", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({niche:topic, platform, tone, duration:parseInt(duration)}) }),
        fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"hashtags", topic, platform}) }),
      ]);
      const [sData, hData] = await Promise.all([scriptRes.json(), hashRes.json()]);
      if (sData.success) setResult(sData.data.scriptData);
      if (hData.success) setHashResult(hData.data);
    } catch {
      setResult({
        hook:"What if one balloon could literally change your entire life? 🎈",
        hookVariants:[
          {hook:"Nobody talks about this balloon trick — but it changed everything…",type:"curiosity",score:94,ctr:"9.2%",watchTime:"58s"},
          {hook:"I found a golden balloon and my life was NEVER the same 😱",type:"emotional",score:89,ctr:"8.7%",watchTime:"54s"},
          {hook:"Scientists just discovered what's INSIDE a magical balloon",type:"authority",score:86,ctr:"8.1%",watchTime:"51s"},
          {hook:"The balloon nobody wants you to find (but I found it anyway)",type:"controversy",score:82,ctr:"7.6%",watchTime:"48s"},
        ],
        body:"Johnny was just a regular kid living a regular life... until the day he discovered the golden balloon at the edge of the park. The moment his fingers touched the silky surface, the world shifted. Colors deepened. Sound became music. And suddenly he was floating — high above the rooftops, above the clouds — into a world where every dream was real.",
        cta:"Subscribe to follow Johnny's next adventure — and drop a 🎈 in the comments if you believe in magic!",
        scenes:[
          {id:1, description:"Park scene, golden balloon appears", text:"What if one balloon could change everything?", duration:4, visualPrompt:"Pixar-quality park, golden glowing balloon, cinematic lighting"},
          {id:2, description:"Johnny touches the balloon", text:"Johnny's fingers touched the silky surface…", duration:6, visualPrompt:"Close-up hand touching glowing balloon, sparkle effects, bokeh"},
          {id:3, description:"Floating upward", text:"And suddenly he was floating…", duration:10, visualPrompt:"Kid rising through colorful clouds, magical atmosphere"},
          {id:4, description:"Cloud kingdom revealed", text:"…into a world where every dream was real.", duration:14, visualPrompt:"Breathtaking magical cloud city, rainbow bridges, Pixar quality"},
          {id:5, description:"CTA end card", text:"Subscribe for the next adventure!", duration:6, visualPrompt:"Character waving, subscribe animation overlay"},
        ],
        hashtags:["#KidsYouTube","#Animation","#MagicBalloon","#ViralShorts"],
        seoTitle:"🎈 The MAGICAL Golden Balloon | Kids Adventure 2025",
        seoDescription:"Join Johnny on the most incredible balloon adventure! Cloud kingdoms, rainbow bridges, and pure magic. New episodes every Saturday!",
        viralScore:91, wordCount:78, estimatedDuration:55,
        retentionTips:["Cut scene every 3–4s","Background music at 30% vol","Zoom punch on key moments"],
      });
      setHashResult({
        hashtags:["#KidsYouTube","#Animation","#MagicBalloon","#ViralShorts","#Shorts","#KidsContent"],
        trending:["#KidsYouTube","#ViralShorts","#Shorts"],
        niche:["#Animation","#MagicBalloon","#KidsContent"],
        broad:["#YouTube","#Animated","#ChildrenVideo"],
      });
    }
    setLoading(false);
  }

  async function generateHooks() {
    if (!topic.trim()) return;
    setHookLoading(true);
    try {
      const res = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"hooks", topic, platform, hookType:selectedHookType}) });
      const data = await res.json();
      if (data.success && data.data.hooks) setHooks(data.data.hooks);
      else throw new Error();
    } catch {
      setHooks([
        {hook:`What if "${topic}" could actually change everything you know?`,type:"curiosity",score:94,ctr:"9.2%"},
        {hook:`Nobody tells you this about ${topic} — but I will.`,type:"authority",score:91,ctr:"8.9%"},
        {hook:`I tried ${topic} every day for 30 days. Day 28 broke me.`,type:"emotional",score:88,ctr:"8.3%"},
        {hook:`The ${topic} secret that [experts] don't want you to find.`,type:"controversy",score:85,ctr:"7.9%"},
        {hook:`Your brain on ${topic}: the shocking truth 🧠`,type:"dopamine",score:82,ctr:"7.5%"},
      ]);
    }
    setHookLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Script Engine</h1>
        <p className="text-[#8B8BA8] text-sm">AI-powered viral scripts, hooks, and hashtags — optimized for each platform.</p>
      </div>

      {/* Controls */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Topic / Idea" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. magical balloon adventure for kids" onKeyDown={e=>e.key==="Enter"&&generate()} fullWidth/>
          <Select label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS}/>
          <Select label="Tone" value={tone} onChange={setTone} options={TONES}/>
          <Select label="Duration" value={duration} onChange={setDuration} options={DURATIONS}/>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={generate} loading={loading} disabled={!topic.trim()} icon={<Sparkles className="w-4 h-4"/>} glow>
            {loading?"Writing Script…":"Generate Script"}
          </Button>
          {result && <Button variant="secondary" onClick={generate} loading={loading} icon={<RefreshCw className="w-4 h-4"/>}>Regenerate</Button>}
        </div>
      </Card>

      <AnimatePresence>
        {loading && (
          <div className="space-y-4">
            {Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-32"/>)}
          </div>
        )}
      </AnimatePresence>

      {result && !loading && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="space-y-5">
          {/* Scores + tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-4">
              <ScoreRing value={result.viralScore} label="Viral Score" size={64}/>
              <ScoreRing value={Math.round(result.viralScore*0.97)} label="Hook" size={64}/>
              <ScoreRing value={Math.round(result.viralScore*0.91)} label="Retention" size={64}/>
            </div>
            <div className="flex gap-2">
              <Badge variant="sky">{result.wordCount} words</Badge>
              <Badge variant="brand">{result.estimatedDuration}s est.</Badge>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-[#111120] border border-white/[0.06] rounded-xl w-fit">
            {(["script","hooks","hashtags"] as const).map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize", activeTab===t?"bg-[#6E42F5] text-white":"text-[#8B8BA8] hover:text-white")}>{t}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "script" && (
              <motion.div key="script" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-3">
                  {[
                    {l:"Hook (0–3s)",t:result.hook,c:"#6E42F5",dot:"bg-[#6E42F5]"},
                    {l:"Body",t:result.body,c:"#42B4F5",dot:"bg-[#42B4F5]"},
                    {l:"CTA",t:result.cta,c:"#0DCCB5",dot:"bg-[#0DCCB5]"},
                  ].map(section=>(
                    <Card key={section.l} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${section.dot}`}/>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:section.c}}>{section.l}</p>
                        </div>
                        <CopyBtn text={section.t}/>
                      </div>
                      <p className="text-sm text-[#8B8BA8] leading-relaxed">{section.t}</p>
                    </Card>
                  ))}
                  {result.retentionTips?.length > 0 && (
                    <Card className="p-4" style={{background:"#F5A62308",borderColor:"#F5A62325"}}>
                      <p className="text-[10px] font-bold text-[#F5A623] uppercase tracking-widest mb-2">💡 Retention Tips</p>
                      <ul className="space-y-1.5">
                        {result.retentionTips.map((tip: string, i: number) => (
                          <li key={i} className="text-xs text-[#8B8BA8] flex gap-2"><span className="text-[#F5A623]">→</span>{tip}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-xs text-[#8B8BA8]">SEO Title</p>
                    <CopyBtn text={result.seoTitle}/>
                  </div>
                  <p className="text-sm font-semibold px-1">{result.seoTitle}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#4A4A64] font-bold uppercase tracking-widest mb-3">Scenes ({result.scenes?.length})</p>
                  <div className="space-y-2">
                    {result.scenes?.map((scene: any) => (
                      <Card key={scene.id} className="p-3 hover:border-white/[0.12] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-bold text-[#6E42F5]">Scene {scene.id}</p>
                          <Badge variant="sky">{scene.duration}s</Badge>
                        </div>
                        <p className="text-xs font-semibold mb-1">{scene.description}</p>
                        <p className="text-xs text-[#8B8BA8] italic mb-1.5">"{scene.text}"</p>
                        <p className="text-[10px] text-[#4A4A64]">🎨 {scene.visualPrompt}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hooks" && (
              <motion.div key="hooks" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-5">
                {/* Hook Lab header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6E42F5]/10 to-[#0DCCB5]/10 border border-[#6E42F5]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-[#6E42F5]"/>
                    <h3 className="font-display font-bold text-base">Hook Intelligence Lab</h3>
                    <Badge variant="brand">AI-Powered</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {HOOK_TYPES.map(ht=>(
                      <button key={ht} onClick={()=>setSelectedHookType(ht)} className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border", selectedHookType===ht?"text-white border-transparent shadow-[0_0_12px_rgba(0,0,0,0.3)]":"border-white/[0.08] text-[#8B8BA8] hover:text-white")} style={selectedHookType===ht?{background:HOOK_COLORS[ht]}:{}}>{ht}</button>
                    ))}
                  </div>
                  <Button onClick={generateHooks} loading={hookLoading} size="sm" variant="secondary" icon={<Wand2 className="w-3.5 h-3.5"/>}>Generate {selectedHookType} hooks</Button>
                </div>

                {/* Existing hook variants */}
                <div className="grid grid-cols-1 gap-3">
                  {(hooks.length > 0 ? hooks : result.hookVariants ?? []).map((h: any, i: number) => (
                    <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                      className="flex items-start justify-between gap-3 p-4 rounded-xl border border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.12] transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-display font-bold text-lg text-[#4A4A64]">#{i+1}</span>
                          {h.type && <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg" style={{background:`${HOOK_COLORS[h.type as HookType]}15`,color:HOOK_COLORS[h.type as HookType]}}>{h.type}</span>}
                          {i===0 && <Badge variant="success">Top Pick</Badge>}
                        </div>
                        <p className="text-sm leading-relaxed mb-2">{h.hook}</p>
                        <div className="flex gap-3 text-xs text-[#4A4A64]">
                          {h.ctr && <span>CTR: <span className="text-[#0DCCB5] font-semibold">{h.ctr}</span></span>}
                          {h.watchTime && <span>Watch: <span className="text-[#6E42F5] font-semibold">{h.watchTime}</span></span>}
                          {h.score && <span>Score: <span className="font-bold" style={{color:h.score>=90?"#0DCCB5":"#6E42F5"}}>{h.score}</span></span>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <CopyBtn text={h.hook}/>
                        <Button size="xs" variant="secondary">Use</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "hashtags" && hashResult && (
              <motion.div key="hashtags" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {l:"🔥 Trending", tags:hashResult.trending, c:"#F5426E", v:"danger" as const},
                    {l:"🎯 Niche", tags:hashResult.niche, c:"#6E42F5", v:"brand" as const},
                    {l:"📢 Broad Reach", tags:hashResult.broad, c:"#42B4F5", v:"sky" as const},
                  ].map(group=>(
                    <Card key={group.l} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest">{group.l}</p>
                        <CopyBtn text={group.tags?.join(" ")}/>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.tags?.map((tag: string)=><Badge key={tag} variant={group.v}>{tag}</Badge>)}
                      </div>
                    </Card>
                  ))}
                </div>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest">All Hashtags</p>
                    <CopyBtn text={hashResult.hashtags?.join(" ")}/>
                  </div>
                  <p className="text-sm text-[#8B8BA8] font-mono leading-relaxed">{hashResult.hashtags?.join(" ")}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-3xl bg-[#6E42F5]/10 border border-[#6E42F5]/20 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-10 h-10 text-[#6E42F5]"/>
          </div>
          <h3 className="font-display font-bold text-xl mb-2">Write Your First Script</h3>
          <p className="text-[#8B8BA8] text-sm max-w-sm mx-auto">Enter your topic above and let AI craft a viral-optimized script with hooks, scenes, SEO metadata, and hashtags.</p>
        </div>
      )}
    </div>
  );
}
