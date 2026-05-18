"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, Pause, Download, RefreshCw, Check, Sliders, Wand2, Volume2 } from "lucide-react";
import { Button, Card, Badge, Textarea, Select, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const VOICES = [
  { id:"21m00Tcm4TlvDq8ikWAM", name:"Rachel", style:"Calm, professional", lang:"EN", gender:"F", rating:4.9 },
  { id:"AZnzlk1XvdvUeBnXmlld", name:"Domi", style:"Strong, narrative", lang:"EN", gender:"M", rating:4.8 },
  { id:"EXAVITQu4vr4xnSDxMaL", name:"Bella", style:"Warm, friendly", lang:"EN", gender:"F", rating:4.9 },
  { id:"ErXwobaYiN019PkySvjV", name:"Antoni", style:"Deep, cinematic", lang:"EN", gender:"M", rating:4.7 },
  { id:"MF3mGyEYCl7XYWbV9V6O", name:"Elli", style:"Energetic, youthful", lang:"EN", gender:"F", rating:4.8 },
  { id:"TxGEqnHWrfWFTfGW9XjX", name:"Josh", style:"Casual, relatable", lang:"EN", gender:"M", rating:4.7 },
];

const LANGS = [
  {value:"en",label:"English"},
  {value:"hi",label:"Hindi"},
  {value:"es",label:"Spanish"},
  {value:"fr",label:"French"},
  {value:"de",label:"German"},
  {value:"pt",label:"Portuguese"},
];

const STYLES = [
  {value:"natural",label:"Natural"},
  {value:"excited",label:"Excited"},
  {value:"sad",label:"Sad"},
  {value:"angry",label:"Angry"},
  {value:"whispering",label:"Whispering"},
  {value:"storytelling",label:"Storytelling"},
];

// Waveform bar component
function WaveBar({ height, active }: { height: number; active: boolean }) {
  return (
    <motion.div
      className="w-1 rounded-full flex-shrink-0"
      style={{ height: `${height}%`, background: active ? "#6E42F5" : "#1C1C30" }}
      animate={active ? { scaleY: [1, 1.5, 1], opacity: [0.7, 1, 0.7] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 0.3 }}
    />
  );
}

export default function VoicePage() {
  const [script, setScript] = useState("What if one balloon could literally change your entire life? Join Johnny on the most incredible adventure you've ever seen. The golden balloon appeared at the edge of the park, and the moment his fingers touched it — everything changed.");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [lang, setLang] = useState("en");
  const [style, setStyle] = useState("natural");
  const [stability, setStability] = useState(0.5);
  const [clarity, setClarity] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cloneMode, setCloneMode] = useState(false);

  const voice = VOICES.find(v => v.id === selectedVoice)!;
  const waveData = Array.from({ length: 60 }, () => 20 + Math.random() * 60);

  async function generate() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setGenerated(true);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight mb-1">Voice Studio</h1>
        <p className="text-[#8B8BA8] text-sm">50+ AI voices with emotional control, multilingual support, and voice cloning.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Script + settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Script input */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest">Your Script</p>
              <div className="flex gap-2">
                <Badge variant="brand">{script.split(" ").length} words</Badge>
                <Badge variant="sky">~{Math.round(script.split(" ").length / 2.5)}s</Badge>
              </div>
            </div>
            <Textarea value={script} onChange={e=>setScript(e.target.value)} rows={5} placeholder="Paste your script here…"/>
          </Card>

          {/* Voice selector */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-[#4A4A64] uppercase tracking-widest">Select Voice</p>
              <div className="flex gap-2">
                <Select value={lang} onChange={setLang} options={LANGS} className="w-32"/>
                <Select value={style} onChange={setStyle} options={STYLES} className="w-36"/>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
              {VOICES.map(v => (
                <motion.div
                  key={v.id}
                  whileHover={{y:-1}}
                  onClick={()=>setSelectedVoice(v.id)}
                  className={cn("p-3 rounded-xl border cursor-pointer transition-all", selectedVoice===v.id?"border-[#6E42F5]/50 bg-[#6E42F5]/10 shadow-[0_0_16px_rgba(110,66,245,0.15)]":"border-white/[0.06] bg-[#0E0E1A] hover:border-white/[0.12]")}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6E42F5] to-[#0DCCB5] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{v.name[0]}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{v.name}</p>
                      <p className="text-[10px] text-[#4A4A64]">{v.lang} · {v.gender==="F"?"Female":"Male"}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#8B8BA8] mb-1">{v.style}</p>
                  <div className="flex items-center gap-1">
                    {"★★★★★".split("").map((s,i)=><span key={i} className={cn("text-[10px]",i<Math.floor(v.rating)?"text-[#F5A623]":"text-[#4A4A64]")}>{s}</span>)}
                    <span className="text-[10px] text-[#4A4A64] ml-1">{v.rating}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Voice controls */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { l:"Stability", v:stability, set:setStability, desc:"Consistency vs expressiveness" },
                { l:"Clarity", v:clarity, set:setClarity, desc:"Clarity + similarity boost" },
                { l:"Speed", v:speed, set:setSpeed, min:0.5, max:2, desc:"Speaking rate" },
              ].map(ctrl => (
                <div key={ctrl.l}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#8B8BA8]">{ctrl.l}</span>
                    <span className="font-bold text-[#6E42F5]">{ctrl.v.toFixed(1)}</span>
                  </div>
                  <input type="range" min={ctrl.min??0} max={ctrl.max??1} step={0.05} value={ctrl.v} onChange={e=>ctrl.set(parseFloat(e.target.value))} className="w-full accent-[#6E42F5]"/>
                  <p className="text-[9px] text-[#4A4A64] mt-1">{ctrl.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Generate button */}
          <Button onClick={generate} loading={loading} size="lg" glow className="w-full" icon={<Mic className="w-5 h-5"/>}>
            {loading ? "Generating voiceover…" : "Generate with ElevenLabs AI"}
          </Button>

          {/* Waveform player */}
          <AnimatePresence>
            {generated && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{voice.name} — {style}</p>
                      <Badge variant="success">Ready</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5"/>}>Regenerate</Button>
                      <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5"/>}>Download</Button>
                    </div>
                  </div>

                  {/* Waveform visualization */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-black/30 border border-white/[0.05]">
                    <button onClick={()=>setPlaying(!playing)} className="w-10 h-10 rounded-full bg-[#6E42F5] flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(110,66,245,0.4)]">
                      {playing ? <Pause className="w-4 h-4 text-white"/> : <Play className="w-4 h-4 text-white ml-0.5"/>}
                    </button>
                    <div className="flex-1 flex items-center gap-0.5 h-12">
                      {waveData.map((h, i) => <WaveBar key={i} height={h} active={playing && i < 60 * 0.35}/>)}
                    </div>
                    <div className="flex-shrink-0 text-xs font-mono text-[#8B8BA8]">
                      {playing ? "0:18" : "0:00"} / {Math.round(script.split(" ").length / 2.5)}s
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Voice Clone + tips */}
        <div className="space-y-4">
          {/* Voice cloning */}
          <Card className="p-5" style={{background:"linear-gradient(135deg,rgba(110,66,245,0.08),rgba(13,204,181,0.05))"}}>
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-4 h-4 text-[#6E42F5]"/>
              <h3 className="font-display font-bold text-sm">Voice Cloning</h3>
              <Badge variant="brand">Pro</Badge>
            </div>
            <p className="text-xs text-[#8B8BA8] leading-relaxed mb-4">Upload a 1-minute sample of your voice. AI will clone it for all future voiceovers.</p>
            <div className="border-2 border-dashed border-[#6E42F5]/30 rounded-xl p-6 text-center hover:border-[#6E42F5]/60 transition-all cursor-pointer mb-3">
              <Mic className="w-8 h-8 text-[#6E42F5]/60 mx-auto mb-2"/>
              <p className="text-xs text-[#8B8BA8]">Drop your audio file here</p>
              <p className="text-[10px] text-[#4A4A64] mt-1">MP3, WAV, M4A · Max 10MB</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" icon={<Mic className="w-3.5 h-3.5"/>}>Or Record Now</Button>
          </Card>

          {/* Multi-language */}
          <Card className="p-5">
            <h3 className="font-display font-bold text-sm mb-3">Multi-Language</h3>
            <p className="text-xs text-[#8B8BA8] mb-3 leading-relaxed">Translate and dub your script into 25+ languages with lip-sync.</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["EN","HI","ES","FR","DE","PT","AR","JA"].map(l=>(
                <span key={l} className="text-[10px] px-2 py-1 rounded-lg bg-[#6E42F5]/10 border border-[#6E42F5]/20 text-[#8B62FF] font-bold">{l}</span>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="w-full">Translate & Dub</Button>
          </Card>

          {/* Tips */}
          <Card className="p-5">
            <h3 className="font-display font-bold text-sm mb-3">Pro Tips</h3>
            <div className="space-y-2.5 text-xs text-[#8B8BA8]">
              {[
                { e:"🎯", t:"Stability 0.4–0.6 gives the most natural variation" },
                { e:"🔊", t:"Clarity at 0.75 balances quality and similarity" },
                { e:"⏱️", t:"Speed 0.9 sounds more natural than 1.0 for most content" },
                { e:"🎭", t:"Storytelling style adds 18% more emotional engagement" },
              ].map((tip,i)=>(
                <div key={i} className="flex gap-2">
                  <span>{tip.e}</span>
                  <span>{tip.t}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Generation history */}
          <Card className="p-5">
            <h3 className="font-display font-bold text-sm mb-3">Recent Generations</h3>
            <div className="space-y-2">
              {[
                { name:"Balloon Ep.3 VO", voice:"Rachel", dur:"54s", date:"Today" },
                { name:"Rainbow Bus VO", voice:"Domi", dur:"48s", date:"Yesterday" },
                { name:"Magic Garden VO", voice:"Bella", dur:"62s", date:"2 days ago" },
              ].map((h,i)=>(
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold truncate max-w-[120px]">{h.name}</p>
                    <p className="text-[10px] text-[#4A4A64]">{h.voice} · {h.dur}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#4A4A64]">{h.date}</span>
                    <button className="w-6 h-6 rounded-lg flex items-center justify-center text-[#4A4A64] hover:text-white hover:bg-white/[0.06] transition-all">
                      <Play className="w-3 h-3"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
